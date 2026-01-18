# Lessons Learned

> "Chi non impara dalla storia è condannato a ripeterla."

Questo documento traccia errori significativi, le loro cause, e le misure preventive adottate.

---

## Template Entry

```markdown
### [DATA] - Titolo Breve
**Severità**: P0 / P1 / P2
**Area**: [Dashboard / Transactions / Simulator / etc.]

#### Cosa è Successo
Descrizione dell'errore o bug.

#### Root Cause
Perché è successo (analisi tecnica).

#### Risoluzione
Come è stato risolto.

#### Misura Preventiva
Quale regola, test, o controllo è stato aggiunto per prevenire ricorrenza.

#### Link
- Commit: [hash]
- PR: [link]
```

---

## Log

### 2026-01-17 - Simulatore mostrava valori 100x troppo alti
**Severità**: P0
**Area**: Simulator

#### Cosa è Successo
I valori delle categorie nel Simulatore erano visualizzati 100x il valore corretto (es. 14644€ invece di 146,44€).

#### Root Cause
Il componente usava `formatEuroNumber` su valori già in centesimi, interpretandoli come unità.

#### Risoluzione
Sostituito `formatEuroNumber` con `formatCents` in `simulator/page.tsx`.

#### Misura Preventiva
- Aggiunta regola in `00-core-principles.md`: calcoli finanziari devono usare `financial-math.ts`.
- Audit completo di tutti i componenti che usano currency formatting.

---

### 2026-01-14 - Branch contaminato da feat/insights
**Severità**: P1
**Area**: Git Workflow

#### Cosa è Successo
Il branch `feat/doe-system` conteneva commit non pertinenti provenienti da `feat/insights-sensitivity`.

#### Root Cause
Branch creato da `HEAD` invece che da `origin/main`.

#### Risoluzione
Cambiamenti accettati come release, ma documentato in `active-context.md`.

#### Misura Preventiva
- Aggiunta regola in `00-core-principles.md` sezione 4: "Branch Creation Policy".
- Checklist pre-PR: verificare `git log main..HEAD`.

---

### 2026-01-18 - Calcoli duplicati in Flash Summary
**Severità**: P1
**Area**: Flash / Dashboard

#### Cosa è Successo
Il componente Flash conteneva formule inline per `budgetUsedPct` e `savingsRate` invece di usare funzioni centralizzate.

#### Root Cause
Il componente era stato scritto prima dell'introduzione di `financial-math.ts`.

#### Risoluzione
Refactoring per usare `calculateUtilizationPct` e `calculateSharePct`.

#### Misura Preventiva
- Regola aggiunta: "Centralized Logic" in `00-core-principles.md`.
- Pattern da seguire: ogni nuovo componente che calcola percentuali DEVE importare da `financial-math.ts`.
