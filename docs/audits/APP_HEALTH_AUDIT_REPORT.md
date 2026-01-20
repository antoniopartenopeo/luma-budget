# Luma Budget - App Health Audit Report

## A) Executive Summary
Luma Budget is in a positive transition phase toward a robust Domain-Driven Architecture (`src/domain`). However, the audit reveals a significant "Technical Debt" overlap between legacy utilities and new domain logic. A **critical P0 issue** was identified in the CSV Import logic using unsafe floating-point math for financial values, violating the core `SKILL.md` governance. UI/UX is highly polished but suffers from minor inconsistencies in feedback mechanisms (native alerts) and accessibility (missing ARIA labels).

**Top 5 Issues:**
1. **[P0] Unsafe Money Parsing**: `import-csv` uses `parseFloat` for amounts, risking precision errors.
2. **[P1] Logic Duplication**: Date filtering and summary calculations are re-implemented across 3+ features.
3. **[P1] UX Inconsistency**: Usage of browser `alert()` instead of UI components for export errors.
4. **[P2] Dead UI Components**: Several Radix primitives (Avatar, Command) are unused and bloating the project.
5. **[P2] Governance Drift**: `SKILL.md` documentation refers to deleted files and obsolete patterns.

---

## B) UI/UX Audit
| Issue | Severità | Dove | Evidenza | Impatto | Raccomandazione |
|-------|----------|------|----------|---------|-----------------|
| **Native Alert** | P1 | `transactions/page.tsx` | Uso di `alert()` in `handleExport` | Basso/Medio | Sostituire con `toast` o `ConfirmDialog`. |
| **Complex Wizard in Dialog** | P2 | `csv-import-wizard.tsx` | Dialog di 85vh per flusso complesso | Medio | Valutare migrazione a `Sheet` o pagina dedicata. |
| **Missing ARIA Labels** | P2 | `quick-expense-input.tsx` | Pulsanti "Entrata/Uscita" senza label | Alto (A11y) | Aggiungere `aria-label` descrittivi. |
| **Indirect Delete Flow** | P2 | `transactions-table.tsx` | Click "Elimina" apre lo sheet invece del confirm | Basso | Trigger diretto di `ConfirmDialog` per azioni distruttive. |
| **Custom Dialog Bypass** | P2 | `flash-overlay.tsx` | Uso di `DialogPrimitive` invece del tema UI | Medio | Unificare con i componenti di sistema `src/components/ui`. |

---

## C) Domain & Logic Audit
| Logica | Duplicazioni | File/Funzioni | Rischio | Raccomandazione |
|--------|--------------|---------------|---------|-----------------|
| **Financial Parsing** | 2 | `normalize.ts` (legacy) vs `currency.ts` (domain) | **CRITICO** | Rimuovere `parseFloat` in `normalize.ts` e usare `parseCurrencyToCents`. |
| **Date Range Filtering** | 3 | `RecentTransactions.tsx`, `insights/utils.ts`, `dashboard/api/repository.ts` | **ALTO** | Centralizzare in `src/lib/date-ranges.ts` o `src/domain/dates`. |
| **KPI Summaries** | 2 | `dashboard/api/repository.ts` vs `transactions/utils/transactions-logic.ts` | Medio | Usare le utility domain `sumExpensesInCents` ovunque. |
| **Legacy Euro Conversion** | 2 | API che ritornano Euro (float) invece che Cents (int) | Medio | Mantenere internamente i Cents fino alla visualizzazione finale. |

---

## D) Dead Code / Obsolete
| Candidato Rimozione | Confidence | Rischio | Note |
|---------------------|------------|---------|------|
| **src/components/ui/avatar.tsx** | Alta | Zero | Mai importato nel codice sorgente. |
| **src/components/ui/command.tsx** | Alta | Zero | Mai importato nel codice sorgente. |
| **transaction.icon (field)** | Media | Basso | Sostituiti da `CategoryIcon` via `categoryId`. |
| **SKILL.md references** | Alta | N/A | Riferimenti a `lib/currency-utils` e `financial-math` (file eliminati). |
| **unused types in transactions** | Bassa | Basso | Alcuni DTO in `api/types.ts` sembrano overlap con quelli domain. |

---

## E) Architecture & Folder Structure
### High-Level Map
- `src/domain`: Core Logic (Money, Transactions, Categories).
- `src/features`: Feature Modules (Wizards, Charts, Sheets).
- `src/components/ui`: Shadcn Primitives.
- `src/lib`: Generic Utils (Storage, Date ranges).

### Observations
- **Feature Leak**: Molta logica di filtraggio/ordinamento risiede ancora nei file UI (`page.tsx` o `components/utils`).
- **Domain Migration**: La migrazione al layer `domain` è completa al 60%. Restano molti "import lib" che dovrebbero essere passati al domain.

### Target Structure
```bash
src/
  domain/
    shared/ (money, dates, math)
    transactions/ (models, validators, filter-logic)
    categories/ (definitions, icons)
    budget/ (calculations)
  features/
    [feature-name]/
      components/
      hooks/ (UI logic only)
      api/ (Data fetching only)
```

---

## F) Reuse Catalog
### UI Components
- **PageHeader**: Standardizzato e pronto all'uso.
- **StateMessage**: Ottimo per gestire loading/error/empty con coerenza.
- **CategoryIcon**: Centralizzato e robusto.

### Domain Logic
- **`resolveBudgetGroupForTransaction`**: Logica critica per la classificazione Essential/Comfort/Superfluous.
- **`parseCurrencyToCents`**: Fondamentale per la sicurezza dei dati finanziari.

### Quick Wins
- **Centralizzazione Date**: Spostare tutto il `Date math` da `RecentTransactions` e `Dashboard` in `lib/date-ranges.ts`.
- **Cleanup SKILL.md**: Aggiornare le linee guida per riflettere il nuovo stato dei file `domain`.

---

## G) Roadmap Suggerita
### Fase 1: Stabilizzazione (Immediata)
- **Fix P0**: Migrare `import-csv` all'uso di `parseCurrencyToCents`.
- **A11y Fix**: Aggiungere label mancanti a pulsanti e input icon-only.
- **Alert Migration**: Sostituire `window.alert` con componenti UI.

### Fase 2: Centralizzazione (Breve Termine)
- **Logic Sync**: Rimuovere le duplicazioni di filtraggio date.
- **Rule Update**: Aggiornare `SKILL.md` con i path corretti (`@/domain/*`).
- **Icon Cleanup**: Rimuovere il campo `icon` dalle transazioni e usare solo `categoryId`.

### Fase 3: Cleanup (Mantenimento)
- **Dead Code Removal**: Eliminare i componenti UI inutilizzati.
- **Refactor app/transactions**: Spostare la logica di filtraggio complessa da `page.tsx` a un hook dedicato.
