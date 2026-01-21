# Luma Budget - App Health Audit Report V2

## A) Executive Summary
Following the Phase 1-3 remediation, the core "Safety" issues (P0) related to financial parsing and "Consistency" issues (P1) related to date filtering have been largely resolved. The transition to `src/domain` is now an established pattern. However, the audit reveals a significant "Remnant Debt" in the **Test Suite**, where logic is often simulated rather than imported, and a **Domain Lag** in the Budget feature.

**Current Health Score: 85/100** (Up from ~60/100)

**Top Issues (Next Phase):**
1. **[P2] Test Logic Duplication**: Tests for KPIs and superfluous expenses re-implement logic with unsafe math instead of testing production code.
2. **[P2] Budget Domain Lag**: The Budget feature models still use floating-point numbers instead of Cents.
3. **[P2] Residual Date Logic**: Some feature utilities (`budget/utils`) still possess their own filtering logic instead of using centralized helpers.

---

## B) UI/UX Verification
| Issue | Status | Note |
|-------|--------|------|
| **Native Alert** | ✅ RISOLTO | Sostituito con `ConfirmDialog` in `TransactionsPage`. |
| **Missing ARIA Labels** | ✅ RISOLTO | Aggiunte label a `QuickExpenseInput`. |
| **Indirect Delete Flow** | ✅ RISOLTO | Trigger diretto dalla tabella transazioni implementato. |
| **Custom Dialog Bypass** | ✅ RISOLTO | `FlashOverlay` ora usa `DialogContent` standard. |
| **Complex Wizard in Dialog** | 🟡 PENDENTE | Considerare migrazione a pagina se il wizard cresce oltre gli step attuali. |

---

## C) Domain & Logic Audit (V2)
| Logica | Stato / Nuova Osservazione | Raccomandazione |
|--------|----------------------------|-----------------|
| **Financial Parsing** | ✅ RISOLTO in Import/Transactions. | **NUOVO**: Estendere a Budget Models. |
| **Date Range Filtering** | 🟠 PARZIALE | Centralizzato in Dashboard/Insights. Ancora manuale in `budget/utils`. |
| **KPI Summaries** | ✅ RISOLTO | Refactor con utilities domain completato. |
| **Test Integrity** | 🔴 CRITICO | **NUOVO**: Rimuovere simulazioni `parseFloat` nei test e importare logic dal domain. |

---

## D) Architecture & Pattern Analysis
### Wins
- **Hook Extraction**: `useTransactionsView` è un ottimo esempio di separazione tra UI (View) e Logica di Presentazione.
- **Domain Purity**: `src/domain` non ha più dipendenze verso il layer `features`.

### Opportunities
- **Budget Refactor**: Portare la `BudgetPlan` a usare `amountCents` per coerenza con il resto del sistema finanziario.
- **Test Refactoring**: Migrare `superfluous-kpi.test.ts` e simili all'uso delle funzioni esportate dal `repository` o dal `domain`.

---

## E) Aggiornamento Roadmap

### Fase 4: Integrità dei Test & Budget (Immediata)
- **Refactor Budget Types**: Migrare `BudgetPlan` e `GroupBudget` all'uso dei Cents (Integer).
- **Test Logic Sync**: Sostituire le implementazioni "fake" nei test con importazioni dirette dalla logica di produzione.
- **Date Logic Final Cleanup**: Migrare `calculate-budget.ts` all'uso di `filterByRange`.

### Fase 5: Estensibilità (Futuro)
- **Generic View Pattern**: Creare un pattern hook generico per viste tabellari/listate.
- **AI Feedback Optimization**: Standardizzare come gli insights vengono generati tra Flash e AI Advisor Card.
