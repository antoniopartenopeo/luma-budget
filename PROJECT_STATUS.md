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
│   └── budget/page.tsx         # [REAL] Budget Mgmt (Global vs Groups)
├── components/
│   ├── layout/sidebar.tsx      # [REAL] Navigation (Insights/Settings links exist but point to 404)
│   └── ui/                     # [REAL] Shadcn-like components (Button, Input, Dialog...)
├── features/
│   ├── budget/
│   │   ├── api/mock-data.ts    # [DEMO] LocalStorage persistence (luma_budget_plans_v1)
│   │   └── utils/calculate-budget.ts # [REAL] Spending logic (uses currency-utils)
│   ├── dashboard/
│   │   └── api/mock-data.ts    # [REAL] Aggregates Transactions + Budget for KPIs
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
| **Cross-tab Sync** | Core | ✅ Definitivo | 100% | `storage-utils.ts`. Aggiorna la UI se cambi dati in un altro tab. |
| **Currency Parsing**| Lib | ✅ Definitivo | 100% | `currency-utils.test.ts`. Euristica 3 cifre, integer math. Bug 30.00 fixato. |
| **Insights** | Insights | 🔴 Da avviare | 0% | Link in sidebar presente, route non esistente. |
| **Impostazioni** | Settings | 🔴 Da avviare | 0% | Link in sidebar presente. Nessuna gestione profilo/reset dati da UI. |

**Stima Avanzamento Totale App: ~75%** (Core features complete, mancano views secondarie e polish).

## D) Timeline Cronologica (Ricostruita)
1.  **Project Setup & UI Core** (0% → 15%)
    *   Setup Next.js, Tailwind, Shadcn components.
    *   Struttura layout (Sidebar, Topbar).
2.  **Transactions Feature** (15% → 40%)
    *   Lista transazioni mockup.
    *   Implementazione Mock API + LocalStorage (`luma_transactions_v1`).
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
6.  **Robust Currency Parsing** (70% → 75% - **OGGI**)
    *   Identificato bug precisione ("30.00" -> 3000).
    *   Creazione `src/lib/currency-utils.ts` con euristica 3 cifre.
    *   Refactor a tappeto su API, Form, Export e Card per usare centesimi interi.
    *   Copertura test 100% sulla logica finanziaria (62 tests passing).

## E) Backlog
### In sospeso
*   **Gestione Categorie**: Attualmente hardcoded in `config.ts`. Manca UI per crearle/modificarle.
*   **Mobile Responsiveness**: UI è responsive ma `TransactionsTable` su mobile potrebbe richiedere una view a card.

### Da avviare
*   **Pagina Insights**: Grafici avanzati (trend annuale, breakdown categorie).
*   **Pagina Impostazioni**:
    *   Pulsante "Reset Dati" (Hard Reset).
    *   Import/Backup dati (JSON).
*   **Onboarding**: Wizard iniziale per settare il primo budget se vuoto.

## F) Raccomandazioni (Prossimi 3 Step)
1.  **Implementare "Impostazioni" con Reset Dati**: Essenziale per il testing utente e per "pulire" i dati di prova (attualmente serve cancellare localStorage manualmente).
    *   *Motivazione*: Basso sforzo, alto valore per DX e testabilità.
2.  **Pagina Insights**: Sfruttare i dati già robusti per visualizzare trend di spesa.
    *   *Motivazione*: Completa il valore "analitico" dell'app oltre la semplice registrazione.
3.  **Category Management**: Spostare le categorie da `config.ts` allo storage o permettere customizzazione semplice.
    *   *Motivazione*: Rende l'app utilizzabile da utenti con esigenze diverse (es. chi non ha "Auto" ma "Moto").
