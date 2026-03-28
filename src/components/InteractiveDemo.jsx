"use client";

import { useState, useEffect } from "react";
import { MapPin, Search, Users, Mail, CheckCircle, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const DEMO_STEPS = [
  {
    id: 1,
    label: "Selection de Paris...",
    icon: MapPin,
    duration: 3000,
  },
  {
    id: 2,
    label: "Recherche de restaurants...",
    icon: Search,
    duration: 3000,
  },
  {
    id: 3,
    label: "47 prospects trouves",
    icon: Users,
    duration: 3000,
  },
  {
    id: 4,
    label: "Enrichissement emails...",
    icon: Mail,
    duration: 3000,
  },
  {
    id: 5,
    label: "23 emails trouves !",
    icon: CheckCircle,
    duration: 4000,
  },
];

const FAKE_RESULTS = [
  { nom: "Le Petit Cler", adresse: "29 Rue Cler, 75007 Paris", telephone: "01 45 51 49 32", email: null, site: "lepetitcler.fr" },
  { nom: "Chez Janou", adresse: "2 Rue Roger Verlomme, 75003", telephone: "01 42 72 28 41", email: null, site: "chezjanou.com" },
  { nom: "Le Bouillon Chartier", adresse: "7 Rue du Faubourg Montmartre", telephone: "01 47 70 86 29", email: null, site: "bouillon-chartier.com" },
  { nom: "Brasserie Lipp", adresse: "151 Boulevard Saint-Germain", telephone: "01 45 48 53 91", email: null, site: "brasserielipp.fr" },
];

const FAKE_EMAILS = [
  "contact@lepetitcler.fr",
  null,
  "reservation@bouillon-chartier.com",
  "info@brasserielipp.fr",
];

export default function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    let stepIndex = 0;
    let timeout;

    const advance = () => {
      stepIndex++;
      if (stepIndex >= DEMO_STEPS.length) {
        // Pause at end then restart
        timeout = setTimeout(() => {
          stepIndex = 0;
          setCurrentStep(0);
          setCycleKey((k) => k + 1);
          timeout = setTimeout(advance, DEMO_STEPS[0].duration);
        }, 2000);
      } else {
        setCurrentStep(stepIndex);
        timeout = setTimeout(advance, DEMO_STEPS[stepIndex].duration);
      }
    };

    timeout = setTimeout(advance, DEMO_STEPS[0].duration);

    return () => clearTimeout(timeout);
  }, [cycleKey]);

  const step = DEMO_STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <section className="px-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden shadow-2xl shadow-violet-500/5">
          {/* Mock top bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">P</span>
            </div>
            <span className="text-xs font-semibold text-zinc-400">
              Prospectia<span className="text-violet-400">.ai</span>
            </span>
            <span className="text-[10px] text-zinc-600 ml-auto">Demo interactive</span>
          </div>

          {/* Step indicator */}
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center gap-1.5">
              {DEMO_STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    i <= currentStep
                      ? "bg-gradient-to-r from-violet-500 to-indigo-500"
                      : "bg-white/[0.06]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current step label */}
          <div className="px-5 py-3">
            <div className="flex items-center gap-2.5 animate-step-fade-in" key={`${cycleKey}-${currentStep}`}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <StepIcon size={15} className="text-white" />
              </div>
              <span className="text-sm font-medium text-zinc-200">{step.label}</span>
              {currentStep < 2 && (
                <div className="flex gap-1 ml-2">
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              )}
            </div>
          </div>

          {/* Step 1: Department chip */}
          {currentStep >= 0 && (
            <div className="px-5 pb-2">
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-500 ${
                    currentStep >= 0
                      ? "bg-violet-500/15 border border-violet-500/25 text-violet-300"
                      : "border border-white/[0.08] text-zinc-500"
                  }`}
                >
                  75 Paris
                </span>
                {["69 Rhone", "13 Bouches-du-Rhone"].map((d) => (
                  <span
                    key={d}
                    className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-zinc-600 text-xs font-medium"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Loading / Search */}
          {currentStep >= 1 && currentStep < 3 && (
            <div className="px-5 py-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-zinc-400">Recherche en cours sur Google Places...</span>
              </div>
            </div>
          )}

          {/* Step 3+: Results table */}
          {currentStep >= 2 && (
            <div className="px-5 pb-3 animate-step-fade-in" key={`table-${cycleKey}-${currentStep >= 2 ? 'visible' : 'hidden'}`}>
              <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="px-3 py-2 text-left font-medium text-zinc-500">Nom</th>
                      <th className="px-3 py-2 text-left font-medium text-zinc-500 hidden sm:table-cell">Adresse</th>
                      <th className="px-3 py-2 text-left font-medium text-zinc-500">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FAKE_RESULTS.map((row, i) => (
                      <tr key={i} className="border-b border-white/[0.04]">
                        <td className="px-3 py-2.5 text-zinc-300 font-medium">{row.nom}</td>
                        <td className="px-3 py-2.5 text-zinc-500 hidden sm:table-cell">{row.adresse}</td>
                        <td className="px-3 py-2.5">
                          {currentStep >= 4 && FAKE_EMAILS[i] ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
                              <CheckCircle size={9} />
                              {FAKE_EMAILS[i]}
                            </span>
                          ) : currentStep >= 3 ? (
                            <span className="inline-flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
                              <span className="text-zinc-600 text-[10px]">enrichissement...</span>
                            </span>
                          ) : (
                            <span className="text-zinc-700">--</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 4: Progress bar */}
          {currentStep === 3 && (
            <div className="px-5 pb-3">
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-progress-fill" />
              </div>
              <p className="text-[10px] text-zinc-600 mt-1.5 text-center">Enrichissement en cours... 4 prospects sur 47</p>
            </div>
          )}

          {/* Step 5: Success + CTA */}
          {currentStep === 4 && (
            <div className="px-5 pb-4">
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-green-500/20 bg-green-500/[0.05]">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-xs font-semibold text-green-400">23 emails trouves sur 47 prospects</span>
                </div>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold hover:from-violet-500 hover:to-indigo-500 transition shadow-lg shadow-violet-500/20 whitespace-nowrap"
                >
                  Essayer gratuitement
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
