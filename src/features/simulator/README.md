# Governance: Financial Lab (/simulator)

> **Status**: ACTIVE (Simulation + Commitment)
> **Role**: Transaction-based Optimization Tool with optional plan activation

## Scopo
Questo modulo (`/simulator`) fornisce strumenti per l'analisi "what-if" basata sui **dati storici delle transazioni**.
In UX il nome canonico e **"Financial Lab"**.
Per coerenza di prodotto, evita l'uso di "Simulator" o "Ottimizzatore" nella copy utente.

## Vincoli
1.  **Read-Only sulle transazioni**: il modulo non modifica mai i movimenti finanziari.
2.  **Simulazione effimera**: i risultati "what-if" restano locali finché l'utente non salva il piano.
3.  **Commit esplicito**: con `Salva Piano`, il modulo può persistire portfolio/rhythm e aggiornare il budget operativo.
4.  **Trasparenza fonte**: il piano mostra sempre se la prudenza usa segnali Brain o storico.

## Core Logic (split reale)
La logica e stata separata in due livelli:

1.  `src/features/simulator/utils.ts`
    * Calcolo medie mensili su transazioni storiche.
    * Raggruppamento categorie per `SpendingNature`.
    * Helper di classificazione stato (es. superfluo `OK/WARN/HIGH`).
    * Dipende da `@/lib/date-ranges` e tipi dominio.

2.  `src/domain/simulation/savings.ts`
    * Engine puro `applySavings` su centesimi interi.
    * Tipi condivisi (`CategoryAverage`, `SimulationResult`).
    * Riutilizzato da Goals (`scenario-calculator.ts`) come source of truth per la matematica di simulazione.

### Commitment path
- `src/VAULT/goals/logic/scenario-calculator.ts`: produce capacità mensile allocabile e proiezione.
- `src/VAULT/goals/logic/rhythm-orchestrator.ts`: applica il ritmo scelto e persiste portfolio/budget.
