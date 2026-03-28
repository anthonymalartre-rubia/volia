import { getAuthenticatedUser } from '@/lib/auth';
import { checkLimit, incrementUsage } from '@/lib/usage';

// ─── Personal email filtering ───────────────────────────
const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'yahoo.fr', 'hotmail.com', 'hotmail.fr',
  'outlook.com', 'outlook.fr', 'live.com', 'live.fr', 'msn.com',
  'orange.fr', 'free.fr', 'sfr.fr', 'laposte.net', 'wanadoo.fr',
  'aol.com', 'icloud.com', 'me.com', 'mac.com', 'protonmail.com',
  'proton.me', 'gmx.com', 'gmx.fr', 'mail.com', 'yandex.com',
  'zoho.com', 'fastmail.com', 'tutanota.com',
]);

function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function POST(request) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return Response.json({ error: 'Authentification requise' }, { status: 401 });

    const limitCheck = await checkLimit(supabase, user.id, 'enrichments');
    if (!limitCheck.allowed) {
      return Response.json(
        { error: "Limite d'enrichissements atteinte.", limitReached: true, ...limitCheck },
        { status: 429 }
      );
    }

    const { company_name, company_domain, linkedin_url } = await request.json();

    // ─── Mode 1: LinkedIn profile lookup ───────────────────
    if (linkedin_url) {
      const apolloKey = process.env.APOLLO_API_KEY;
      const serperKey = process.env.SERPER_API_KEY;
      let person = null;
      let source = 'none';
      let email = null;

      // Extract name from LinkedIn URL slug (free, always available)
      const slugName = linkedin_url.match(/linkedin\.com\/in\/([^/?]+)/)?.[1]
        ?.replace(/-+/g, ' ')
        ?.replace(/\d+/g, '')
        ?.trim()
        ?.split(' ')
        ?.map(w => w.charAt(0).toUpperCase() + w.slice(1))
        ?.join(' ') || null;

      // Step 1: Serper Google search (cheap — try first)
      if (serperKey && slugName) {
        try {
          const query = `"${slugName}" email linkedin`;
          const res = await fetchWithTimeout('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-KEY': serperKey },
            body: JSON.stringify({ q: query, num: 10, gl: 'fr' }),
          });
          if (res.ok) {
            const data = await res.json();
            const allText = (data.organic || []).map(r => `${r.title || ''} ${r.snippet || ''}`).join(' ');
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            const found = [...new Set((allText.match(emailRegex) || []).map(e => e.toLowerCase()))];

            // Pick best non-personal email
            const match = found.find(e => !PERSONAL_DOMAINS.has(e.split('@')[1]));
            if (match) {
              email = match;
              source = 'serper';
            }
          }
        } catch {}
      }

      // Step 2: Apollo People Match (more expensive — only if Serper didn't find email)
      if (!email && apolloKey) {
        try {
          const res = await fetchWithTimeout('https://api.apollo.io/api/v1/people/match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apolloKey },
            body: JSON.stringify({ linkedin_url, reveal_personal_emails: false }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.person) {
              person = data.person;
              if (data.person.email) {
                email = data.person.email;
                source = 'apollo';
              }
            }
          }
        } catch {}
      }

      const contactName = person
        ? [person.first_name, person.last_name].filter(Boolean).join(' ')
        : slugName;
      const companyDomain = person?.organization?.primary_domain
        || (email ? email.split('@')[1] : null);

      // Step 2b: If Serper found email but no Apollo data, try Serper with domain for better results
      if (email && !person && serperKey && companyDomain && slugName) {
        try {
          const query = `"${slugName}" email "@${companyDomain}"`;
          const res = await fetchWithTimeout('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-KEY': serperKey },
            body: JSON.stringify({ q: query, num: 10, gl: 'fr' }),
          });
          if (res.ok) {
            const data = await res.json();
            const allText = (data.organic || []).map(r => `${r.title || ''} ${r.snippet || ''}`).join(' ');
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            const found = [...new Set((allText.match(emailRegex) || []).map(e => e.toLowerCase()))];
            const domainMatch = found.find(e => e.endsWith(`@${companyDomain}`));
            if (domainMatch) {
              email = domainMatch;
            }
          }
        } catch {}
      }

      // Step 3: If still no email but we have name + domain, guess email patterns
      if (!email && contactName && companyDomain) {
        const nameParts = contactName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/);
        if (nameParts.length >= 2) {
          const first = nameParts[0];
          const last = nameParts[nameParts.length - 1];
          const patterns = [
            `${first}.${last}@${companyDomain}`,
            `${first[0]}.${last}@${companyDomain}`,
            `${first}@${companyDomain}`,
            `${first}${last}@${companyDomain}`,
            `${last}.${first}@${companyDomain}`,
            `contact@${companyDomain}`,
          ];
          email = patterns[0];
          source = source === 'none' ? 'guess' : `${source}+guess`;
        }
      }

      const contact = {
        name: contactName,
        email,
        title: person?.title || null,
        linkedin_url: person?.linkedin_url || linkedin_url,
        phone: person?.phone_numbers?.[0]?.sanitized_number || null,
        company: person?.organization?.name || null,
        company_domain: companyDomain,
      };

      // Only count as usage if we found something
      if (email || person) {
        await incrementUsage(supabase, user.id, 'enrichments');
      }

      return Response.json({
        contacts: (email || person) ? [contact] : [],
        company: person?.organization ? {
          name: person.organization.name,
          domain: person.organization.primary_domain,
          industry: person.organization.industry,
          employees: person.organization.estimated_num_employees,
          linkedin_url: person.organization.linkedin_url,
        } : null,
        source,
      });
    }

    // ─── Mode 2: Company contacts search ───────────────────
    if (!company_name && !company_domain) {
      return Response.json({ error: 'company_name ou company_domain requis' }, { status: 400 });
    }

    const apolloKey = process.env.APOLLO_API_KEY;
    const serperKey = process.env.SERPER_API_KEY;
    let contacts = [];
    let companyInfo = null;

    // Step 1: Try Apollo People Search (best source)
    if (apolloKey) {
      try {
        const searchBody = {
          per_page: 10,
          reveal_personal_emails: false,
        };

        if (company_domain) {
          searchBody.q_organization_domains = company_domain;
        } else {
          searchBody.q_organization_name = company_name;
        }

        const res = await fetchWithTimeout('https://api.apollo.io/api/v1/mixed_people/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apolloKey },
          body: JSON.stringify(searchBody),
        });

        if (res.ok) {
          const data = await res.json();
          const people = data.people || [];

          // Get org info from first result
          if (people[0]?.organization) {
            const org = people[0].organization;
            companyInfo = {
              name: org.name,
              domain: org.primary_domain,
              industry: org.industry,
              employees: org.estimated_num_employees,
              linkedin_url: org.linkedin_url,
            };
          }

          // Score people: prefer those with email, seniority titles, and LinkedIn
          const SENIOR_KEYWORDS = ['ceo', 'founder', 'president', 'director', 'directeur', 'gérant', 'owner', 'coo', 'cto', 'cfo', 'manager', 'responsable', 'chef', 'head'];
          const scored = people
            .filter(p => {
              // Filter out personal emails
              if (p.email && PERSONAL_DOMAINS.has(p.email.split('@')[1]?.toLowerCase())) return false;
              // Must have at least a name
              return p.first_name || p.last_name;
            })
            .map(p => {
              let score = 0;
              if (p.email) score += 50;
              if (p.linkedin_url) score += 20;
              if (p.title) {
                const titleLower = p.title.toLowerCase();
                if (SENIOR_KEYWORDS.some(k => titleLower.includes(k))) score += 30;
              }
              if (p.phone_numbers?.length > 0) score += 10;
              return { ...p, _score: score };
            })
            .sort((a, b) => b._score - a._score);

          contacts = scored.slice(0, 5).map(p => ({
            name: [p.first_name, p.last_name].filter(Boolean).join(' '),
            email: p.email || null,
            title: p.title || null,
            linkedin_url: p.linkedin_url || null,
            phone: p.phone_numbers?.[0]?.sanitized_number || null,
            company: p.organization?.name || company_name,
            company_domain: p.organization?.primary_domain || company_domain,
          }));
        }
      } catch {}
    }

    // Step 2: If no contacts from Apollo, try Serper to find company info
    if (contacts.length === 0 && serperKey) {
      try {
        const query = company_domain
          ? `"${company_domain}" contact email dirigeant`
          : `"${company_name}" contact email dirigeant`;

        const res = await fetchWithTimeout('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-KEY': serperKey },
          body: JSON.stringify({ q: query, num: 10, gl: 'fr', hl: 'fr' }),
        });

        if (res.ok) {
          const data = await res.json();
          const allText = (data.organic || []).map(r => `${r.title || ''} ${r.snippet || ''}`).join(' ');

          // Extract emails from search results
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          const foundEmails = [...new Set((allText.match(emailRegex) || []).map(e => e.toLowerCase()))];

          const domain = company_domain || '';
          const validEmails = foundEmails.filter(e => {
            const emailDomain = e.split('@')[1];
            if (PERSONAL_DOMAINS.has(emailDomain)) return false;
            if (domain && emailDomain.includes(domain)) return true;
            return !domain; // accept all if no domain filter
          }).slice(0, 3);

          contacts = validEmails.map(email => ({
            name: null,
            email,
            title: null,
            linkedin_url: null,
            phone: null,
            company: company_name || null,
            company_domain: company_domain || email.split('@')[1],
          }));

          // Try to find LinkedIn from Serper
          const linkedinQuery = `site:linkedin.com/company "${company_name || company_domain}"`;
          const linkedinRes = await fetchWithTimeout('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-KEY': serperKey },
            body: JSON.stringify({ q: linkedinQuery, num: 3 }),
          });

          if (linkedinRes.ok) {
            const linkedinData = await linkedinRes.json();
            const linkedinUrl = linkedinData.organic?.find(r => r.link?.includes('linkedin.com/company/'))?.link;
            if (linkedinUrl) {
              companyInfo = { ...(companyInfo || {}), linkedin_url: linkedinUrl, name: company_name };
            }
          }
        }
      } catch {}
    }

    // Step 3: If still nothing, try Apollo org enrichment for company info
    if (!companyInfo && apolloKey && company_domain) {
      try {
        const res = await fetchWithTimeout('https://api.apollo.io/v1/organizations/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apolloKey },
          body: JSON.stringify({ domain: company_domain }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.organization) {
            companyInfo = {
              name: data.organization.name,
              domain: data.organization.primary_domain || company_domain,
              industry: data.organization.industry,
              employees: data.organization.estimated_num_employees,
              linkedin_url: data.organization.linkedin_url,
              phone: data.organization.phone,
              website: data.organization.website_url,
            };
          }
        }
      } catch {}
    }

    await incrementUsage(supabase, user.id, 'enrichments');
    return Response.json({
      contacts,
      company: companyInfo,
      source: contacts.length > 0 ? 'apollo' : 'none',
    });
  } catch (error) {
    console.error('Company contacts error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
