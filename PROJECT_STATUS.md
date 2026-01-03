# LumaBudget - Project Status Report

## A) Executive Summary
LumaBudget è una web app di gestione delle finanze personali (PWA-ready) costruita su **Next.js 16 (App Router)** e **React 19**. Utilizza **React Query v5** per lo state management asincrono e **localStorage** come layer di persistenza client-side, simulando un backend REST tramite mock API sofisticate con supporto sync cross-tab.

Il focus recente è stato sul **refactor della Dashboard** (Filtri Globali Mese/Periodo, KPI "Saldo" Lifetime) e sul completamento del modulo **Impostazioni** (Reset granulare, Diagnostica, Backup). Le sezioni Core sono funzionalmente complete e testate con **104 test unitari/integrazione**. Insights è attualmente disabilitata ("Soon").

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
│   └── ui/                     # [REAL] Shadcn-like components (Button, Input, Dialog...)
├── features/
│   ├── budget/
│   │   ├── api/mock-data.ts    # [REAL] Persisted in LocalStorage (luma_budget_plans_v1)
│   │   └── utils/calculate-budget.ts # [REAL] Spending logic (uses currency-utils)
│   ├── dashboard/
│   │   └── api/mock-data.ts    # [REAL] Aggregates Transactions + Budget for KPIs (Filtered)
│   ├── settings/
│   │   ├── api/repository.ts   # [REAL] Settings V1 Persistance (luma_settings_v1)
│   │   ├── backup/backup-utils.ts # [REAL] Import/Export/Reset Logic
│   │   └── diagnostics/        # [REAL] System Diagnostics & Clipboard Copy
│   └── transactions/
│       ├── api/mock-data.ts    # [REAL] CRUD LocalStorage (luma_transactions_v1) + Cache
│       └── components/         # [REAL] QuickExpenseInput, TransactionForm, Edit/Delete Dialogs
└── lib/
    ├── currency-utils.ts       # [REAL] Parser centralizzato per input valuta
    └── storage-utils.ts        # [REAL] SSR-safe storage wrapper (get/set/events)
```

## C) Feature Inventory
| Feature | Sezione | Stato | % | Evidence / Note |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard Filters** | Dashboard | ✅ Definitivo | 100% | Filtri Globali (Mese, 3M, 6M, 12M). |
| **KPI "Saldo" Lifetime**| Dashboard | ✅ Definitivo | 100% | Net Balance calcolato su tutto lo storico. |
| **Budget KPI** | Dashboard | ✅ Definitivo | 100% | Budget Rimanente (mese corrente o fine range). |
| **Recent Limit** | Dashboard | ✅ Definitivo | 100% | Ultime 5 transazioni in Dashboard. |
| **Transazioni CRUD** | Transazioni | ✅ Definitivo | 100% | `transactions-persistence.test.ts`. Create/Edit/Delete. |
| **Filtri & Search** | Transazioni | ✅ Definitivo | 100% | Filtro per testo, tipo, categoria e "superfluo". |
| **Export CSV** | Transazioni | ✅ Definitivo | 100% | `export-transactions.ts`. Supporta UTF-8 BOM. |
| **Budget Plan** | Budget | ✅ Definitivo | 100% | Gestione mensile globale e per gruppi. |
| **Logic Superflue** | Core | 🟡 Migliorabile | 90% | Regole categoriali. Override manuale supportato ma basico. |
| **Cross-tab Sync** | Core | ✅ Definitivo | 100% | `storage-utils.ts` + `QueryProvider`. |
| **Currency Parsing**| Lib | ✅ Definitivo | 100% | `currency-utils.test.ts`. Gestione input e calcoli interi. |
| **Impostazioni V1** | Settings | ✅ Definitivo | 100% | Tema/Valuta, Reset Granulare, Diagnostica, Backup. |
| **Insights** | Insights | 🔴 Da avviare | 0% | Link in sidebar disabilitato ("Soon"). |

**Stima Avanzamento Totale App: ~90%** (Core features complete, Dashboard Refactored, manca solo Insights).

## D) Timeline Cronologica (Ricostruita)
1.  **Project Setup & UI Core** (0% → 15%)
    *   Setup Next.js, Tailwind, Shadcn components. Layout base.
2.  **Transactions Feature** (15% → 40%)
    *   CRUD Transazioni, LocalStorage API (`luma_transactions_v1`).
    *   QuickExpenseInput component.
3.  **Cross-Tab Sync & Fixes** (40% → 50%)
    *   Gestione eventi `storage` per sync real-time.
4.  **Budget Feature** (50% → 65%)
    *   Route `/budget`, calcolo spesa vs budget.
    *   Separazione gruppi (Essenziali/Comfort/Superflue).
5.  **Dashboard Refinement** (65% → 70%)
    *   Introduzione KPI basilari.
6.  **Robust Currency Parsing** (70% → 75%)
    *   `src/lib/currency-utils.ts` per normalizzazione input.
    *   Refactor API/Form per centesimi interi.
    *   Copertura test finanziari (104 test totali).
7.  **Settings V1 Complete** (75% → 85%)
    *   UI Preferenze (Tema/Valuta) + Persistenza.
    *   Reset Granulare (Tx/Budget) e Diagnostica tecnica.
    *   Backup/Restore JSON.
8.  **Dashboard 2.0 Reskin** (85% → 90% - **OGGI**)
    *   Filtri Globali (Mese corrente o Range 3/6/12 mesi).
    *   KPI "Saldo" (Lifetime) vs Budget (Mese corrente/finale).
    *   Charts sincronizzati col filtro (Spese mensili / Categorie).
    *   UI Polish (Recent Transactions limitata a 5).

## E) Backlog
### In sospeso
*   **Gestione Categorie**: Attualmente hardcoded in `config.ts`.
*   **Mobile Responsiveness**: UI usabile ma `TransactionsTable` migliorabile su mobile (card view).

### Da avviare
*   **Pagina Insights**: Grafici avanzati (trend annuale, breakdown profondo).
*   **Onboarding**: Wizard iniziale per primo avvio (Budget/Valuta).

## F) Raccomandazioni (Prossimi 3 Step)
1.  **Insights MVP**: Attivare la rotta `/insights` con grafici annuali.
    *   *Motivazione*: Sfruttare i dati storici ora ben strutturati.
2.  **Category Management**: Spostare config categorie in LocalStorage.
    *   *Motivazione*: Permettere personalizzazione categorie utente.
3.  **Mobile UX**: Ottimizzare tabella transazioni per schermi piccoli (Card layout).
    *   *Motivazione*: Migliorare l'uso "on the go" da smartphone.
