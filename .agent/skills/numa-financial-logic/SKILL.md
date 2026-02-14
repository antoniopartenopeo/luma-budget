---
name: numa-financial-logic
description: Use when modifying transaction calculations, budget logic, KPI formulas, or any code handling monetary values (amountCents, formatCents, signed values).
---

# Logica Finanziaria di Numa Budget

Skill operativa per calcoli monetari, KPI, ritmo budget e proiezioni.

---

## Guard di Attivazione

Se la skill non e attiva esplicitamente, fermati e chiedi conferma.

---

## Principio Fondamentale

> Tutti gli importi applicativi sono in **centesimi integer** (`amountCents`).
> `amount` legacy non e la source of truth.

Regole hard:
- niente `parseFloat` sui flussi monetari di prodotto
- niente calcoli monetari duplicati nei componenti UI

---

## Import util obbligatori

```ts
import {
  formatCents,
  formatSignedCents,
  parseCurrencyToCents,
  calculateSharePct,
  calculateUtilizationPct,
  sumExpensesInCents,
  sumIncomeInCents,
} from "@/domain/money"

import { getSignedCents, normalizeTransactionAmount } from "@/domain/transactions"
import { getTone } from "@/features/dashboard/utils/kpi-logic"
```

---

## Convenzione di segno

| Tipo | `amountCents` | `getSignedCents()` |
|---|---:|---:|
| Entrata | positivo | positivo |
| Uscita | positivo | negativo |

Uso corretto:
- saldo/bilancio aggregato -> signed cents
- "quanto hai speso" -> `Math.abs()` + formatter

---

## Budget e ritmo

Campi principali runtime:
- `globalBudgetAmountCents`
- budget per gruppo (`essential`, `comfort`, `superfluous`)

Formula standard:
```ts
const pct = calculateUtilizationPct(spentCents, budgetCents)
```

Ritmo attivo:
- derivato da Goals/Scenari (`src/VAULT/goals/*`)
- applicato a budget operativo tramite `activateRhythm()`

---

## Parsing e formattazione

Parsing input utente:
```ts
const cents = parseCurrencyToCents(input)
```

Formatting:
```ts
formatCents(cents, currency, locale)
formatSignedCents(signedCents, currency, locale)
```

---

## Errori comuni da evitare

```ts
// ❌ saldo sbagliato (somma assoluti)
transactions.reduce((sum, t) => sum + Math.abs(t.amountCents), 0)

// ✅ saldo corretto
transactions.reduce((sum, t) => sum + getSignedCents(t), 0)
```

```ts
// ❌ conversione floating custom
(amountCents / 100).toFixed(2)

// ✅ formatter dominio
formatCents(amountCents)
```

---

## Narration e semantica

- I narrator non fanno calcoli: ricevono facts gia derivati.
- Stati/toni finanziari devono restare coerenti con `src/domain/narration/*`.
- In caso di conflitto tra segnali, vale la priorita del periodo corrente ad alta severita.

---

## Checklist pre-commit

- [ ] Nessun `parseFloat` su flussi monetari applicativi
- [ ] `amountCents` integer usato ovunque come base
- [ ] Bilanci con signed cents
- [ ] Formatting con util dominio
- [ ] KPI/percentuali da util centralizzate
- [ ] Nessuna formula business duplicata in componenti

---

**Versione**: 1.4.0
**Ultimo aggiornamento**: 2026-02-11
