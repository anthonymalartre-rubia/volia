import CookiesClient from './CookiesClient';

export const metadata = {
  title: 'Gestion des cookies — Volia.fr',
  description:
    "Liste exhaustive des cookies déposés par Volia, gestion de votre consentement (CNIL). Modifiez vos préférences à tout moment.",
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return <CookiesClient />;
}
