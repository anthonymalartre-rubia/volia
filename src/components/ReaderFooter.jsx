'use client';

import Link from 'next/link';
import { openCookieModal } from '@/lib/cookieConsent';

export default function ReaderFooter() {
  return (
    <footer className="border-t border-line py-8 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-content-muted">© 2026 Volia.fr</div>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-content-muted">
          <Link href="/ressources" className="hover:text-content-secondary transition">Ressources</Link>
          <Link href="/outils" className="hover:text-content-secondary transition">Outils</Link>
          <Link href="/comparatif-outils-prospection-b2b-france" className="hover:text-content-secondary transition">Comparatif</Link>
          <Link href="/comparatif/apollo-vs-volia" className="hover:text-content-secondary transition">vs Apollo</Link>
          <Link href="/comparatif/lemlist-vs-volia" className="hover:text-content-secondary transition">vs Lemlist</Link>
          <Link href="/comparatif/hubspot-vs-volia" className="hover:text-content-secondary transition">vs HubSpot</Link>
          <Link href="/etude/prospection-b2b-france-2026" className="hover:text-content-secondary transition">Étude prospection</Link>
          <Link href="/etude/etat-cold-email-france-2026" className="hover:text-content-secondary transition">Étude cold email</Link>
          <Link href="/glossaire" className="hover:text-content-secondary transition">Glossaire</Link>
          <Link href="/affiliation" className="hover:text-content-secondary transition">Devenir apporteur</Link>
          <Link href="/mcp" className="hover:text-content-secondary transition">MCP (agents IA)</Link>
          <Link href="/cgu" className="hover:text-content-secondary transition">CGU</Link>
          <Link href="/cgv" className="hover:text-content-secondary transition">CGV</Link>
          <Link href="/dpa" className="hover:text-content-secondary transition">DPA</Link>
          <Link href="/confidentialite" className="hover:text-content-secondary transition">Confidentialité</Link>
          <Link href="/sous-traitants" className="hover:text-content-secondary transition">Sous-traitants</Link>
          <Link href="/rgpd" className="hover:text-content-secondary transition">RGPD</Link>
          <Link href="/cookies" className="hover:text-content-secondary transition">Cookies</Link>
          <button
            type="button"
            onClick={openCookieModal}
            className="hover:text-content-secondary transition cursor-pointer"
          >
            Gérer mes cookies
          </button>
          <span aria-hidden="true" className="text-content-muted">|</span>
          <Link href="/" className="hover:text-content-secondary transition" hrefLang="fr">FR</Link>
          <Link href="/en" className="hover:text-content-secondary transition" hrefLang="en">EN</Link>
        </div>
      </div>
    </footer>
  );
}
