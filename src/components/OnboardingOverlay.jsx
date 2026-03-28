'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles, Search, Mail, Download, Rocket,
  ChevronRight, ChevronLeft, X, MapPin, BarChart3,
  Filter, FolderOpen, CheckCircle2,
} from 'lucide-react';

const STEPS = [
  {
    icon: Sparkles,
    iconGradient: 'from-indigo-500 to-purple-600',
    title: 'Bienvenue sur Prospectia.ai !',
    description:
      'Generez des leads B2B qualifies partout en France en quelques clics.',
    highlights: null,
  },
  {
    icon: Search,
    iconGradient: 'from-blue-500 to-cyan-500',
    title: 'Choisissez vos departements et categories',
    description:
      'Lancez une recherche automatique via Google Places pour trouver des prospects.',
    highlights: [
      { icon: MapPin, text: '101 departements couverts' },
      { icon: BarChart3, text: '150+ categories metier' },
      { icon: Filter, text: 'Recherche en langage naturel' },
    ],
  },
  {
    icon: Mail,
    iconGradient: 'from-emerald-500 to-teal-500',
    title: 'Enrichissez vos leads automatiquement',
    description:
      'Nous trouvons les emails professionnels de vos prospects par scraping intelligent.',
    highlights: [
      { icon: CheckCircle2, text: 'Emails verifies et scores' },
      { icon: BarChart3, text: 'Scoring de qualite automatique' },
    ],
  },
  {
    icon: Download,
    iconGradient: 'from-orange-500 to-amber-500',
    title: 'Exportez vers votre CRM',
    description:
      'Telechargez en CSV standard ou format Zoho CRM, pret a importer.',
    highlights: [
      { icon: Filter, text: 'Filtres avances' },
      { icon: CheckCircle2, text: 'Multi-selection par lots' },
      { icon: FolderOpen, text: 'Organisation en dossiers' },
    ],
  },
  {
    icon: Rocket,
    iconGradient: 'from-indigo-500 to-purple-600',
    title: 'Pret a prospecter ?',
    description:
      'Vous pouvez revoir ce guide a tout moment depuis les parametres.',
    highlights: null,
  },
];

export default function OnboardingOverlay({ onClose, onStartSearch }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [animating, setAnimating] = useState(false);

  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;
  const current = STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  function handleClose() {
    localStorage.setItem('onboarding_completed', 'true');
    onClose();
  }

  function goToStep(nextStep) {
    if (animating || nextStep === step) return;
    setDirection(nextStep > step ? 1 : -1);
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setAnimating(false);
    }, 150);
  }

  function handleNext() {
    if (isLast) {
      handleClose();
      onStartSearch();
    } else {
      goToStep(step + 1);
    }
  }

  function handlePrev() {
    if (!isFirst) {
      goToStep(step - 1);
    }
  }

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step, animating]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-line-hover bg-surface-card shadow-2xl overflow-hidden">

        {/* Progress bar at top */}
        <div className="h-1 w-full bg-surface-elevated">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close / Skip button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-4 text-content-tertiary hover:text-content-primary transition-colors z-10"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        {/* Step count */}
        <div className="absolute top-5 left-6 text-[11px] font-medium text-content-muted tracking-wide">
          {step + 1} / {STEPS.length}
        </div>

        {/* Content area */}
        <div
          className={`px-8 pt-12 pb-8 flex flex-col items-center text-center transition-all duration-150 ease-out ${
            animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${current.iconGradient} flex items-center justify-center mb-6 shadow-lg`}>
            <Icon size={28} className="text-white" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-content-primary mb-3 leading-tight">
            {current.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-content-secondary leading-relaxed max-w-sm">
            {current.description}
          </p>

          {/* Highlights */}
          {current.highlights && (
            <div className="mt-5 w-full max-w-xs space-y-2.5">
              {current.highlights.map((h, i) => {
                const HIcon = h.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-elevated/60 border border-line text-left"
                  >
                    <HIcon size={16} className="text-indigo-400 shrink-0" />
                    <span className="text-sm text-content-secondary">{h.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step indicator dots */}
          <div className="flex gap-2 mt-8 mb-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                aria-label={`Etape ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-7 h-2 bg-indigo-500'
                    : i < step
                      ? 'w-2 h-2 bg-indigo-500/50 hover:bg-indigo-500/70'
                      : 'w-2 h-2 bg-line-hover hover:bg-content-faint'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 w-full">
            {/* Left button: Skip or Previous */}
            {isFirst ? (
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-content-tertiary hover:text-content-secondary border border-line-hover hover:border-content-faint transition-colors"
              >
                Passer
              </button>
            ) : (
              <button
                onClick={handlePrev}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-content-tertiary hover:text-content-secondary border border-line-hover hover:border-content-faint transition-colors flex items-center justify-center gap-1.5"
              >
                <ChevronLeft size={15} />
                Precedent
              </button>
            )}

            {/* Right button: Next or Start */}
            <button
              onClick={handleNext}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20"
            >
              {isLast ? (
                <>
                  Commencer ma premiere recherche
                  <Rocket size={15} />
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
