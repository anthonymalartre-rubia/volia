// Layout serveur pour /signup : la page est 'use client' et ne peut donc pas
// exporter de metadata. Ce layout fixe la canonical vers l'URL propre afin que
// les variantes ?plan=…&period=… (cartes pricing) soient consolidées sur une
// seule URL côté Google (corrige "Page en double sans canonique" — GSC).
export const metadata = {
  alternates: { canonical: 'https://volia.fr/signup' },
};

export default function SignupLayout({ children }) {
  return children;
}
