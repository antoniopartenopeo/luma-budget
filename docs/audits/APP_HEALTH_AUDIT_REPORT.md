# App Health Audit Report
## Luma Budget - Comprehensive Application Audit

**Data Audit:** 2026-01-20  
**Versione App:** Current (pre-production)  
**Auditor:** Automated Code Analysis

---

## A) Executive Summary

### Stato Generale
Luma Budget è un'applicazione Next.js ben strutturata con una separazione feature-based pulita. L'architettura segue pattern moderni (React Query, feature modules, shared components). L'app presenta solide fondamenta ma richiede consolidamento in aree specifiche per scalare efficacemente.

**Punti di Forza:**
- ✅ Feature modules ben isolati con boundaries chiari
- ✅ Centralized currency utilities (`lib/currency-utils.ts`, `lib/financial-math.ts`)
- ✅ Comprehensive test coverage (23 test files)
- ✅ Consistent loading/error state handling across components
- ✅ Nessun TODO/FIXME non tracciato nel codice

**Top 5 Problemi P0/P1:**

| # | Issue | Severità | Impatto |
|---|-------|----------|---------|
| 1 | **Duplicate date logic** - `insights/utils.ts` usa timezone locale, `lib/date-ranges.ts` usa UTC | P1 | Inconsistenze filtri cross-feature |
| 2 | **Duplicate expense summation** - 6+ implementazioni `Math.abs(amountCents)` reduce | P1 | Rischio drift logico |
| 3 | **Chart colors inconsistent** - Dashboard usa index-based `hsl(chart-N)`, categories hanno `hexColor` | P1 | Inconsistenza visiva |
| 4 | **No centralized category resolution** - lookup scattered across features | P2 | Maintenance overhead |
| 5 | **Mixed transaction form patterns** - Sheet vs Dialog vs inline | P2 | UX incoerenza |

---

## B) UI/UX Audit

| Issue | Severità | Dove | Evidenza | Impatto | Raccomandazione |
|-------|----------|------|----------|---------|-----------------|
| Transaction edit uses Sheet, delete uses AlertDialog | P2 | `transaction-detail-sheet.tsx` | Sheet per edit, AlertDialog per delete | Pattern diversi per stesso contesto | Standardizzare: Sheet per form, AlertDialog per destructive |
| Category chart colors mismatch | P1 | `dashboard/api/repository.ts:74` | `hsl(var(--chart-${(index % 5) + 1}))` | Colori non allineati con `categories/config.ts` hexColor | Usare `category.hexColor` from config |
| KPI card click navigation inconsistent | P2 | `kpi-cards.tsx:165-199` | Solo alcuni KPI sono clickable | Utente non sa quali card sono interattive | Aggiungere hover state visivo o rendere tutti clickable |
| Empty states styling varies | P2 | Multiple components | `LoadingState`, `ErrorState` components vs inline skeleton | Mix di pattern per empty/loading | Usare sempre `<LoadingState>` e `<ErrorState>` |
| Flash Summary uses fixed period, not global filter | P2 | `flash-summary-view.tsx:35` | Hardcoded current month | Non rispetta filtri dashboard | Passare filter come prop |
| Calendar timezone mismatch | P1 | `lib/date-ranges.ts` vs `insights/utils.ts` | UTC vs local Date constructors | Date boundary off-by-one possibile | Consolidare in unico modulo date con timezone esplicito |
| Mobile topbar quick-add width constrained | P2 | `topbar.tsx`, `quick-expense-input.tsx` | Input compresso su mobile | Difficoltà inserimento importo | Redesign mobile quick-add as popover/sheet |
| Settings tabs persistence | P2 | `settings/page.tsx` | Tab state non in URL | Deep linking non funziona | Aggiungere `?tab=` param |

### Accessibilità
| Aspetto | Status | Note |
|---------|--------|------|
| Focus trap in dialogs | ✅ | Radix handles automatically |
| ARIA labels | ⚠️ Partial | `SheetTitle` presente, ma alcuni button mancano `aria-label` |
| Keyboard navigation | ✅ | Tab/Enter funziona su tutti i form |
| Color contrast | ⚠️ | Alcuni testi `muted-foreground` potrebbero non passare WCAG AA |
| Error messaging | ✅ | Toast notifications + inline validation |

---

## C) Domain & Logic Audit

### Matrice Logiche Duplicate

| Logica | File/Funzioni | Cosa Fa | Perché Duplicato | Raccomandazione |
|--------|---------------|---------|------------------|-----------------|
| **Expense Summation** | • `lib/financial-math.ts:sumExpensesInCents`<br>• `insights/utils.ts:getTotalExpenseCents`<br>• `insights/utils.ts:getExpenseTotalsByCategoryCents`<br>• `budget/utils/calculate-budget.ts:17,29,38`<br>• `use-ai-advisor.ts:90,120` | Sum `Math.abs(amountCents)` per expenses | Feature isolation ha portato a copie | **Centralizzare** in `lib/financial-math.ts` e importare ovunque |
| **Month Boundaries** | • `lib/date-ranges.ts:calculateDateRange` (UTC)<br>• `insights/utils.ts:getMonthBoundaries` (local) | Get start/end date for month | Diverse timezone assumptions | **Consolidare** in `lib/date-ranges.ts` con opzione timezone |
| **Filter by Month** | • `insights/utils.ts:filterTransactionsByMonth`<br>• `dashboard/api/repository.ts:36-39,51-55` | Filter transactions by date range | Inline vs utility function | **Usare** utility function ovunque |
| **Current Period** | • `insights/utils.ts:getCurrentPeriod`<br>• Inline logic in multiple components | Format `YYYY-MM` | Stesso pattern ripetuto | **Export** da `lib/date-ranges.ts` |
| **Category Lookup** | • `categories/config.ts:getCategoryById`<br>• Inline `.find()` in 5+ locations | Find category by ID | Convenience functions non usate sempre | **Usare** sempre `getCategoryById` from config |

### Rischi Domain Logic

| Rischio | Severità | Location | Descrizione |
|---------|----------|----------|-------------|
| **amountCents signedness** | P1 | Repository stores absolute, UI needs signed | `repository.ts` stores as `Math.abs()`, `getSignedCents()` reconstructs sign from `type` | Documentare convention, aggiungere JSDoc |
| **Timezone offset** | P1 | `date-ranges.ts` uses UTC, `insights/utils.ts` uses local | Midnight UTC != midnight local | Può causare transazioni nel giorno sbagliato |
| **Budget period mismatch** | P2 | `dashboard/repository.ts:49-56` | Budget usa "pivot" period, dashboard filtra range | Semantica confusa quando mode=range | Documentare regole business |

---

## D) Dead Code / Obsolete

### Candidati Rimozione

| Candidato | Tipo | Location | Confidence | Rischio | Note |
|-----------|------|----------|------------|---------|------|
| `category-distribution-chart.tsx` | Component | `dashboard/components/` | **Media** | Basso | Potrebbe essere sostituito da `charts/category-distribution-echart.tsx` - verificare usage |
| `monthly-expenses-chart.tsx` | Component | `dashboard/components/` | **Media** | Basso | Wrapper per `MonthlyExpensesEChart` - potrebbe essere inline |
| `ChartContainer` usage | Import | Multiple files | **Bassa** | N/A | Shadcn chart wrapper - verificare se usato o ECharts lo sostituisce |
| `INITIAL_SEED_TRANSACTIONS` export | Export | `repository.ts:17` | **Bassa** | Molto Basso | Re-exported "for compatibility" - check if used externally |
| `delay.ts` | Utility | `lib/delay.ts` | **Bassa** | N/A | Used for mock API delays - keep for dev, strip in prod |

### Stringhe Obsolete
Nessuna stringa obsoleta identificata. Copy è in italiano e coerente.

### TODO/FIXME
**Nessun TODO o FIXME** trovato nel codebase - eccellente! ✅

---

## E) Architecture & Folder Structure

### Mappa Architetturale

```
src/
├── app/                          # Next.js routing layer
│   ├── page.tsx                  # Dashboard (/ route)
│   ├── budget/                   # /budget
│   ├── insights/                 # /insights
│   ├── settings/                 # /settings + _components (co-located)
│   ├── simulator/                # /simulator
│   └── transactions/             # /transactions
│
├── components/                   # Shared components
│   ├── ui/                       # 26 Radix/shadcn primitives
│   ├── layout/                   # AppShell, Sidebar, Topbar
│   └── providers/                # QueryProvider, ThemeApplier
│
├── features/                     # Feature modules (domain)
│   ├── budget/                   # api/, components/, utils/
│   ├── categories/               # config, icon-registry, components/
│   ├── dashboard/                # api/, components/, charts/
│   ├── flash/                    # Flash summary widget
│   ├── import-csv/               # core/ (pipeline), components/, ui/
│   ├── insights/                 # generators, hooks, utils
│   ├── settings/                 # api/, backup/, diagnostics/
│   ├── simulator/                # Scenario simulation
│   └── transactions/             # api/, components/, utils/
│
├── lib/                          # Shared utilities
│   ├── currency-utils.ts         # Parse/format cents
│   ├── financial-math.ts         # Calculations
│   ├── date-ranges.ts            # Date filtering
│   ├── storage-utils.ts          # localStorage wrapper
│   └── query-keys.ts             # React Query keys
│
└── test/                         # Test utilities
```

### Osservazioni Architetturali

| Anomalia | Severità | Descrizione | Raccomandazione |
|----------|----------|-------------|-----------------|
| **Settings co-location** | P2 | `app/settings/_components/` vs `features/settings/` | Scegliere: o tutto in feature, o tutto in app route |
| **UI in import-csv** | P1 | `features/import-csv/ui/` è vuota o minimale | Consolidare in `components/` o rimuovere |
| **charts/ nesting** | P2 | `dashboard/components/charts/` + componenti in `dashboard/components/` | Tutti i chart in `charts/` oppure flat |
| **flash/ minimale** | P2 | Solo 2 file, potrebbe essere merge con dashboard | Valutare se merita feature separata |
| **No hooks/ folder** | Minor | Custom hooks sparsi nei feature modules | Okay se rimangono feature-specific |
| **__tests__ inconsistent** | P2 | Alcuni moduli hanno `__tests__/`, altri test accanto ai file | Standardizzare: sempre `__tests__/` subdirectory |

### Target Structure Proposta (Scalabilità)

```
src/
├── app/                          # SOLO routing, minimal logic
│   └── [route]/page.tsx          # Import da features
│
├── components/
│   ├── ui/                       # Primitives (no changes)
│   ├── layout/                   # App shell (no changes)
│   ├── forms/                    # NEW: Shared form patterns (TransactionForm)
│   └── patterns/                 # NEW: Reusable composed patterns
│
├── features/
│   └── [feature]/
│       ├── api/                  # Repository + hooks
│       ├── components/           # Feature components
│       ├── utils/                # Feature-specific utils
│       └── __tests__/            # All tests
│
├── domain/                       # NEW: Pure domain logic
│   ├── transactions/             # Transaction types, normalization
│   ├── categories/               # Category model (from features/categories)
│   └── money/                    # Currency/financial math (from lib/)
│
└── lib/                          # Generic utilities only
    ├── date.ts                   # Date utilities (consolidated)
    ├── storage.ts                # Browser storage
    └── query-keys.ts             # React Query
```

---

## F) Reuse Catalog

### UI Patterns Riusabili

| Pattern | Location | Riusabilità | Come Riusare | Cosa Manca |
|---------|----------|-------------|--------------|------------|
| **KpiCard** | `dashboard/components/kpi-cards.tsx` | Alta | Import component | Move to `components/patterns/` |
| **Sheet Form** | `categories/components/category-form-sheet.tsx` | Alta | Pattern per edit forms | Creare `FormSheet` generic |
| **AlertDialog Confirm** | `settings/_components/categories-section.tsx` | Alta | Pattern per azioni destructive | Creare `ConfirmDialog` wrapper |
| **MonthSelector** | `budget/components/month-selector.tsx` | Alta | Date period picker | Già esportato, può essere shared |
| **DataTable** | `transactions/components/transactions-table.tsx` | Media | Table con sort/filter | Estrarre logica di sorting generic |
| **CategoryIcon** | `categories/components/category-icon.tsx` | Alta | Icon rendering | Già usato correttamente |
| **LoadingState/ErrorState** | `components/ui/loading-state.tsx` | Alta | State messaging | Già shared ✅ |

### Domain Utilities Riusabili

| Utility | Location | Riusabilità | Come Riusare | Cosa Manca |
|---------|----------|-------------|--------------|------------|
| `getSignedCents()` | `lib/currency-utils.ts` | Alta | Transaction→cents | ✅ Already centralized |
| `formatCents()` | `lib/currency-utils.ts` | Alta | cents→string | ✅ Already centralized |
| `sumExpensesInCents()` | `lib/financial-math.ts` | Alta | Aggregate expenses | Usare ovunque (replace duplicates) |
| `calculateSharePct()` | `lib/financial-math.ts` | Alta | % calculations | ✅ Used in dashboard |
| `getCategoryById()` | `categories/config.ts` | Alta | Category lookup | Usare sempre invece di inline find |
| `getGroupedCategories()` | `categories/config.ts` | Alta | Category grouping | ✅ Already centralized |
| `processCsvPipeline()` | `import-csv/core/pipeline.ts` | Alta | CSV processing | Well modularized ✅ |

### Quick Wins (Alto ROI)

| Quick Win | Effort | Impact | Descrizione |
|-----------|--------|--------|-------------|
| **Consolidate date utils** | 2h | Alto | Merge `insights/utils.ts` date functions into `lib/date-ranges.ts` |
| **Replace inline expense sums** | 1h | Medio | Find/replace all `reduce((sum, t) => sum + Math.abs(...))` with `sumExpensesInCents()` |
| **Use category hexColor in charts** | 30m | Medio | Replace index-based colors with config colors |
| **Extract ConfirmDialog** | 1h | Medio | Wrapper for destructive action pattern |
| **Standardize test folders** | 1h | Basso | Move all tests to `__tests__/` subdirectories |

---

## G) Roadmap Suggerita

### Fase 1: Stabilizzazione (1-2 settimane)

**Obiettivi:**
- Eliminare duplicazioni logiche critiche
- Consolidare date/time handling
- Fissare inconsistenze visive chart colors

**Criteri di Successo:**
- [ ] Unico modulo `lib/date-ranges.ts` per tutti i calcoli date
- [ ] Tutte le expense summation usano `lib/financial-math.ts`
- [ ] Chart colors from `category.hexColor`
- [ ] Zero date-boundary bugs in cross-feature filters

**Azioni:**
1. Merge `insights/utils.ts` → `lib/date-ranges.ts` (con timezone handling esplicito)
2. Search & replace inline expense reduce with centralized function
3. Update `dashboard/api/repository.ts` to use `category.hexColor`

---

### Fase 2: Centralizzazione (2-3 settimane)

**Obiettivi:**
- Creare `domain/` layer per logica pura
- Estrarre pattern UI riutilizzabili
- Standardizzare test structure

**Criteri di Successo:**
- [ ] `domain/money/` contiene tutta la logica currency
- [ ] `domain/transactions/` contiene tipi e normalizzazione
- [ ] `components/patterns/` ha KpiCard, FormSheet, ConfirmDialog
- [ ] Tutti i test in `__tests__/` subdirectories

**Azioni:**
1. Create `src/domain/` with extracted pure logic
2. Extract shared UI patterns to `components/patterns/`
3. Reorganize test files

---

### Fase 3: Cleanup (1 settimana)

**Obiettivi:**
- Rimuovere dead code confermato
- Consolidare folder structure anomalies
- Documentation finale

**Criteri di Successo:**
- [ ] No unused components/exports
- [ ] Consistent folder patterns across features
- [ ] Architecture documentation updated

**Azioni:**
1. Verify and remove dead code candidates
2. Consolidate Settings components location
3. Merge flash/ into dashboard or promote to full feature
4. Update docs/architecture.md

---

## Appendice: File Reference

### Critical Files
- `lib/currency-utils.ts` - Source of truth for currency
- `lib/financial-math.ts` - Source of truth for calculations
- `lib/date-ranges.ts` - Needs consolidation with insights/utils
- `categories/config.ts` - Category definitions
- `transactions/api/repository.ts` - Transaction persistence

### Test Coverage
- 23 test files across features
- Good coverage of core logic
- Dashboard calculation tests recently added
- No E2E tests visible in repo

---

*Report generato senza modifiche al codice. Raccomandazioni da validare con team prima di implementazione.*
