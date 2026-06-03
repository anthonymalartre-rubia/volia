'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeStorage } from './safe-storage';

const ThemeContext = createContext({ theme: 'light', toggle: () => {} });

export function ThemeProvider({ children }) {
  // Default theme is LIGHT pour tout le monde (décision rebrand Volia
  // mai 2026). On n'honore PLUS prefers-color-scheme: dark — sinon les
  // users macOS dark mode (souvent pas notre ICP) voient l'app en dark
  // alors que la cible sales/commerciaux B2B est habituée au light
  // (HubSpot, Salesforce, LinkedIn — tous light).
  // Les users peuvent toggle en dark via ThemeToggle, choix persisté.
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

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
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    safeStorage.set('theme', theme);
  }, [theme, mounted]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Prevent flash of wrong theme
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
