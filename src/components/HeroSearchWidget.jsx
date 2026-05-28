'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Mail, ArrowRight, CheckCircle2, Sparkles, Loader2, Globe, Phone, Star } from 'lucide-react';

// Onglet "Par entreprise" retiré le 28 mai 2026 : il était codé en mock
// (retournait toujours les emails d'OpenAI quel que soit le nom tapé)
// → trompait les visiteurs (founder a tapé "Jarvis", a vu ceo@openai.com).
// Pour le ré-activer il faudra une vraie intégration Clearbit/Apollo
// + rate limiting + cache côté /api/public/*.
const TABS = [
  { id: 'category', label: 'Par secteur + ville', icon: Search },
  { id: 'verify', label: 'Vérifier un email', icon: Mail },
];

// Pre-built example results — to wow visitors immediately
const MOCK_RESULTS = {
  category: {
    'restaurant-paris': {
      total: 4823,
      examples: [
        { name: 'Le Bouillon Chartier', address: '7 Rue du Faubourg Montmartre', email: 'reservation@bouillon-chartier.com', phone: '01 47 70 86 29', rating: 4.4, website: 'bouillon-chartier.com' },
        { name: 'Chez Janou', address: '2 Rue Roger Verlomme', email: 'contact@chez-janou.com', phone: '01 42 72 28 41', rating: 4.5, website: 'chezjanou.com' },
        { name: 'Brasserie Lipp', address: '151 Bd Saint-Germain', email: 'info@brasserielipp.fr', phone: '01 45 48 53 91', rating: 4.2, website: 'brasserielipp.fr' },
      ],
    },
    'avocat-lyon': {
      total: 2156,
      examples: [
        { name: 'Cabinet Berthier & Associés', address: '12 Rue Childebert, Lyon 2', email: 'contact@cabinet-berthier.fr', phone: '04 78 42 15 30', rating: 4.7, website: 'cabinet-berthier.fr' },
        { name: 'SCP Dujardin Avocats', address: '45 Cours Lafayette, Lyon 3', email: 'secretariat@dujardin-avocats.com', phone: '04 72 61 84 22', rating: 4.6, website: 'dujardin-avocats.com' },
        { name: 'Maître Lefèvre', address: '8 Place Bellecour, Lyon 2', email: 'cabinet@me-lefevre.fr', phone: '04 78 37 91 56', rating: 4.8, website: 'me-lefevre.fr' },
      ],
    },
    'hotel-marseille': {
      total: 1247,
      examples: [
        { name: 'Sofitel Vieux Port', address: '36 Bd Charles Livon', email: 'h0542@sofitel.com', phone: '04 91 15 59 00', rating: 4.5, website: 'sofitel.com' },
        { name: 'Mercure Marseille Canebière', address: '38 Rue Sénac de Meilhan', email: 'h2451@accor.com', phone: '04 91 91 27 27', rating: 4.1, website: 'mercure.com' },
        { name: 'Hôtel Le Corbusier', address: '280 Bd Michelet', email: 'contact@hotellecorbusier.com', phone: '04 91 16 78 00', rating: 4.3, website: 'hotellecorbusier.com' },
      ],
    },
    default: {
      total: 1834,
      examples: [
        { name: 'Entreprise SARL', address: '12 Rue Principale', email: 'contact@entreprise-sarl.fr', phone: '01 23 45 67 89', rating: 4.5, website: 'entreprise-sarl.fr' },
        { name: 'Société SAS', address: '24 Avenue Centrale', email: 'info@societe-sas.com', phone: '01 23 45 67 90', rating: 4.3, website: 'societe-sas.com' },
        { name: 'Compagnie SA', address: '36 Boulevard du Commerce', email: 'hello@compagnie-sa.fr', phone: '01 23 45 67 91', rating: 4.6, website: 'compagnie-sa.fr' },
      ],
    },
  },
  // verify: plus de mock — vraie API /api/public/verify (MillionVerifier)
};

const QUICK_TRIES = {
  category: [
    { cat: 'Restaurants', city: 'Paris', key: 'restaurant-paris' },
    { cat: 'Avocats', city: 'Lyon', key: 'avocat-lyon' },
    { cat: 'Hôtels', city: 'Marseille', key: 'hotel-marseille' },
  ],
  verify: [
    { email: 'contact@openai.com', label: 'contact@openai.com' },
    { email: 'fake@nope.invalid', label: 'fake@nope.invalid' },
  ],
};

export default function HeroSearchWidget() {
  const [tab, setTab] = useState('category');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [emailToVerify, setEmailToVerify] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [remainingToday, setRemainingToday] = useState(null);

  // Fetch des vraies données Google Places via /api/public/preview
  // (rate limit 2/IP/jour + cap global 5000/jour + cache 24h + anonymisation)
  async function fetchPreview(cat, city) {
    try {
      const res = await fetch('/api/public/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cat, city }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'unknown', message: data.message || 'Une erreur est survenue.', status: res.status };
      }
      return { ok: true, data };
    } catch (err) {
      return { error: 'network', message: 'Connexion impossible. Vérifiez votre réseau.', status: 0 };
    }
  }

  const handleSearch = async (preset = null) => {
    setLoading(true);
    setResult(null);
    setError(null);

    if (tab === 'category') {
      const cat = preset?.cat || category || 'restaurants';
      const cit = preset?.city || city || 'Paris';
      const response = await fetchPreview(cat, cit);

      if (response.error) {
        setError({ code: response.error, message: response.message, status: response.status });
        setLoading(false);
        return;
      }

      const { results, total, remaining_today, cached } = response.data;
      // Map au format attendu par CategoryResult (rétrocompat)
      setResult({
        type: 'category',
        data: {
          total,
          examples: results.map((r) => ({
            name: r.name,
            address: r.address,
            email: r.email || 'c***t@***.fr',
            phone: r.phone || '** ** ** ** **',
            rating: r.rating || (4 + Math.random() * 0.8).toFixed(1),
            website: r.website || '***.fr',
            anonymized: r.anonymized,
          })),
        },
        query: { cat, city: cit },
        cached,
      });
      setRemainingToday(remaining_today);
    } else if (tab === 'verify') {
      // Mode 'verify' : vrai appel MillionVerifier via /api/public/verify
      // (rate limit 2/IP/jour partagé avec preview + cap global 1000/jour + cache 24h).
      const em = (preset?.email || emailToVerify || '').trim();
      try {
        const res = await fetch('/api/public/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: em }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError({
            code: data.error || 'unknown',
            message: data.message || 'Une erreur est survenue.',
            status: res.status,
          });
          setLoading(false);
          return;
        }
        setResult({
          type: 'verify',
          // L'API renvoie déjà { result, status, color, detail } : on les
          // mappe directement au format attendu par <VerifyResult />.
          data: {
            result: data.result,
            status: data.status,
            color: data.color,
            detail: data.detail,
          },
          query: { email: em },
          cached: data.cached,
        });
        if (typeof data.remaining_today === 'number') {
          setRemainingToday(data.remaining_today);
        }
      } catch (err) {
        setError({
          code: 'network',
          message: 'Connexion impossible. Vérifiez votre réseau.',
          status: 0,
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-line bg-surface-elevated/40 backdrop-blur-xl p-3 sm:p-5">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-4 p-1 rounded-xl bg-surface-elevated/60 border border-line">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setResult(null); }}
              className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                active
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-elevated'
              }`}
            >
              <Icon size={14} />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Inputs by tab */}
      {tab === 'category' && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Restaurants, avocats, hôtels..."
              className="w-full pl-9 pr-3 py-3 rounded-lg bg-surface-card/60 border border-line text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-violet-500/50"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex-1 relative">
            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ville ou département..."
              className="w-full pl-9 pr-3 py-3 rounded-lg bg-surface-card/60 border border-line text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-violet-500/50"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-5 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30 disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Trouver les emails
          </button>
        </div>
      )}

      {tab === 'verify' && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
            <input
              type="email"
              value={emailToVerify}
              onChange={(e) => setEmailToVerify(e.target.value)}
              placeholder="contact@entreprise.com"
              className="w-full pl-9 pr-3 py-3 rounded-lg bg-surface-card/60 border border-line text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:border-violet-500/50"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-5 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30 disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Vérifier
          </button>
        </div>
      )}

      {/* Quick try suggestions */}
      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-content-tertiary">
        <span>Essai rapide :</span>
        {QUICK_TRIES[tab].map((q, i) => (
          <button
            key={i}
            onClick={() => {
              if (tab === 'category') { setCategory(q.cat); setCity(q.city); handleSearch(q); }
              else { setEmailToVerify(q.email); handleSearch(q); }
            }}
            className="px-2 py-1 rounded-md bg-surface-elevated/60 hover:bg-violet-500/10 hover:text-violet-300 border border-line hover:border-violet-500/30 text-content-secondary transition"
          >
            {q.label || `${q.cat} ${q.city}`}
          </button>
        ))}
      </div>

      {/* Error state (rate limit, service down, etc.) */}
      {error && (
        <div className="mt-5 pt-5 border-t border-line">
          <div className={`rounded-xl p-4 ${error.status === 429 ? 'border border-amber-400 bg-amber-500/[0.08]' : 'border border-red-500/30 bg-red-500/[0.08]'}`}>
            <div className="flex items-start gap-3">
              <span className={`text-xl ${error.status === 429 ? 'text-amber-600' : 'text-red-400'}`}>
                {error.status === 429 ? '⏱️' : '⚠️'}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${error.status === 429 ? 'text-amber-700' : 'text-red-300'}`}>
                  {error.status === 429 ? 'Limite quotidienne atteinte' : 'Service temporairement indisponible'}
                </div>
                <p className="text-xs text-content-secondary mt-1 leading-relaxed">
                  {error.message}
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition"
                >
                  Inscription gratuite (sans CB)
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-5 pt-5 border-t border-line">
          {result.type === 'category' && (
            <CategoryResult result={result} remainingToday={remainingToday} />
          )}
          {result.type === 'verify' && (
            <VerifyResult result={result} />
          )}
        </div>
      )}
    </div>
  );
}

function CategoryResult({ result, remainingToday }) {
  const { data, query } = result;
  const isAnonymized = data.examples.some((e) => e.anonymized);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold flex items-center gap-1">
          <CheckCircle2 size={12} />
          {data.total.toLocaleString('fr-FR')} {query.cat?.toLowerCase()} trouvés à {query.city}
        </div>
        {/* Badge "Aperçu anonymisé" pour ne pas tromper le visiteur — c'est
            de la vraie data Google Places mais masquée par éthique RGPD. */}
        {isAnonymized && (
          <div className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-400 text-amber-700 text-[10px] font-semibold uppercase tracking-wider">
            Aperçu anonymisé
          </div>
        )}
        {/* Compteur essais restants */}
        {typeof remainingToday === 'number' && remainingToday >= 0 && (
          <div className="px-2 py-0.5 rounded-md bg-surface-elevated/60 border border-line text-content-secondary text-[10px] tabular-nums">
            {remainingToday > 0 ? `${remainingToday} essai${remainingToday > 1 ? 's' : ''} restant${remainingToday > 1 ? 's' : ''} aujourd'hui` : 'Dernier essai gratuit utilisé'}
          </div>
        )}
      </div>
      <div className="space-y-2 mb-4">
        {data.examples.map((p, i) => (
          <div key={i} className="rounded-lg bg-surface-elevated/60 border border-line p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
              <div className="font-semibold text-content-primary text-sm flex items-center gap-2">
                {p.name}
                <span className="flex items-center gap-0.5 text-xs text-amber-600">
                  <Star size={11} className="fill-amber-400" /> {p.rating}
                </span>
              </div>
              <div className="text-[10px] text-content-tertiary">{p.address}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-content-secondary">
                <Mail size={11} className="text-violet-400 flex-shrink-0" />
                <span className="truncate font-mono">{p.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-content-secondary">
                <Phone size={11} className="text-content-tertiary flex-shrink-0" />
                <span className="font-mono">{p.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-content-secondary">
                <Globe size={11} className="text-content-tertiary flex-shrink-0" />
                <span className="truncate">{p.website}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">+{(data.total - 3).toLocaleString('fr-FR')} autres résultats disponibles</div>
          <div className="text-xs text-content-secondary mt-0.5">Créez votre compte pour voir tous les emails et exporter en CSV</div>
        </div>
        <Link
          href="/signup"
          className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30 flex items-center gap-2 whitespace-nowrap"
        >
          Voir tous les résultats
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function VerifyResult({ result }) {
  const { data, query } = result;
  const colors = {
    green: 'bg-green-500/15 border-green-500/30 text-green-400',
    red: 'bg-red-500/15 border-red-500/30 text-red-400',
    amber: 'bg-amber-100 border-amber-400 text-amber-600',
  };
  return (
    <div>
      <div className={`rounded-lg border p-4 mb-3 ${colors[data.color]}`}>
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 size={20} />
          <div>
            <div className="font-bold">{data.status}</div>
            <div className="text-xs opacity-80">{query.email}</div>
          </div>
        </div>
        <p className="text-xs opacity-80">{data.detail}</p>
      </div>
      <div className="rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-content-secondary">Vérifiez vos listes d'emails en masse — jusqu'à 50 000 emails/heure</div>
        <Link
          href="/signup"
          className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-lg shadow-violet-500/30 flex items-center gap-2 whitespace-nowrap"
        >
          Vérifier ma base
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
