// ─────────────────────────────────────────────────────────────────────
// GET /api/admin/forms/[id]/qr — PNG QR code vers /f/[slug]
// ─────────────────────────────────────────────────────────────────────
// Génère un PNG 512x512 via la lib `qrcode`. Renvoie l'image
// directement avec Content-Disposition: attachment pour le download.
// ─────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getAuthenticatedUser } from '@/lib/auth';
import { cleanEnv } from '@/lib/envClean';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { data: form, error } = await supabase
    .from('forms')
    .select('id, slug, name, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !form) {
    return NextResponse.json({ error: 'Formulaire introuvable' }, { status: 404 });
  }

  const baseUrl = cleanEnv(process.env.NEXT_PUBLIC_APP_URL) || 'https://volia.fr';
  const url = `${baseUrl}/f/${form.slug}`;

  try {
    const png = await QRCode.toBuffer(url, {
      type: 'png',
      width: 512,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    });
    return new Response(png, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qrcode-${form.slug}.png"`,
      },
    });
  } catch (e) {
    console.error('[forms/qr] generation failed', e);
    return NextResponse.json({ error: 'Génération QR échouée' }, { status: 500 });
  }
}
