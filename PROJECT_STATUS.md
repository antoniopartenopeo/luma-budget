# LumaBudget - Project Status Report

## A) Executive Summary
LumaBudget è una web app di gestione delle finanze personali (PWA-ready) costruita su **Next.js 16 (App Router)** e **React 19**. Utilizza **React Query v5** per lo state management asincrono e **localStorage** come layer di persistenza client-side, simulando un backend REST tramite mock API sofisticate con supporto sync cross-tab.

Il focus recente è stato sulla **Centralizzazione delle Query Keys** e sulla **Migrazione a Interi (Centesimi)** per la logica di calcolo, garantendo stabilità numerica e manutenibilità. Le sezioni Core sono funzionalmente complete e testate con **147 test unitari/integrazione**. Insights è attualmente disabilitata ("Soon").

## B) Tree Schema (Core Dependencies)
```ascii
src/
├── app/
│   ├── layout.tsx              # [REAL] AppShell, QueryProvider, Toaster
│   ├── page.tsx                # [REAL] Dashboard (Global Filters, KPI Grid, Charts)
│   ├── transactions/page.tsx   # [REAL] CRUD Table + Filters + Export
│   ├── budget/page.tsx         # [REAL] Budget Mgmt (Global vs Groups)
│   └── settings/page.tsx       # [REAL] Prefs, Diagnostics, Backup & Reset Granulare
├── components/
│   ├── layout/sidebar.tsx      # [REAL] Navigation (Insights disabled with "Soon" badge)
│   └── ui/                     # [REAL] Shadcn-like components (Button, Input, Alert Dialog...)
├── features/
│   ├── budget/
│   │   ├── api/repository.ts   # [REAL] Persisted in LocalStorage
│   │   └── utils/calculate-budget.ts # [REAL] Spending logic (uses amountCents)
│   ├── dashboard/
│   │   ├── api/repository.ts   # [REAL] Aggregates Transactions + Budget for KPIs
│   │   └── components/         # [REAL] SpendingCompositionCard
│   ├── settings/
│   │   ├── api/repository.ts   # [REAL] Settings V1 Persistance
│   │   ├── backup/backup-utils.ts # [REAL] Import/Export/Reset Logic
│   │   └── diagnostics/        # [REAL] System Diagnostics
│   └── transactions/
│       ├── api/repository.ts   # [REAL] CRUD (luma_transactions_v1) + Backfill Logic
│       └── components/         # [REAL] TransactionsTable
└── lib/
    ├── query-keys.ts           # [NEW] QueryKeyFactory centralizzata (TanStack Query v5)
    ├── currency-utils.ts       # [REAL] Helper centesimi (getSignedCents, formats)
    └── storage-utils.ts        # [REAL] SSR-safe storage wrapper
```

## C) Feature Inventory
| Feature | Sezione | Stato | % | Evidence / Note |
| :--- | :--- | :--- | :--- | :--- |
| **Filtri & Search** | Transazioni | ✅ Definitivo | 100% | Ricerca, Tipo, Categoria, Periodo (Custom), Solo Superflue. |
| **Query Keys Factory**| Core | ✅ Definitivo | 100% | Factory centralizzata per TanStack Query (no hardcoded strings). |
| **`amountCents` Logic**| Core | ✅ Definitivo | 100% | Fonte di verità intera (centesimi). Backfill automatico legacy data. |
| **Summary Bar** | Transazioni | ✅ Definitivo | 100% | KPI dinamici basati su calcoli interi. |
| **Unified Sidebar** | Transazioni | ✅ Definitivo | 100% | Flow View -> Edit integrato senza modali. Dirty state protection. |
| **Budget Plan** | Budget | ✅ Definitivo | 100% | Gestione globale e per gruppi. |
| **Cross-tab Sync** | Core | ✅ Definitivo | 100% | Storage events + QueryProvider + Cache Invalidations. |
| **Impostazioni V1** | Settings | ✅ Definitivo | 100% | Tema/Valuta, Reset, Diagnostica, Backup. |
| **Insights** | Insights | 🔴 Da avviare | 0% | Link in sidebar disabilitato ("Soon"). |

**Stima Avanzamento Totale App: ~99%** (Core functionality and architecture robustness completed).

## D) Timeline Cronologica (Ricostruita)
1-10. (Vedere versioni precedenti per dettagli setup, feature budget e Polish UX).
11. **Query Key Centralization** (98% → 98.5%)
    - Implementazione `QueryKeyFactory` in `src/lib/query-keys.ts`.
    - Eliminazione di tutte le chiavi hardcoded negli array.
12. **Integer Cents Migration (`amountCents`)** (98.5% → 99% - **OGGI**)
    - `amountCents` obbligatorio come fonte di verità.
    - Robusto meccanismo di **backfill & idempotenza** in repository.
    - Pulizia calcoli Dashboard/Budgets (no float errors).

## E) Backlog
### In sospeso
*   **Gestione Categorie**: Attualmente hardcoded in `config.ts`. Spostare in LocalStorage per customizzazione.

### Da avviare
*   **Pagina Insights**: Grafici avanzati (trend annuale, breakdown profondo).
*   **Onboarding**: Wizard iniziale per primo avvio (Budget/Valuta).

## F) Raccomandazioni (Prossimi 3 Step)
1.  **Insights MVP**: Attivare la rotta `/insights` con grafici annuali.
2.  **Category Management**: Spostare config categorie in LocalStorage.
3.  **Onboarding Wizard**: Implementare percorso guidato per nuovi utenti.
