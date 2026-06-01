'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => typeof window !== 'undefined' && window.print()}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 font-semibold text-xs"
    >
      <Printer size={12} /> Imprimer / Enregistrer en PDF
    </button>
  );
}
