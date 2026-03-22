# NumaBudget

Personal finance app built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**.
Local-first persistence, deterministic narration, and rhythm-based planning.

## Project Context

Canonical live project context now lives in:

- `AGENTS.md`
- `00_project-core/*`
- `01_rules/*`
- `03_architecture/SYSTEM_OVERVIEW.md`
- `04_execution/*`
- `05_specialists/*`
- `06_decisions/*`
- `07_handoffs/*`

## Features

| Module | Status | Description |
|---|---|---|
| Landing (`/`) | Stable | Superficie pubblica di acquisizione con hero immersivo, demo narrativa in 4 momenti, interludio Brain multilayer e CTA finale zero-cloud/no-account verso `/dashboard` |
| Dashboard | Stable | KPI finanziari, composizione spese interattiva, movimenti recenti collegati all'elenco completo, filtri periodo persistenti in URL (`Mese/3M/6M/12M`) |
| Transactions | Stable | Ledger responsive a row card/table, filtri periodo/range, export CSV, quick add da TopBar |
| Import CSV | Stable | Wizard multi-step con parse/normalize/dedupe/enrich/grouping merchant + review guidata di gruppi, categorie e duplicati prima del salvataggio |
| Insights | Stable | Trend analysis + AI Advisor (`Core`/`Storico`) + portfolio abbonamenti e timeline prossimi addebiti |
| Financial Lab (`/simulator`) | Stable | Scenari baseline/balanced/aggressive in card espandibili con breakdown step-by-step della quota sostenibile |
| Neural Core (`/brain`) | Active | Training locale del modello, nowcast mese corrente, timeline maturità |
| Settings | Stable | Preferenze, categorie, backup/restore locale con validazione sezioni riconosciute, diagnostica locale e azioni avanzate di reset |
| Notifications + Updates | Stable | Feed novità in-app da `CHANGELOG.md`, badge unread, campanella TopBar e pagina `/updates` |
| Privacy + Flash | Stable | Privacy mode globale e overlay snapshot rapido |

## Architecture

```text
src/
├── app/                  # Next.js App Router pages/layout
├── components/           # Shared primitives + layout/patterns
├── brain/                # Local neural core (dataset, training, prediction)
├── domain/               # Pure domain logic (money, transactions, narration, categories)
├── features/             # Feature modules (dashboard, insights, import-csv, ...)
├── VAULT/                # Isolated high-value logic (goals + legacy compatibility boundaries)
└── lib/                  # Shared utilities (storage keys, date ranges, runtime metadata)
```

Canonical system overview: `03_architecture/SYSTEM_OVERVIEW.md`

### Runtime routes
- `/` Public landing page
- `/dashboard` Dashboard
- `/transactions`
- `/insights`
- `/simulator`
- `/settings`
- `/updates`
- `/brain`
- `/offline`

### Data flow
- Repository layer -> `localStorage` persistence
- React Query -> cache + invalidation
- Dashboard filters -> URL/search params -> deep-link coerenti verso `/transactions`
- Cross-tab sync -> `storage` listeners on registered keys
- `CHANGELOG.md` -> `/api/notifications/changelog` -> feed notifiche in TopBar e `/updates`
- Open banking routes -> present in codebase but disabled by default unless `NUMA_ENABLE_OPEN_BANKING=true`
- Narration layer -> deterministic copy from domain facts/state

### Persistence keys
Active registry keys from `src/lib/storage-keys.ts`:
- `luma_transactions_v1`
- `luma_categories_v1`
- `luma_settings_v1`
- `numa_goal_portfolio_v1`
- `numa_active_goal_v1` (legacy)
- `numa_finlab_hard_switch_v1_done`
- `numa_notifications_state_v2`
- `numa-privacy-storage`
- `numa_brain_adaptive_policy_v1`

Legacy compatibility key kept for backup/reset and one-shot migrations:
- `luma_budget_plans_v1`

Neural core storage is managed separately in `src/brain/storage.ts`:
- `numa_neural_core_v1`

## Governance

- AI and operator entrypoint: `/AGENTS.md`
- Canonical live project context: `/00_project-core/*`
- Canonical rules and governance standards: `/01_rules/*`
- Canonical system overview and module contracts: `/03_architecture/*`
- Canonical execution playbooks and audit outputs: `/04_execution/*`
- Canonical specialist operating contexts: `/05_specialists/*`
- Canonical decisions and ADRs: `/06_decisions/*`
- Canonical handoff state: `/07_handoffs/*`
- Vendored reference skills pinned in repo: `/.agents/skills/*` + `skills-lock.json`
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

Backup note:
- exported backups are cleartext JSON files and should be treated as sensitive financial data
- restore imports only recognized backup sections and rejects malformed payloads

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
