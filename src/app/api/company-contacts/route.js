import { getAuthenticatedUser } from '@/lib/auth';
import { checkLimit, incrementUsage } from '@/lib/usage';
import { PERSONAL_DOMAINS } from '@/lib/constants';

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
        } catch (e) { console.error('[company-contacts] Serper search échec (clé/quota ?):', e?.message || e); }
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
        } catch (e) { console.error('[company-contacts] Apollo match échec (clé/quota ?):', e?.message || e); }
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
        } catch (e) { console.error('[company-contacts] Serper domaine échec (clé/quota ?):', e?.message || e); }
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
    // Track discovered domain — may be provided or discovered during search
    let discoveredDomain = company_domain || null;

    // ── Helper: extract root domain from a URL ──────────────────────
    function extractDomain(url) {
      try {
        const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
        return hostname.replace(/^www\./, '');
      } catch { return null; }
    }

    // Step 1: Try Serper first (cheaper) — search for employees + emails on Google
    if (serperKey) {
      try {
        // 1a: Search for emails on Google
        const emailQuery = discoveredDomain
          ? `"@${discoveredDomain}" OR "${discoveredDomain}" email contact`
          : `"${company_name}" email contact dirigeant`;

        const emailRes = await fetchWithTimeout('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-KEY': serperKey },
          body: JSON.stringify({ q: emailQuery, num: 10, gl: 'fr', hl: 'fr' }),
        });

        let foundEmails = [];
        if (emailRes.ok) {
          const data = await emailRes.json();
          const allText = (data.organic || []).map(r => `${r.title || ''} ${r.snippet || ''}`).join(' ');
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          foundEmails = [...new Set((allText.match(emailRegex) || []).map(e => e.toLowerCase()))];
          // Filter: keep domain-matching emails, or all non-personal if no domain specified
          foundEmails = foundEmails.filter(e => {
            const emailDomain = e.split('@')[1];
            if (PERSONAL_DOMAINS.has(emailDomain)) return false;
            if (discoveredDomain) return emailDomain === discoveredDomain || emailDomain.endsWith(`.${discoveredDomain}`);
            return true;
          }).slice(0, 5);

          // If no domain was provided, infer from found emails
          if (!discoveredDomain && foundEmails.length > 0) {
            discoveredDomain = foundEmails[0].split('@')[1];
          }
        }

        // 1b: Search for employee LinkedIn profiles
        const searchTerm = company_name || discoveredDomain;
        const linkedinPeopleQuery = `site:linkedin.com/in "${searchTerm}"`;
        const linkedinPeopleRes = await fetchWithTimeout('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-KEY': serperKey },
          body: JSON.stringify({ q: linkedinPeopleQuery, num: 10, gl: 'fr' }),
        });

        let linkedinProfiles = [];
        if (linkedinPeopleRes.ok) {
          const data = await linkedinPeopleRes.json();
          linkedinProfiles = (data.organic || [])
            .filter(r => r.link?.includes('linkedin.com/in/'))
            .map(r => {
              // Extract name from title (usually "Prénom Nom - Titre - Entreprise | LinkedIn")
              const titleParts = (r.title || '').split(/\s*[-–—|]\s*/);
              const name = titleParts[0]?.replace(/\s*LinkedIn$/, '')?.trim() || null;
              const title = titleParts[1]?.trim() || null;
              return { name, title, linkedin_url: r.link, snippet: r.snippet || '' };
            })
            .filter(p => p.name && p.name.length > 2)
            .slice(0, 5);
        }

        // 1c: Merge emails + LinkedIn profiles into contacts
        if (linkedinProfiles.length > 0) {
          const domain = discoveredDomain || '';
          contacts = linkedinProfiles.map((profile, i) => {
            // Try to match an email with this person
            let email = null;
            if (profile.name && domain) {
              const nameParts = profile.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/);
              if (nameParts.length >= 2) {
                const first = nameParts[0];
                const last = nameParts[nameParts.length - 1];
                const patterns = [
                  `${first}.${last}@${domain}`,
                  `${first[0]}.${last}@${domain}`,
                  `${first}@${domain}`,
                  `${first}${last}@${domain}`,
                ];
                // Check if any guessed pattern was actually found by Serper
                email = foundEmails.find(e => patterns.includes(e)) || null;
              }
            }
            // If no matched email, assign from remaining found emails
            if (!email && foundEmails[i]) {
              email = foundEmails[i];
            }
            return {
              name: profile.name,
              email,
              title: profile.title,
              linkedin_url: profile.linkedin_url,
              phone: null,
              company: company_name || null,
              company_domain: discoveredDomain || (email ? email.split('@')[1] : null),
            };
          });
        } else if (foundEmails.length > 0) {
          // No LinkedIn profiles found, just return emails
          contacts = foundEmails.map(email => ({
            name: null,
            email,
            title: null,
            linkedin_url: null,
            phone: null,
            company: company_name || null,
            company_domain: discoveredDomain || email.split('@')[1],
          }));
        }

        // 1d: Find company LinkedIn page + discover website domain
        const linkedinCompanyQuery = `site:linkedin.com/company "${searchTerm}"`;
        const linkedinRes = await fetchWithTimeout('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-KEY': serperKey },
          body: JSON.stringify({ q: linkedinCompanyQuery, num: 3 }),
        });

        if (linkedinRes.ok) {
          const linkedinData = await linkedinRes.json();
          const linkedinUrl = linkedinData.organic?.find(r => r.link?.includes('linkedin.com/company/'))?.link;
          if (linkedinUrl) {
            companyInfo = { ...(companyInfo || {}), linkedin_url: linkedinUrl, name: company_name };
          }
        }

        // 1e: If no domain yet, search for the company website on Google
        if (!discoveredDomain && company_name) {
          try {
            const siteQuery = `"${company_name}" site officiel`;
            const siteRes = await fetchWithTimeout('https://google.serper.dev/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-API-KEY': serperKey },
              body: JSON.stringify({ q: siteQuery, num: 5, gl: 'fr' }),
            });
            if (siteRes.ok) {
              const siteData = await siteRes.json();
              // Find the first non-social, non-directory result
              const SKIP_DOMAINS = ['linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'google.com', 'wikipedia.org', 'pagesjaunes.fr', 'societe.com', 'infogreffe.fr', 'pappers.fr', 'verif.com'];
              const match = (siteData.organic || []).find(r => {
                const d = extractDomain(r.link);
                return d && !SKIP_DOMAINS.some(skip => d === skip || d.endsWith(`.${skip}`));
              });
              if (match) {
                discoveredDomain = extractDomain(match.link);
                companyInfo = { ...(companyInfo || {}), domain: discoveredDomain, website: match.link, name: company_name };
              }
            }
          } catch {}
        }

        // 1f: If domain discovered and no contacts yet, search emails with the domain
        if (discoveredDomain && contacts.length === 0 && foundEmails.length === 0) {
          try {
            const domainEmailQuery = `"@${discoveredDomain}" OR "${discoveredDomain}" email`;
            const domainEmailRes = await fetchWithTimeout('https://google.serper.dev/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-API-KEY': serperKey },
              body: JSON.stringify({ q: domainEmailQuery, num: 10, gl: 'fr' }),
            });
            if (domainEmailRes.ok) {
              const data = await domainEmailRes.json();
              const allText = (data.organic || []).map(r => `${r.title || ''} ${r.snippet || ''}`).join(' ');
              const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
              const domainEmails = [...new Set((allText.match(emailRegex) || []).map(e => e.toLowerCase()))]
                .filter(e => {
                  const d = e.split('@')[1];
                  return !PERSONAL_DOMAINS.has(d) && (d === discoveredDomain || d.endsWith(`.${discoveredDomain}`));
                })
                .slice(0, 5);
              if (domainEmails.length > 0) {
                contacts = domainEmails.map(email => ({
                  name: null,
                  email,
                  title: null,
                  linkedin_url: null,
                  phone: null,
                  company: company_name || null,
                  company_domain: discoveredDomain,
                }));
              }
            }
          } catch {}
        }
      } catch {}
    }

    // Step 2: Try Apollo People Search (more expensive — only if Serper found nothing)
    if (contacts.length === 0 && apolloKey) {
      try {
        const searchBody = {
          per_page: 10,
          reveal_personal_emails: false,
        };

        if (discoveredDomain) {
          searchBody.q_organization_domains = discoveredDomain;
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
            // Discover domain from Apollo if we didn't have one
            if (!discoveredDomain && org.primary_domain) {
              discoveredDomain = org.primary_domain;
            }
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
            company_domain: p.organization?.primary_domain || discoveredDomain,
          }));
        }
      } catch {}
    }

    // Step 3: If no org info yet, try Apollo org enrichment with discovered domain
    if (!companyInfo && apolloKey && discoveredDomain) {
      try {
        const res = await fetchWithTimeout('https://api.apollo.io/v1/organizations/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apolloKey },
          body: JSON.stringify({ domain: discoveredDomain }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.organization) {
            companyInfo = {
              name: data.organization.name,
              domain: data.organization.primary_domain || discoveredDomain,
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

    // Step 4: Fallback — generate generic email patterns for discovered domain
    if (contacts.length === 0 && discoveredDomain) {
      const genericEmails = [
        `contact@${discoveredDomain}`,
        `info@${discoveredDomain}`,
        `direction@${discoveredDomain}`,
      ];
      contacts = genericEmails.map(email => ({
        name: null,
        email,
        title: 'Contact general',
        linkedin_url: null,
        phone: null,
        company: companyInfo?.name || company_name || null,
        company_domain: discoveredDomain,
      }));
    }

    await incrementUsage(supabase, user.id, 'enrichments');

    // Determine source based on what found the contacts
    let contactSource = 'none';
    if (contacts.length > 0) {
      const hasLinkedin = contacts.some(c => c.linkedin_url?.includes('linkedin.com/in/'));
      const hasEmail = contacts.some(c => c.email);
      if (hasLinkedin) contactSource = 'serper';
      else if (hasEmail && contacts[0]?.email?.startsWith('contact@')) contactSource = 'guess';
      else contactSource = 'apollo';
    }

    return Response.json({
      contacts,
      company: companyInfo,
      source: contactSource,
    });
  } catch (error) {
    console.error('Company contacts error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
