import { getAuthenticatedUser } from '@/lib/auth';

const APOLLO_API_URL = 'https://api.apollo.io/v1/people/match';

export async function POST(request) {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) return Response.json({ error: 'Non autorise' }, { status: 401 });

    const apiKey = process.env.APOLLO_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'APOLLO_API_KEY not configured' },
        { status: 500 }
      );
    }

    const { name, domain, organization } = await request.json();

    if (!domain && !organization) {
      return Response.json(
        { error: 'domain or organization required' },
        { status: 400 }
      );
    }

    // Apollo People Match API
    const response = await fetch(APOLLO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        name: name || undefined,
        domain: domain || undefined,
        organization_name: organization || undefined,
        reveal_personal_emails: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apollo API error:', errorText);
      return Response.json(
        { error: `Apollo API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const person = data.person;

    if (!person) {
      // Fallback: try organization enrichment to find general email
      const orgResponse = await fetch('https://api.apollo.io/v1/organizations/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          domain: domain || undefined,
        }),
      });

      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        const org = orgData.organization;
        if (org) {
          return Response.json({
            email: null,
            organization: {
              name: org.name,
              industry: org.industry,
              estimated_num_employees: org.estimated_num_employees,
              phone: org.phone,
              linkedin_url: org.linkedin_url,
              website_url: org.website_url,
            },
            source: 'apollo-org',
          });
        }
      }

      return Response.json({ email: null, source: 'apollo-no-match' });
    }

    return Response.json({
      email: person.email || null,
      first_name: person.first_name,
      last_name: person.last_name,
      title: person.title,
      linkedin_url: person.linkedin_url,
      phone: person.phone_numbers?.[0]?.sanitized_number || null,
      organization: person.organization ? {
        name: person.organization.name,
        industry: person.organization.industry,
        estimated_num_employees: person.organization.estimated_num_employees,
      } : null,
      source: 'apollo',
    });
  } catch (error) {
    console.error('Apollo enrichment error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
