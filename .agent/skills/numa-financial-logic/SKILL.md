---
name: numa-financial-logic
description: Use when modifying transaction calculations, budget logic, KPI formulas, or any code handling monetary values (amountCents, formatCents, signed values).
---

# Logica Finanziaria di Numa Budget

Questa skill fornisce le procedure dettagliate per lavorare con calcoli monetari, budget, e KPI.

---

## Guard di Attivazione

Se questa skill non è chiaramente attiva, **FERMATI** e chiedi all'utente di invocarla esplicitamente per nome.
Non procedere in modalità "best effort".

---

## Principio Fondamentale

> **Tutti i valori monetari sono memorizzati e calcolati in CENTESIMI (integer).**
> Il campo deprecato `amount` è stato **RIMOSSO**. **NON USARE**. Usa solo `amountCents`.
> Mai usare `parseFloat` su valori monetari.

---

## Import Obbligatori

```typescript
// Matematica e formattazione
import { 
  sumExpensesInCents, 
  sumIncomeInCents, 
  calculateSharePct, 
  calculateUtilizationPct,
  formatCents,
  parseCurrencyToCents
} from "@/domain/money"

// Transazioni
import { 
  getSignedCents, 
  normalizeTransactionAmount 
} from "@/domain/transactions"

// KPI e Toni colore
import { getTone } from "@/features/dashboard/utils/kpi-logic"
```

---

## Convenzione di Segno

### Regola Base

| Tipo | `amountCents` | `getSignedCents()` |
|------|---------------|-------------------|
| Entrata | **positivo** | **positivo** |
| Uscita | **positivo** | **negativo** |

### Quando Usare Cosa

| Scenario | Usa |
|----------|-----|
| Calcolo bilancio totale | `getSignedCents()` |
| Somma solo uscite | `sumExpensesInCents()` |
| Somma solo entrate | `sumIncomeInCents()` |
| Display "Speso: €X" | `Math.abs()` + `formatCents()` |
| Confronto magnitudine | `Math.abs()` |

### ⚠️ Errore Comune

```typescript
// ❌ SBAGLIATO: somma valori assoluti per bilancio
const balance = transactions.reduce((sum, t) => sum + Math.abs(t.amountCents), 0)

// ✅ CORRETTO: usa signed cents
const balance = transactions.reduce((sum, t) => sum + getSignedCents(t), 0)
```

---

## Budget

### Campi

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `globalBudgetAmountCents` | `number` | Budget globale mensile |
| `amountCents` | `number` | Budget per gruppo/categoria |

### Calcoli

```typescript
import { calculateUtilizationPct } from "@/domain/money"

// Percentuale utilizzo budget
const pct = calculateUtilizationPct(spentCents, budgetCents)
// Ritorna 0-100+, gestisce division by zero
```

---

## Formattazione

```typescript
import { formatCents } from "@/domain/money"

// ✅ Da cents a display
formatCents(12345) // → "€123,45"

// ❌ MAI fare questo
(amountCents / 100).toFixed(2) // Errori di arrotondamento
```

---

## Parsing Input Utente

```typescript
import { parseCurrencyToCents } from "@/domain/money"

// ✅ Da stringa a cents
parseCurrencyToCents("123,45") // → 12345
parseCurrencyToCents("€ 1.234,56") // → 123456

// ❌ MAI usare parseFloat
parseFloat(input.replace(/[€,]/g, '')) // VIETATO
```

---

## KPI e Toni Colore

```typescript
import { getTone } from "@/features/dashboard/utils/kpi-logic"

// Tono basato su percentuale
const tone = getTone(utilizationPct)
// → "success" | "warning" | "danger" | "neutral"
```

---

## Esempi Bad/Good

### Calcolo Percentuale

```typescript
// ❌ SBAGLIATO: inline
const percent = Math.round((spent / budget) * 100)

// ✅ CORRETTO: centralizzato
import { calculateUtilizationPct } from "@/domain/money"
const percent = calculateUtilizationPct(spentCents, budgetCents)
```

### Parsing Valuta

```typescript
// ❌ SBAGLIATO: parseFloat
const amount = parseFloat(input.replace(/[€,]/g, ''))

// ✅ CORRETTO: utility centralizzata
import { parseCurrencyToCents } from "@/domain/money"
const amountCents = parseCurrencyToCents(input)
```

### Display Importo

```typescript
// ❌ SBAGLIATO: formatEuroNumber su cents
formatEuroNumber(amountCents) // Mostra 100x il valore!

// ✅ CORRETTO: formatCents
import { formatCents } from "@/domain/money"
formatCents(amountCents) // → "€123,45"
```

---

## Narration & Insights (Flash Summary)

### Derivazione Stato (Invarianti)

Se il saldo è negativo (`balanceCents < 0`), lo stato **NON PUÒ MAI** essere `thriving`, `stable` o `calm`. 

### Priorità dei Segnali

L'analisi deve seguire questo ordine gerarchico:
1. **Saldo** (Deficit)
2. **Budget** (Sforamento)
3. **Spese Superflue** (Oltre target)
4. **Composizione** (Top categories)

### Toni di Voce

- **Saldo Negativo**: Mai usare toni celebrativi o auto-assolutori.
- **Stato Stable**: Deve essere descrittivo (equilibrio) e non di lode ("impeccabile").
- **Stato Calm**: Riservato a dati insufficienti o inizio periodo.

---

## Lessons Learned

| Data | Problema | Causa | Prevenzione |
|------|----------|-------|-------------|
| 2026-01-17 | Simulatore mostra valori 100x | `formatEuroNumber` su cents | Usa `formatCents` per cents |
| 2026-01-18 | Calcoli duplicati in Flash Summary | Formule inline | Usa sempre `financial-math.ts` |
| 2026-01-25 | Narration elogia saldo negativo | Fallback errato su "Calm" | Invariante: saldo negativo != stable |
| 2026-01-27 | Refactor `amountCents` broken metrics | Fallback su `amount` (stringa) rimosso | Rimosso ogni riferimento a `t.amount` |

---

## Checklist Pre-Commit

- [ ] Nessun `parseFloat` su valori monetari
- [ ] Tutti gli importi in `amountCents` (integer)
- [ ] Bilanci calcolati con `getSignedCents()`
- [ ] Formattazione display con `formatCents()`
- [ ] Percentuali con `calculateUtilizationPct()`

---

**Versione**: 1.2.0  
**Ultimo aggiornamento**: 2026-02-01
