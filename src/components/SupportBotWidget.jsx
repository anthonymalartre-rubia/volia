'use client';

// Support bot in-app pour users authentifiés. Monté dans /dashboard, /app/*, /admin/*.

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { LifeBuoy, X, Send, Loader2 } from 'lucide-react';

function generateSessionId() {
  return 'supp_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Routes app authentifiées où le widget s'affiche
const SHOW_PATH_PREFIXES = ['/dashboard', '/app', '/admin', '/settings', '/parrainage', '/notifications'];

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Salut 👋 Je suis l'assistant Volia. Je peux t'aider à utiliser Prospection, Campagnes, CRM ou Forms. Pose ta question !",
};

export default function SupportBotWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Show seulement sur app authentifiée
  const shouldShow = pathname && SHOW_PATH_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let id = localStorage.getItem('volia_support_session_id');
    if (!id) {
      id = generateSessionId();
      localStorage.setItem('volia_support_session_id', id);
    }
    setSessionId(id);
  }, []);

  if (!shouldShow) return null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function handleSend(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending || !sessionId) return;

    setError(null);
    setSending(true);
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');

    try {
      const res = await fetch('/api/support-bot/chat', {
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
          setError("Trop de messages (30 / 1h). Écris à contact@volia.fr.");
        } else if (data.error === 'global_quota_exceeded') {
          setError("Le chat est temporairement indisponible. Écris à contact@volia.fr.");
        } else {
          setError("Erreur. Écris à contact@volia.fr.");
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
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Aide Volia"
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 hover:scale-105 transition"
        >
          <LifeBuoy size={20} />
          <span className="text-sm font-semibold hidden sm:inline">Aide</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[560px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <div>
              <div className="text-sm font-semibold">Volia — Assistant</div>
              <div className="text-xs opacity-80">Support · IA</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="p-1 rounded hover:bg-white/20 transition"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50 dark:bg-slate-950">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700'
                }`}>
                  {m.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-1' : ''}>{line}</p>
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
                maxLength={1500}
                className="flex-1 resize-none px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Envoyer"
                className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 text-center">
              Réponses IA. Bug ou demande spécifique : <a href="mailto:contact@volia.fr" className="underline">contact@volia.fr</a>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
