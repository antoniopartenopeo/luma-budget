# Goals Logic Vault

> **Status**: LOCKED
> **Role**: Core Domain Logic for Goals/Labs

Questa directory contiene il cervello finanziario del sistema.
Codice qui dentro:
1.  **NON DEVE** dipendere dalla UI (Componenti React, Context UI).
2.  **DEVE** essere indipendente dal framework di visualizzazione.
3.  **DEVE** gestire la logica "Money" e "Date" secondo strict governance.

## Allowed Imports
*   `@/domain/*`
*   `@/lib/*`
*   `@/VAULT/goals/types`
*   `@/VAULT/goals/config/rhythms`
*   `@/VAULT/goals/api/*`
*   `@/VAULT/budget/api/*`
*   `@/features/transactions/api/use-transactions`
*   `@/features/simulator/hooks` (baseline read model)
*   `react`, `date-fns` (orchestrazione hook/date)

## Governance Rules

### 1. Behavior Proof Signature
Ogni modifica al Core deve rispettare questa sequenza:
1.  **Read**: `useTransactions` (Source of Truth).
2.  **Compute**: `baseline` -> `scenarios` -> `projection` (Pure Logic).
3.  **Action**: `setRhythm` -> `savePortfolio` (Persistence).
4.  **No Hidden State**: Vietato accedere a `localStorage` se non via Repository.

### 2. Invariants
*   **Money**: SOLO interi (centesimi). VIETATO `parseFloat` su valuta.
*   **Date**: SOLO `filterByRange` (pivot su mese precedente).

### 3. Forbidden Imports (Strict)
*   ❌ `src/app/**`: Mai importare pagine o layout.
*   ❌ `src/components/**`: Mai importare UI components.
*   ❌ `react-dom`, `framer-motion`: Mai importare animazioni o rendering.

## Logic Files (The Vault)
*   `use-goal-scenarios.ts`: Hook orchestrator per baseline/scenari/proiezioni.
*   `use-goal-portfolio.ts`: Portfolio persistence manager.
*   `financial-baseline.ts`: Baseline math engine.
*   `scenario-generator.ts`: Costruzione configurazioni scenario.
*   `scenario-calculator.ts`: Applicazione savings + sostenibilita + reachability.
*   `sustainability-guard.ts`: Safety checks.
*   `projection-engine.ts`: Proiezione singolo obiettivo.
*   `multi-goal-orchestrator.ts`: Aggregazione portfolio multi-goal.
*   `rhythm-orchestrator.ts`: Bridge per applicare ritmo su budget/portfolio.
*   `../config/rhythms.ts`: Configurazioni ritmo disponibili.
