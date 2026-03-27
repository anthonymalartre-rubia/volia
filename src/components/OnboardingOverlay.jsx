'use client';

import { useState } from 'react';
import { Sparkles, Search, Mail, Download, ChevronRight, X } from 'lucide-react';

const STEPS = [
  {
    icon: Sparkles,
    title: 'Bienvenue',
    description:
      'Bienvenue sur Prospect IA ! G\u00e9n\u00e9rez des leads B2B qualifi\u00e9s dans les DOM-TOM en quelques clics.',
  },
  {
    icon: Search,
    title: 'Recherche',
    description:
      'S\u00e9lectionnez vos d\u00e9partements et cat\u00e9gories, puis lancez une recherche automatique via Google Places.',
  },
  {
    icon: Mail,
    title: 'Enrichissement',
    description:
      'Les emails sont automatiquement trouv\u00e9s par notre syst\u00e8me d\u2019enrichissement multi-sources.',
  },
  {
    icon: Download,
    title: 'Export',
    description:
      'Exportez vos leads en CSV ou au format Zoho CRM. C\u2019est parti !',
  },
];

export default function OnboardingOverlay({ onClose, onStartSearch }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const Icon = current.icon;

  function handleClose() {
    localStorage.setItem('onboarding_completed', 'true');
    onClose();
  }

  function handleNext() {
    if (isLast) {
      handleClose();
      onStartSearch();
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-[#27272a] bg-[#111114] shadow-2xl">
        {/* Close / Skip button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#71717a] hover:text-[#fafafa] transition-colors"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
            <Icon size={26} className="text-white" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-[#fafafa] mb-2">
            {current.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-[#a1a1aa] leading-relaxed max-w-xs">
            {current.description}
          </p>

          {/* Step dots */}
          <div className="flex gap-2 mt-8 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-indigo-500'
                    : i < step
                      ? 'w-1.5 bg-indigo-500/50'
                      : 'w-1.5 bg-[#27272a]'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#71717a] hover:text-[#a1a1aa] border border-[#27272a] hover:border-[#3f3f46] transition-colors"
            >
              Passer
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20"
            >
              {isLast ? 'Commencer' : 'Suivant'}
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
