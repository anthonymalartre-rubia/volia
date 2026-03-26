# Scraping Prospects DOM — EZDrive

Outil de prospection B2B et copropriété pour les départements d'outre-mer (971 Guadeloupe, 972 Martinique, 973 Guyane, 974 La Réunion).

## Stack technique

- **Frontend** : Next.js 14 (App Router) + React 18 + Tailwind CSS 3
- **Backend** : API Routes Next.js (serverless sur Vercel)
- **Base de données** : Supabase (projet EZData `nlnosnymkganuahagytx`)
- **Déploiement** : Vercel (auto-deploy sur push `main`)
- **Repo GitHub** : `Anthonyezdrive/scraping-dom-ezdrive`
- **URL production** : https://scraping-dom-ezdrive.vercel.app

## Architecture

```
src/
├── app/
│   ├── layout.js          # Layout racine (metadata, fonts)
│   ├── page.js            # Page principale (state management, logique métier)
│   ├── globals.css         # Tailwind + styles custom
│   └── api/
│       ├── places/route.js # Proxy Google Places API (New) — côté serveur
│       └── enrich/route.js # Enrichissement email — scraping côté serveur
├── components/
│   ├── TopBar.jsx          # Barre de navigation sticky
│   ├── SearchPanel.jsx     # Panneau recherche (départements, catégories, requêtes custom)
│   └── ResultsPanel.jsx    # Panneau résultats (stats, tableau, filtres, exports)
└── lib/
    ├── constants.js        # DEPTS, B2B_CATS, COPRO_CATS, API URLs
    └── supabase.js         # Client Supabase (lazy-init)
```

## Base de données Supabase

### Table `prospects`
Colonnes : id (UUID), place_id (TEXT UNIQUE), nom, adresse, telephone, email, email_method ('scrape'|'guess'), site_web, note (NUMERIC), nb_avis (INT), type ('b2b'|'copro'|'custom'), departement ('971'|'972'|'973'|'974'), search_session_id (FK), created_at, updated_at.

### Table `search_sessions`
Colonnes : id (UUID), created_at, departments (TEXT[]), categories (JSONB), query_count, results_count, status ('running'|'completed'|'stopped').

## Variables d'environnement

```
GOOGLE_PLACES_API_KEY=       # Clé API Google Cloud avec "Places API (New)" activée
NEXT_PUBLIC_SUPABASE_URL=    # URL du projet Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Clé anon publique Supabase
```

Configurées dans Vercel > Project Settings > Environment Variables.

## Fonctionnalités

- **Recherche Google Places** : interroge l'API Places (New) REST pour chaque combinaison département × catégorie. Déduplication par `place_id`.
- **Catégories B2B** : 13 catégories (hôtel, restaurant, centre commercial, concessionnaire, supermarché, clinique, location voiture, pharmacie, station service, bureau études, électricien, architecte, garage).
- **Catégories Copro** : 6 catégories (syndic, administrateur de biens, gestionnaire immobilier, gestion immobilière, agence immobilière gestion, cabinet syndic).
- **Enrichissement email** : scraping côté serveur (homepage + pages contact/mentions légales), extraction regex + mailto + patterns obfusqués, scoring (domain match=100, contact@=80, pro=60, generic=20), fallback email probable (`contact@domain.com`).
- **Persistance Supabase** : tous les prospects sont sauvegardés et rechargés au lancement.
- **Export CSV** : format standard ou format Zoho CRM (Last Name, Company, Email, Phone, etc.).
- **Filtres** : recherche texte, département, type (B2B/Copro/Custom).

## Conventions de code

- Composants React en JSX avec `'use client'` directive
- Tailwind pour le styling — thème dark avec palette custom (#09090b, #111114, #1e1e24, accent indigo)
- Pas de TypeScript (JS uniquement)
- Fonctions async/await pour les appels API
- Client Supabase via `getSupabase()` (null-safe, lazy-init)

## Commandes

```bash
npm install      # Installer les dépendances
npm run dev      # Serveur de développement (localhost:3000)
npm run build    # Build de production
npm run lint     # Linting ESLint
```

## Déploiement

Push sur `main` → GitHub → Vercel auto-deploy. Pas de configuration supplémentaire nécessaire.
