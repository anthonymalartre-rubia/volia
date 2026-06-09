// Layout serveur pour /login : la page est 'use client' (pas de metadata
// possible dessus). Canonical auto-référente pour éviter que d'éventuels
// paramètres de requête créent des doublons côté Google.
export const metadata = {
  alternates: { canonical: 'https://volia.fr/login' },
};

export default function LoginLayout({ children }) {
  return children;
}
