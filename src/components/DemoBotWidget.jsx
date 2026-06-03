'use client';

// Floating chat widget for pre-sales (Sprint Revenue Engine Phase 4).
// Affiché sur landing + /pricing + /produits/*.
// Session anonyme via localStorage 'volia_demo_session_id'.

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

function generateSessionId() {
  // Simple UUID-like (sans Math.random côté server-friendly — c'est client-only OK)
  return 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Routes où le widget chat ne s'affiche PAS
// (app authentifiée — l'user a déjà accès au support via /settings)
const HIDDEN_PATH_PREFIXES = [
  '/dashboard',
  '/admin',
  '/app',
  '/settings',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/onboarding',
  '/auth',
];

const INITIAL_MESSAGE = {
  role: 'assistant',
  content:
    "Salut 👋 Je suis l'assistant Volia. Je peux répondre à tes questions tarifs, features, RGPD ou planifier une démo avec Anthony. Qu'est-ce que tu veux savoir ?",
};

export default function DemoBotWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Cache le widget sur l'app authentifiée
  const shouldHide = pathname && HIDDEN_PATH_PREFIXES.some((p) => pathname.startsWith(p));

  // Init session_id côté client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let id = localStorage.getItem('volia_demo_session_id');
    if (!id) {
      id = generateSessionId();
      localStorage.setItem('volia_demo_session_id', id);
    }
    setSessionId(id);
  }, []);

  // Auto-scroll vers bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // ⚠️ L'early-return DOIT venir APRÈS tous les hooks (règle des Hooks React).
  // Sinon, en naviguant marketing → app (shouldHide passe false→true), le
  // composant rend moins de hooks que le render précédent → React error #300
  // "Rendered fewer hooks than expected" → crash global de l'app (page 500).
  if (shouldHide) return null;

  async function handleSend(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending || !sessionId) return;

    setError(null);
    setSending(true);
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await fetch('/api/demo-bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text,
          pageUrl: typeof window !== 'undefined' ? window.location.pathname : '/',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.error === 'rate_limit') {
          setError("Limite atteinte (20 messages / 30 min). Écris à contact@volia.fr pour continuer.");
        } else if (data.error === 'global_quota_exceeded') {
          setError("Le chat est temporairement indisponible (limite quotidienne). Écris à contact@volia.fr.");
        } else {
          setError("Une erreur est survenue. Écris à contact@volia.fr.");
        }
        return;
      }
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError("Connexion impossible. Écris à contact@volia.fr.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le chat Volia"
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 hover:scale-105 transition"
        >
          <MessageCircle size={20} />
          <span className="text-sm font-semibold hidden sm:inline">Une question ?</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[560px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <div>
              <div className="text-sm font-semibold">Volia — Assistant</div>
              <div className="text-xs opacity-80">Réponses pré-vente · IA</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer le chat"
              className="p-1 rounded hover:bg-white/20 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50 dark:bg-slate-950"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-1' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <Loader2 size={14} className="animate-spin text-slate-400" />
                </div>
              </div>
            )}
            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="px-3 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Ta question..."
                rows={1}
                disabled={sending}
                maxLength={1000}
                className="flex-1 resize-none px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Envoyer"
                className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 text-center">
              Réponses générées par IA. Pour un devis sur-mesure : <a href="mailto:contact@volia.fr" className="underline">contact@volia.fr</a>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
