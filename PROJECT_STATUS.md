# LumaBudget - Project Status Report

## A) Executive Summary
LumaBudget è una web app di gestione delle finanze personali (PWA-ready) costruita su **Next.js 16 (App Router)** e **React 19**. Utilizza **React Query v5** per lo state management asincrono e **localStorage** come layer di persistenza client-side, con supporto sync cross-tab.

Il focus recente è stato sulla **Gestione Categorie Dinamiche** (localStorage-backed) e sull'**Ottimizzazione della pagina Impostazioni** (Tabs layout, URL persistence, performance). Le sezioni Core sono complete e testate con **141 test unitari/integrazione**. Insights è attualmente disabilitata ("Soon").

## B) Tree Schema (Core Dependencies)
```ascii
src/
├── app/
│   ├── layout.tsx              # [REAL] AppShell, QueryProvider, Toaster
│   ├── page.tsx                # [REAL] Dashboard (Global Filters, KPI Grid, Charts)
│   ├── transactions/page.tsx   # [REAL] CRUD Table + Filters + Export
│   ├── budget/page.tsx         # [REAL] Budget Mgmt (Global vs Groups)
│   └── settings/
│       ├── page.tsx            # [NEW] Tabs layout + URL persistence (?tab=)
│       └── _components/        # [NEW] PreferencesSection, CategoriesSection, etc.
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx         # [REAL] Navigation (Insights disabled)
│   │   └── topbar.tsx          # [UPD] QuickAdd hidden on /settings
│   └── ui/                     # [REAL] Shadcn components + Switch
├── features/
│   ├── categories/
│   │   ├── api/repository.ts   # [NEW] Versioned storage, soft-delete
│   │   ├── api/use-categories.ts # [NEW] React Query hooks
│   │   ├── icon-registry.ts    # [NEW] String → LucideIcon mapping
│   │   └── config.ts           # [UPD] Category type with iconName
│   ├── settings/
│   │   ├── backup/backup-utils.ts # [UPD] Categories included
│   │   └── diagnostics/        # [UPD] Uses storage-keys registry
│   └── transactions/
│       └── components/         # [UPD] Uses dynamic categories
└── lib/
    ├── query-keys.ts           # [REAL] QueryKeyFactory + categories scope
    ├── storage-keys.ts         # [NEW] Centralized storage keys registry
    └── currency-utils.ts       # [REAL] Integer cents helpers
```

## C) Feature Inventory
| Feature | Sezione | Stato | % | Evidence / Note |
| :--- | :--- | :--- | :--- | :--- |
| **Category Management** | Settings | ✅ Definitivo | 100% | localStorage, soft-delete, cross-tab sync, backup/restore |
| **Settings Optimization** | Settings | ✅ Definitivo | 100% | 4 Tabs, URL persistence, AlertDialog, pagination categorie |
| **Storage Keys Registry** | Core | ✅ Definitivo | 100% | Centralizzato per diagnostics/backup |
| **Filtri & Search** | Transazioni | ✅ Definitivo | 100% | Ricerca, Tipo, Categoria, Periodo, Solo Superflue |
| **Query Keys Factory** | Core | ✅ Definitivo | 100% | Factory centralizzata TanStack Query v5 |
| **`amountCents` Logic** | Core | ✅ Definitivo | 100% | Fonte di verità intera (centesimi) + backfill |
| **Budget Plan** | Budget | ✅ Definitivo | 100% | Gestione globale e per gruppi |
| **Cross-tab Sync** | Core | ✅ Definitivo | 100% | Storage events + Cache Invalidations |
| **Insights** | Insights | 🔴 Da avviare | 0% | Link in sidebar disabilitato ("Soon") |

**Stima Avanzamento Totale App: ~99%** (Core functionality and architecture robustness completed).

## D) Timeline Cronologica
1-12. (Vedere versioni precedenti)
13. **Category Management Migration** (99% → 99%)
    - `ICON_REGISTRY` per serializzazione icone
    - Repository con versioned schema (`luma_categories_v1`)
    - Soft-delete (archiving) per preservare storico
    - Integrazione backup/restore
14. **Settings Optimization** (99% → 99% - **OGGI**)
    - Tabs layout (Preferenze, Categorie, Backup, Avanzate)
    - URL persistence con `?tab=` query param
    - Tabella Categorie: ricerca + paginazione + toggle archiviate
    - `storage-keys.ts` registry centralizzato
    - QuickAdd nascosto su `/settings`

## E) Backlog
### Completati di recente
*   ✅ **Gestione Categorie**: Migrato in LocalStorage con soft-delete e backup.
*   ✅ **Settings UX**: Riorganizzato con Tabs e URL deep-linking.

### Da avviare
*   **Pagina Insights**: Grafici avanzati (trend annuale, breakdown profondo).
*   **Onboarding**: Wizard iniziale per primo avvio (Budget/Valuta).
*   **Category CRUD UI**: Aggiunta/modifica categorie customizzate.

## F) Raccomandazioni (Prossimi 3 Step)
1.  **Insights MVP**: Attivare la rotta `/insights` con grafici annuali.
2.  **Category Editor**: UI per creare/modificare categorie custom.
3.  **Onboarding Wizard**: Percorso guidato per nuovi utenti.
