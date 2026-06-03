// Cron mensuel d'envoi de la newsletter Volia.
//
// Stratégie :
//   - Schedule : 1er du mois à 9h (cf. vercel.json "0 9 1 * *")
//   - Récupère le dernier article publié + une stat marché du mois
//   - Envoie en batch aux subscribers actifs (non unsubscribed)
//   - Auth via CRON_SECRET header
//
// Limite : Resend ~10 emails/sec → on chunke par 50 et on attend 5s entre.
// Pour 5000 subscribers, comptez ~10 min total.

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendEmail } from '@/lib/email';
import { newsletterMonthlyEmail } from '@/lib/emailTemplates';
import { getAllPosts } from '@/lib/blog';
import { cleanEnv } from '@/lib/envClean';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BATCH_SIZE = 50;

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

// Stats sectorielles tournantes (1 par mois)
const MONTHLY_STATS = [
  { headline: 'Apollo couvre mal la France', body: 'Notre cascade waterfall trouve un email pro vérifié dans ~46 % des cas quand l\'entreprise a un site — et ne le devine jamais.' },
  { headline: '+18 % de coût matière en restauration depuis 2022', body: 'C\'est l\'objection N°1 des restaurateurs en cold email. Anticipez-la dans votre accroche.' },
  { headline: '92 j de délai moyen de vente immobilière en 2024', body: 'Soit +25 j vs 2021. Les agences immo prospectent les vendeurs en amont — votre opportunité.' },
  { headline: '15 000 postes ouverts en plomberie', body: 'Les artisans BTP sont en sur-charge — démarchez les soirs (19h-21h) et hivers (intersaison).' },
  { headline: '34 h de formation pro/an par salarié en moyenne', body: 'Marché formation pro = 5 Md€/an. Cibler les RH des PME 50-250 salariés.' },
];

export async function GET(request) {
  const expected = cleanEnv(process.env.CRON_SECRET);
  const provided = request.headers.get('authorization');
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // 1. Récupère l'article le plus récent publié
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const posts = getAllPosts()
    .filter((p) => p.publishedAt && p.publishedAt <= todayIso)
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  const featured = posts[0];

  // 2. Stat du mois (rotation déterministe)
  const monthIdx = now.getMonth();
  const stat = MONTHLY_STATS[monthIdx % MONTHLY_STATS.length];
  const monthLabel = `${MONTHS_FR[monthIdx]} ${now.getFullYear()}`;

  // 3. Récup tous les subscribers actifs
  const { data: subs, error: fetchErr } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, unsubscribe_token')
    .is('unsubscribed_at', null)
    .order('subscribed_at', { ascending: true });

  if (fetchErr) {
    console.error('[cron/newsletter] fetch error', fetchErr);
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'Aucun subscriber actif' });
  }

  let sent = 0;
  let failed = 0;
  const errors = [];

  // 4. Envoi en batchs
  for (let i = 0; i < subs.length; i += BATCH_SIZE) {
    const batch = subs.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(batch.map(async (sub) => {
      try {
        const tpl = newsletterMonthlyEmail({
          unsubscribeToken: sub.unsubscribe_token,
          featuredArticleTitle: featured?.title || '',
          featuredArticleUrl: featured ? `https://volia.fr/blog/${featured.slug}` : '',
          featuredArticleTeaser: featured?.description || '',
          resourceTitle: '20 templates cold email B2B (PDF gratuit)',
          monthLabel,
          statHeadline: stat.headline,
          statBody: stat.body,
        });
        const r = await sendEmail({ to: sub.email, subject: tpl.subject, html: tpl.html });
        if (r.success) {
          // Update tracking côté DB
          await supabase
            .from('newsletter_subscribers')
            .update({
              last_email_sent_at: new Date().toISOString(),
              emails_sent_count: sub.emails_sent_count ? sub.emails_sent_count + 1 : 1,
            })
            .eq('id', sub.id);
          return { ok: true };
        }
        errors.push({ email: sub.email, error: r.error });
        return { ok: false };
      } catch (e) {
        errors.push({ email: sub.email, error: e.message });
        return { ok: false };
      }
    }));

    sent += results.filter((r) => r.ok).length;
    failed += results.filter((r) => !r.ok).length;

    // Pause entre batchs pour rester sous la rate limit Resend
    if (i + BATCH_SIZE < subs.length) {
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  return NextResponse.json({
    ok: true,
    total_subscribers: subs.length,
    sent,
    failed,
    featured_post: featured?.slug,
    month_label: monthLabel,
    errors_sample: errors.slice(0, 5),
  });
}
