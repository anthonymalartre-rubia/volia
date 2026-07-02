'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { safeStorage } from './safe-storage';

const ThemeContext = createContext({ theme: 'light', toggle: () => {} });

// Seules les pages "app" (authentifiées) honorent le thème sombre choisi par
// l'utilisateur. TOUT le reste (landing, produits, pricing, blog, /vs…) est
// forcé en clair : la landing est conçue light-first et le dark cassait le
// contraste de plusieurs sections (cartes/bandeaux à fond clair codé en dur).
// NB : doit rester synchro avec le script inline anti-FOUC dans layout.js.
export const APP_DARK_PREFIXES = ['/dashboard', '/app', '/admin', '/settings', '/onboarding', '/parrainage', '/notifications'];
function isAppPath(p) {
  if (!p) return false;
  return APP_DARK_PREFIXES.some((a) => p === a || p.startsWith(a + '/'));
}

export function ThemeProvider({ children }) {
  // Default theme is LIGHT pour tout le monde (décision rebrand Volia
  // mai 2026). On n'honore PLUS prefers-color-scheme: dark — sinon les
  // users macOS dark mode (souvent pas notre ICP) voient l'app en dark
  // alors que la cible sales/commerciaux B2B est habituée au light
  // (HubSpot, Salesforce, LinkedIn — tous light).
  // Les users peuvent toggle en dark via ThemeToggle, choix persisté.
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = safeStorage.get('theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
    // Sinon : reste 'light' (défaut) — pas de détection OS
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    // Hors app → toujours clair. Dans l'app → on honore le choix utilisateur.
    const effectiveDark = isAppPath(pathname) && theme === 'dark';
    if (effectiveDark) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
    // On persiste le CHOIX de l'utilisateur (pas le clair forcé) pour qu'il
    // retrouve son dark en revenant dans l'app.
    safeStorage.set('theme', theme);
  }, [theme, mounted, pathname]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // NB : on ne gate PLUS le rendu sur `mounted` (ex-`if (!mounted) return null`).
  // Ce guard anti-flash rendait null côté serveur → TOUT le contenu du site
  // disparaissait du HTML prerendu (SSR body vide, P2 SEO/LCP : crawlers
  // non-JS, reader modes). L'anti-FOUC est déjà assuré par le script inline
  // dans layout.js (classe `light` posée sur <html> avant le paint) — les
  // tokens CSS dépendent de cette classe, pas du state React. Pas de
  // mismatch d'hydratation : serveur et 1er rendu client partent tous deux
  // de theme='light'.
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
