// /faq — Page FAQ dédiée
// La FAQ vivait sur la home ; déplacée ici (page dédiée) pour alléger la
// landing. Les liens "FAQ" du menu (LandingContent + MarketingHeader) pointent
// désormais vers /faq. Le schema FAQPage (rich snippet Google) vit ici, là où
// le contenu Q/R est réellement affiché (exigence structured-data Google).
import MarketingHeader from '@/components/MarketingHeader';
import ReaderFooter from '@/components/ReaderFooter';
import FAQSection from '@/components/FAQSection';
import { FAQ_ITEMS } from '@/lib/faq-data';

export const metadata = {
  title: 'FAQ — Volia',
  description:
    'Toutes les réponses sur Volia : Autopilot, prospection B2B, enrichissement email, RGPD, tarifs et comparaison avec les autres outils.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ — Volia',
    description: 'Questions fréquentes sur Volia (Autopilot, prospection B2B, RGPD, tarifs).',
    url: 'https://volia.fr/faq',
  },
};

const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <MarketingHeader />
      <main className="bg-surface-base min-h-screen">
        <FAQSection />
      </main>
      <ReaderFooter />
    </>
  );
}
