# LumaBudget - Project Status Report

## A) Executive Summary
LumaBudget è una web app di gestione delle finanze personali (PWA-ready) costruita su **Next.js 16 (App Router)** e **React 19**. Utilizza **React Query v5** per lo state management asincrono e **localStorage** come layer di persistenza client-side, simulando un backend REST tramite mock API sofisticate con supporto sync cross-tab. 

Il focus recente è stato sulla robustezza dei dati finanziari: è stato implementato un **parser centralizzato** (`currency-utils`) che gestisce valute miste e un'euristica intelligente per disambiguare separator decimali/migliaia ("30.00" vs "1.234"). Le sezioni Core (Dashboard, Transazioni, Budget) sono funzionalmente complete e testate, mentre le aree di analisi avanzata (Insights) e configurazione (Settings) sono attualmente segnaposto.

## B) Tree Schema (Core Dependencies)
```ascii
src/
├── app/
│   ├── layout.tsx              # [REAL] AppShell, QueryProvider, Toaster
│   ├── page.tsx                # [REAL] Dashboard (KPIs + Charts)
│   ├── transactions/page.tsx   # [REAL] CRUD Table + Filters + Export
│   ├── budget/page.tsx         # [REAL] Budget Mgmt (Global vs Groups)
│   └── settings/page.tsx       # [REAL] Prefs (Data/UI) + Reset/Backup
├── components/
│   ├── layout/sidebar.tsx      # [REAL] Navigation (Insights link exists but points to 404)
│   └── ui/                     # [REAL] Shadcn-like components (Button, Input, Dialog...)
├── features/
│   ├── budget/
│   │   ├── api/mock-data.ts    # [DEMO] LocalStorage persistence (luma_budget_plans_v1)
│   │   └── utils/calculate-budget.ts # [REAL] Spending logic (uses currency-utils)
│   ├── dashboard/
│   │   └── api/mock-data.ts    # [REAL] Aggregates Transactions + Budget for KPIs
│   ├── settings/
│   │   ├── api/repository.ts   # [REAL] Settings V1 Persistance (luma_settings_v1)
│   │   └── backup/backup-utils.ts # [REAL] Import/Export/Reset Logic
│   └── transactions/
│       ├── api/mock-data.ts    # [DEMO] LocalStorage CRUD (luma_transactions_v1) + Cache
│       └── components/         # [REAL] QuickExpenseInput, TransactionForm, Edit/Delete Dialogs
└── lib/
    ├── currency-utils.ts       # [REAL] ROBUST PARSER (Cents based, 3-digit heuristic)
    └── storage-utils.ts        # [REAL] SSR-safe storage wrapper (get/set/events)
```

## C) Feature Inventory
| Feature | Sezione | Stato | % | Evidence / Note |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard KPIs** | Dashboard | ✅ Definitivo | 100% | `dashboard-summary.test.ts`. Net Balance separato da Budget Remaining. |
| **Monthly Chart** | Dashboard | ✅ Definitivo | 100% | Recharts + mock-data aggregation coerente con cents parser. |
| **Transazioni CRUD** | Transazioni | ✅ Definitivo | 100% | `transactions-persistence.test.ts`. Create/Edit/Delete persistenti. |
| **Filtri & Search** | Transazioni | ✅ Definitivo | 100% | Filtro per testo, tipo, categoria e "superfluo" (Dashboard link). |
| **Export CSV** | Transazioni | ✅ Definitivo | 100% | `export-transactions.ts`. Supporta encoding UTF-8 BOM per Excel. |
| **Budget Plan** | Budget | ✅ Definitivo | 100% | `budget-calculations.test.ts`. Gestione mensile globale e per gruppi. |
| **Logic Superflue** | Core | 🟡 Migliorabile | 90% | Regole basate su categoria funzionanti. Override manuale supportato ma basico. |
| **Cross-tab Sync** | Core | ✅ Definitivo | 100% | `storage-utils.ts` + `QueryProvider`. Settings, Budget e TXs sync. |
| **Currency Parsing**| Lib | ✅ Definitivo | 100% | `currency-utils.test.ts`. Euristica 3 cifre, integer math. Bug 30.00 fixato. |
| **Impostazioni** | Settings | ✅ Definitivo | 100% | `settings-persistence.test.ts`. Reset granulare, Theme/Currency, Backup/restore. |
| **Insights** | Insights | 🔴 Da avviare | 0% | Link in sidebar presente, route non esistente. |

**Stima Avanzamento Totale App: ~85%** (Core features complete, Settings complete, manca solo Insights).

## D) Timeline Cronologica (Ricostruita)
1.  **Project Setup & UI Core** (0% → 15%)
    *   Setup Next.js, Tailwind, Shadcn components.
    *   Struttura layout (Sidebar, Topbar).
2.  **Transactions Feature** (15% → 40%)
    *   Lista transazioni mockup.
    *   Creato Mock API + LocalStorage (`luma_transactions_v1`).
    *   QuickExpenseInput component.
3.  **Cross-Tab Sync & Fixes** (40% → 50%)
    *   `storage-utils.ts` refactor.
    *   Gestione eventi `storage` per sync real-time tra tab.
4.  **Budget Feature** (50% → 65%)
    *   Route `/budget`.
    *   Logica calcolo spesa (spending vs budget).
    *   Separazione gruppi (Essenziali/Comfort/Superflue).
5.  **Dashboard Refinement** (65% → 70%)
    *   Calcolo corretto "Budget Rimanente" (slegato da Income).
    *   Introduzione KPI "Saldo Mensile".
6.  **Robust Currency Parsing** (70% → 75%)
    *   Identificato bug precisione ("30.00" -> 3000).
    *   Creazione `src/lib/currency-utils.ts` con euristica 3 cifre.
    *   Refactor a tappeto su API, Form, Export e Card per usare centesimi interi.
    *   Copertura test 100% sulla logica finanziaria (62 tests passing).
7.  **Settings V1 Complete** (75% → 85% - **OGGI**)
    *   Implementato Data Layer Settings (`luma_settings_v1`).
    *   Route `/settings` completa con UI Preferenze (Tema/Valuta).
    *   Reset Granulare (Transazioni/Budget/All) con feedback e controlli sicurezza.
    *   Backup/Restore JSON funzionante.
    *   Icone Lucide unificate nel budget.

## E) Backlog
### In sospeso
*   **Gestione Categorie**: Attualmente hardcoded in `config.ts`. Manca UI per crearle/modificarle.
*   **Mobile Responsiveness**: UI è responsive ma `TransactionsTable` su mobile potrebbe richiedere una view a card.

### Da avviare
*   **Pagina Insights**: Grafici avanzati (trend annuale, breakdown categorie).
*   **Onboarding**: Wizard iniziale per settare il primo budget se vuoto.

## F) Raccomandazioni (Prossimi 3 Step)
1.  **Pagina Insights**: Sfruttare i dati già robusti per visualizzare trend di spesa.
    *   *Motivazione*: Completa il valore "analitico" dell'app oltre la semplice registrazione.
2.  **Category Management**: Spostare le categorie da `config.ts` allo storage o permettere customizzazione semplice.
    *   *Motivazione*: Rende l'app utilizzabile da utenti con esigenze diverse (es. chi non ha "Auto" ma "Moto").
3.  **Refactor Provider Tema**: Applicare effettivamente il tema (Dark/Light) usando il valore salvato nei Settings.
    *   *Motivazione*: Attualmente il settings viene salvato ma non applica la classe CSS al body.
