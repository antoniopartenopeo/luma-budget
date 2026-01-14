# 00. Core Principles (DOE System)

> "Il sistema governa il caos, ma non soffoca il progresso."

## 1. Safety First (Legge Zero)
Nessuna interazione deve mai rompere il build o lasciare l'applicazione in uno stato inconsistente.
- **Atomicità**: Ogni commit deve essere un'unità di lavoro completa e funzionante.
- **Reversibilità**: Deve essere sempre possibile fare `git revert` senza effetti collaterali complessi.
- **Verifica**: Nulla entra nel branch principale senza passare `npm run doe:verify`.

## 2. The Broken Window Theory
Non tolleriamo regressioni "minori".
- **No Float**: La valuta si gestisce SOLO in centesimi (integer). Vietato `parseFloat` su importi monetari.
- **No Inline Styles**: Usare solo classi Tailwind o design tokens.
- **No Console Logs**: Il codice di produzione deve essere pulito.

## 3. Iteration Protocols
- **Directive**: Prima leggi le regole.
- **Orchestration**: Pianifica e documenta prima di agire.
- **Execution**: Implementa con precisione chirurgica.

Ogni modifica significativa deve essere accompagnata da un aggiornamento del **Registry** o del **Regression Map** se tocca flussi critici.
