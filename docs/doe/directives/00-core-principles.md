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
    - **Policy**: Il controllo `doe:verify` fallisce se `parseFloat` viene individuato in *nuovi file* o *file modificati* non presenti nella whitelist (Legacy Registry).
    - **Legacy**: Codice esistente è tollerato (warning) solo se documentato in `legacy-registry.md`.
- **No Inline Styles**: Usare solo classi Tailwind o design tokens.
- **No Console Logs**: Il codice di produzione deve essere pulito.

## 3. Iteration Protocols
- **Directive**: Prima leggi le regole.
- **Orchestration**: Pianifica e documenta prima di agire.
- **Execution**: Implementa con precisione chirurgica.

Ogni modifica significativa deve essere accompagnata da un aggiornamento del **Registry** o del **Regression Map** se tocca flussi critici.

## 4. Branch Creation Policy
Per prevenire contaminazione della history:
- **Base**: I feature branch DEVONO partire da `origin/main` aggiornato.
  ```bash
  git checkout main
  git pull origin main
  git checkout -b feat/my-feature
  ```
- **Pre-PR Check**: Verificare sempre `git log main..HEAD` per assicurarsi che contenga SOLO i commit pertinenti.
