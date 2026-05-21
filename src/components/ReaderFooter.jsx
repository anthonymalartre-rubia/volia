import Link from 'next/link';

export default function ReaderFooter() {
  return (
    <footer className="border-t border-line py-8 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-content-muted">© 2026 Prospectia.cloud</div>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-content-muted">
          <Link href="/ressources" className="hover:text-content-secondary transition">Ressources</Link>
          <Link href="/outils" className="hover:text-content-secondary transition">Outils</Link>
          <Link href="/comparatif-outils-prospection-b2b-france" className="hover:text-content-secondary transition">Comparatif</Link>
          <Link href="/etude/prospection-b2b-france-2026" className="hover:text-content-secondary transition">Étude 2026</Link>
          <Link href="/glossaire" className="hover:text-content-secondary transition">Glossaire</Link>
          <Link href="/cgu" className="hover:text-content-secondary transition">CGU</Link>
          <Link href="/confidentialite" className="hover:text-content-secondary transition">Confidentialité</Link>
          <Link href="/rgpd" className="hover:text-content-secondary transition">RGPD</Link>
        </div>
      </div>
    </footer>
  );
}
