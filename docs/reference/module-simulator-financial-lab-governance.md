# Governance: Financial Lab (/simulator)

scope: simulator-financial-lab-contract
owner: feature-simulator
status: reference
last-verified: 2026-02-26
canonical-of: none

> **Status**: ACTIVE (Advisory Quota Mode)
> **Role**: Transaction-based tool to estimate sustainable fixed monthly quota

## Scopo
Questo modulo (`/simulator`) fornisce strumenti per l'analisi "what-if" basata sui **dati storici delle transazioni**.
In UX il nome canonico e **"Financial Lab"**.
Per coerenza di prodotto, evita l'uso di "Simulator" o "Ottimizzatore" nella copy utente.
L'interfaccia runtime corrente è centrata su card scenario espandibili con spiegazione step-by-step della quota.

## Vincoli
1.  **Read-Only sulle transazioni**: il modulo non modifica mai i movimenti finanziari.
2.  **Simulazione effimera**: i risultati "what-if" restano locali e non attivano piani persistenti.
3.  **No Commitment Path**: la pagina non salva portfolio/rhythm e non aggiorna budget operativo.
4.  **Trasparenza fonte**: il piano mostra sempre se la prudenza usa segnali Core o storico.
5.  **Migrazione legacy one-shot**: al primo avvio può azzerare stato legacy (`numa_goal_portfolio_v1`, `numa_active_goal_v1`, budget legacy condizionale) e scrive il marker `numa_finlab_hard_switch_v1_done`.
6.  **Single Surface**: la derivazione quota (base -> correzione live -> quota finale) è integrata nelle card scenario, senza pannelli esterni duplicati.

## Core Logic (split reale)
La logica e stata separata in due livelli:

1.  `src/features/simulator/utils.ts`
    * Calcolo medie mensili su transazioni storiche.
    * Dipende da `@/lib/date-ranges` e tipi dominio.

2.  `src/domain/simulation/savings.ts`
    * Engine puro `applySavings` su centesimi interi.
    * Tipi condivisi (`CategoryAverage`, `SimulationResult`).
    * Riutilizzato da Goals (`scenario-calculator.ts`) come source of truth per la matematica di simulazione.

### Advisory path
- `src/VAULT/goals/logic/scenario-calculator.ts`: produce quota mensile sostenibile (base + overlay realtime).
- `src/VAULT/goals/logic/realtime-overlay.ts`: applica correzione prudenziale breve periodo usando segnali Insights.
