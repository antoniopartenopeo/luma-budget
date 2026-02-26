# Quota Logic Vault

scope: goals-vault-logic-contract
owner: feature-goals
status: reference
last-verified: 2026-02-26
canonical-of: none

> **Status**: LOCKED
> **Role**: Core Domain Logic for Financial Lab quota-mode

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
*   `date-fns` (solo helper temporali, se necessario)

## Governance Rules

### 1. Behavior Proof Signature
Ogni modifica al Core deve rispettare questa sequenza:
1.  **Read**: il read-model viene preparato fuori dal Vault.
2.  **Compute**: `baseline` -> `scenarios` -> `quota` (Pure Logic).
3.  **Action**: nessuna persistenza implicita nel flusso Financial Lab.
4.  **No Hidden State**: Vietato accedere a `localStorage` se non via Repository.

### 2. Invariants
*   **Money**: SOLO interi (centesimi). VIETATO `parseFloat` su valuta.
*   **Date**: usare util condivise `calculateDateRange` + `filterByRange` (pivot su mese precedente).

### 3. Forbidden Imports (Strict)
*   ❌ `src/app/**`: Mai importare pagine o layout.
*   ❌ `src/components/**`: Mai importare UI components.
*   ❌ `react-dom`, `framer-motion`: Mai importare animazioni o rendering.

## Logic Files (The Vault)
*   `financial-baseline.ts`: Baseline math engine.
*   `scenario-generator.ts`: Costruzione configurazioni scenario.
*   `scenario-calculator.ts`: Applicazione savings + sostenibilita + quota sostenibile.
*   `sustainability-guard.ts`: Safety checks.
*   `realtime-overlay.ts`: Correzione prudenziale breve periodo.
*   `../config/rhythms.ts`: Configurazioni ritmo disponibili.
*   `src/features/goals/hooks/use-quota-scenarios.ts`: orchestrazione React (fuori Vault) che usa il core.

## Boundary di persistenza
- La simulazione resta read-only sui dati transazionali.
- Il flusso Financial Lab quota-mode non applica commitment su portfolio o sistemi legacy.
