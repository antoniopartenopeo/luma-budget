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

## Core Logic (`utils.ts`)
Il file `utils.ts` contiene la logica pura di proiezione e calcolo dei risparmi.
Questa logica è considerata **Core Domain Logic** e può essere riutilizzata in altri moduli (es. Insights) importandola direttamente.
