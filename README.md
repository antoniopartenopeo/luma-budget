# NumaBudget

Personal finance app built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**.
Local-first persistence, deterministic narration, and rhythm-based planning.

## Features

| Module | Status | Description |
|---|---|---|
| Dashboard | Stable | KPI finanziari, composizione spese, movimenti recenti, ritmo attivo, filtri periodo a pill (`Mese/3M/6M/12M`) |
| Transactions | Stable | CRUD, filtri periodo/range, export CSV, quick add da TopBar |
| Import CSV | Stable | Wizard multi-step con parse/normalize/dedupe/enrich/grouping merchant + review guidata con preset soglia |
| Insights | Stable | Trend analysis + AI Advisor (`Core`/`Storico`) + portfolio abbonamenti e timeline prossimi addebiti |
| Financial Lab (`/simulator`) | Stable | Scenari baseline/balanced/aggressive in card espandibili con breakdown step-by-step della quota sostenibile |
| Neural Core (`/brain`) | Active | Training locale del modello, nowcast mese corrente, timeline maturità |
| Settings | Stable | Preferenze, categorie, backup/restore, diagnostica tecnica |
| Notifications + Updates | Stable | Feed aggiornamenti in-app da `CHANGELOG.md`, badge unread, pagina `/updates` |
| Privacy + Flash | Stable | Privacy mode globale e overlay snapshot rapido |

## Architecture

```text
src/
├── app/                  # Next.js App Router pages/layout
├── components/           # Shared primitives + layout/patterns
├── brain/                # Local neural core (dataset, training, prediction)
├── domain/               # Pure domain logic (money, transactions, narration, categories)
├── features/             # Feature modules (dashboard, insights, import-csv, ...)
├── VAULT/                # Isolated high-value logic (goals, budget)
└── lib/                  # Shared utilities (storage keys, date ranges, runtime metadata)
```

### Runtime routes
- `/` Dashboard
- `/transactions`
- `/insights`
- `/simulator`
- `/settings`
- `/updates`
- `/brain`

### Data flow
- Repository layer -> `localStorage` persistence
- React Query -> cache + invalidation
- Cross-tab sync -> `storage` listeners on registered keys
- `CHANGELOG.md` -> `/api/notifications/changelog` -> feed notifiche in TopBar e `/updates`
- Narration layer -> deterministic copy from domain facts/state

### Persistence keys
`src/lib/storage-keys.ts` is the registry source of truth for app-level keys:
- `luma_transactions_v1`
- `luma_budget_plans_v1`
- `luma_categories_v1`
- `luma_settings_v1`
- `numa_goal_portfolio_v1`
- `numa_active_goal_v1` (legacy)
- `numa_finlab_hard_switch_v1_done`
- `numa_notifications_state_v2`
- `numa-privacy-storage`
- `numa_brain_adaptive_policy_v1`

Neural core storage is managed separately in `src/brain/storage.ts`:
- `numa_neural_core_v1`

## Governance

- Canonical runtime constraints: `/.agent/rules/numa-core-rules.md`
- Canonical documentation hub: `/docs/README.md`
- Governance update workflow: `$numa-governance-update`

## Getting started

```bash
npm install
npm run dev
```

Validation helpers:

```bash
npm run validate
npm run governance:quick-check
npm run release:validate
```

## PWA installability

The app ships with installable PWA essentials:
- Web app manifest: `/manifest.webmanifest`
- Service worker: `/sw.js`
- Offline fallback route: `/offline`
- App icons: `/public/pwa/*`

To validate installation locally (production mode):

```bash
npm run build
npm run start
```

Then open the app in a Chromium browser and verify the install prompt/menu.
For real installs on devices, deploy under HTTPS (for example on Vercel).

## Native app targets (Mobile + Mac)

This repository now includes native wrappers:
- Mobile: Capacitor (`ios` / `android`)
- Mac desktop: Electron (`.app` / `.dmg`)

### Prerequisites check

```bash
npm run native:doctor
```

### Mobile (Capacitor)

Set frontend URL for native shells (use your deployed HTTPS app):

```bash
export NUMA_APP_URL="https://your-domain.example"
```

Initialize platform projects:

```bash
npm run mobile:add:ios
npm run mobile:add:android
npm run mobile:sync
```

Open native IDE projects:

```bash
npm run mobile:open:ios
npm run mobile:open:android
```

### Mac desktop (Electron)

Local development shell:

```bash
npm run desktop:dev
```

Note: this command locks dev server to port `3000` to keep Electron boot deterministic.

Build Mac installers:

```bash
export NUMA_ELECTRON_START_URL="https://your-domain.example"
npm run desktop:build:mac
```

## Deploy

Standard Next.js deployment (Vercel).

Release flow:
- Work branches: `codex/*`
- Public beta/release branch: `main`
