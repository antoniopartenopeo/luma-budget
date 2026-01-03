# LumaBudget - Project Status Report

## A) Executive Summary
LumaBudget è una web app di gestione delle finanze personali (PWA-ready) costruita su **Next.js 16 (App Router)** e **React 19**. Utilizza **React Query v5** per lo state management asincrono e **localStorage** come layer di persistenza client-side, simulando un backend REST tramite mock API sofisticate con supporto sync cross-tab.

Il focus recente è stato sulla **Unificazione della Sidebar Transazioni** (unificazione View/Edit flow) e sulla **Refinement Estetica** della Command Bar. Le sezioni Core sono funzionalmente complete e testate con **134 test unitari/integrazione**. Insights è attualmente disabilitata ("Soon").

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
│   │   ├── api/mock-data.ts    # [REAL] Persisted in LocalStorage (luma_budget_plans_v1)
│   │   └── utils/calculate-budget.ts # [REAL] Spending logic (uses currency-utils)
│   ├── dashboard/
│   │   ├── api/mock-data.ts    # [REAL] Aggregates Transactions + Budget for KPIs (Filtered)
│   │   └── components/         # [REAL] SpendingCompositionCard (Stacked Chart + Interaction)
│   ├── settings/
│   │   ├── api/repository.ts   # [REAL] Settings V1 Persistance (luma_settings_v1)
│   │   ├── backup/backup-utils.ts # [REAL] Import/Export/Reset Logic
│   │   └── diagnostics/        # [REAL] System Diagnostics & Clipboard Copy
│   └── transactions/
│       ├── api/mock-data.ts    # [REAL] CRUD LocalStorage (luma_transactions_v1) + Cache
│       └── components/         # [REAL] TransactionsTable (Responsive Table/Card layout)
└── lib/
    ├── currency-utils.ts       # [REAL] Parser centralizzato per input valuta
    └── storage-utils.ts        # [REAL] SSR-safe storage wrapper (get/set/events)
```

## C) Feature Inventory
| Feature | Sezione | Stato | % | Evidence / Note |
| :--- | :--- | :--- | :--- | :--- |
| **Filtri & Search** | Transazioni | ✅ Definitivo | 100% | Ricerca, Tipo, Categoria, Periodo (Custom), Solo Superflue. |
| **Sorting & Paging** | Transazioni | ✅ Definitivo | 100% | Sorting per 5 colonne, Pagination client-side. |
| **Summary Bar** | Transazioni | ✅ Definitivo | 100% | KPI dinamici: Operazioni, Entrate, Uscite, Bilancio. |
| **Unified Sidebar** | Transazioni | ✅ Definitivo | 100% | Flow View -> Edit integrato senza modali. Dirty state protection. |
| **Export CSV** | Transazioni | ✅ Definitivo | 100% | Supporta UTF-8 BOM, rispetta filtri o esporta tutto. |
| **Budget Plan** | Budget | ✅ Definitivo | 100% | Gestione globale e per gruppi. |
| **Logic Superflue** | Core | ✅ Definitivo | 100% | Regole, override manuale e filtro dedicato. |
| **Cross-tab Sync** | Core | ✅ Definitivo | 100% | Storage events + QueryProvider. |
| **Currency Parsing**| Lib | ✅ Definitivo | 100% | Gestione input e calcoli interi (centesimi). |
| **Impostazioni V1** | Settings | ✅ Definitivo | 100% | Tema/Valuta, Reset, Diagnostica, Backup. |
| **Insights** | Insights | 🔴 Da avviare | 0% | Link in sidebar disabilitato ("Soon"). |

**Stima Avanzamento Totale App: ~98%** (Core functionality integration and UI refinement finished).

## D) Timeline Cronologica (Ricostruita)
1.  **Project Setup & UI Core** (0% → 15%)
2.  **Transactions Feature** (15% → 40%)
3.  **Cross-Tab Sync & Fixes** (40% → 50%)
4.  **Budget Feature** (50% → 65%)
5.  **Dashboard Refinement** (65% → 70%)
6.  **Robust Currency Parsing** (70% → 75%)
7.  **Settings V1 Complete** (75% → 85%)
8.  **Dashboard 2.0 & Charts** (85% → 92%)
9.  **Mobile UX & Polish** (92% → 95%)
10. **Transactions Sidebar Unification** (95% → 98% - **OGGI**)
    *   **Unified Sidebar**: Eliminazione flow "sidebar -> dialog" per editing.
    *   **Dirty State**: Dialog di conferma ("Scartare modifiche?") per form modificati.
    *   **UI Command Bar**: Redesign filtri con grid rigida e allineamento perfetto freccette.
    *   **Legacy Cleanup**: Rimossi component `EditTransactionDialog` e `DeleteTransactionDialog`.

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
