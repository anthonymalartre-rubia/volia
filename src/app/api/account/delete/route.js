import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function DELETE() {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const userId = user.id;

    // Delete user's data in order (respecting foreign keys)
    // 1. Delete prospect-tag associations
    await admin
      .from('prospect_tags')
      .delete()
      .eq('user_id', userId);

    // 2. Delete tags
    await admin
      .from('tags')
      .delete()
      .eq('user_id', userId);

    // 3. Delete prospects
    await admin
      .from('prospects')
      .delete()
      .eq('user_id', userId);

    // 4. Delete folders
    await admin
      .from('folders')
      .delete()
      .eq('user_id', userId);

    // 5. Delete usage tracking
    await admin
      .from('usage_tracking')
      .delete()
      .eq('user_id', userId);

    // 6. Delete search sessions
    await admin
      .from('search_sessions')
      .delete()
      .eq('user_id', userId);

    // 7. Delete user profile
    await admin
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    // 8. Delete from auth.users (must be last)
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Failed to delete auth user:', deleteError);
      return NextResponse.json({ error: 'Erreur lors de la suppression du compte' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Compte supprime avec succes' });
  } catch (err) {
    console.error('Account delete error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
