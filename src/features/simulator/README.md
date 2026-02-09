# Governance: Simulator / Ottimizzatore

> **Status**: ACTIVE (Read-Only)
> **Role**: Transaction-based Optimization Tool

## Scopo
Questo modulo (`/simulator`) fornisce strumenti per l'analisi "what-if" basata sui **dati storici delle transazioni**.
È stato rinominato in UX come **"Ottimizzatore"** per distinguerlo dal "Labs Simulator" (che è goal-oriented).

## Vincoli
1.  **Read-Only**: Non deve mai modificare i dati delle transazioni.
2.  **Effimero**: Le simulazioni non vengono salvate su DB (solo stato locale).
3.  **Isolation**: Non deve dipendere dai Goal o da Labs.

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
