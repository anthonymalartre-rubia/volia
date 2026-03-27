import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET() {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    // Check admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 403 });
    }

    // Use admin client to list auth users
    const admin = getSupabaseAdmin();
    const { data: { users }, error } = await admin.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return minimal user info keyed by id
    const userMap = {};
    users.forEach(u => {
      userMap[u.id] = { email: u.email, created_at: u.created_at };
    });

    return NextResponse.json({ users: userMap });
  } catch (err) {
    console.error('Admin users error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
