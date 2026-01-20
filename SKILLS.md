# Luma Budget - Skills & Development Standards

> "Un'unica fonte di verità per lo sviluppo."

Questo file è la **legge** del progetto. Ogni sviluppo deve rispettare queste regole.

---

## 1. Safety First (Legge Zero)

```
Nessuna modifica deve mai rompere il build o lasciare l'app in stato inconsistente.
```

- **Atomicità**: Ogni commit deve essere completo e funzionante
- **Reversibilità**: Deve essere possibile `git revert` senza effetti collaterali
- **Verifica**: `npm run build && npm run test` prima di ogni push

---

## 2. Financial Logic (CRITICO)

### Regole Assolute

| ❌ Vietato | ✅ Obbligatorio |
|-----------|-----------------|
| `parseFloat` su importi | Usare `amountCents` (integer) |
| Formula inline per % | Usare `lib/financial-math.ts` |
| Mix EUR/cents | Tutto internamente in cents |

### Funzioni Centralizzate
```typescript
// lib/financial-math.ts
sumExpensesInCents(transactions)     // Somma spese
sumIncomeInCents(transactions)       // Somma entrate
calculateSharePct(part, total)       // Percentuale
calculateUtilizationPct(spent, budget) // Utilizzo budget

// lib/currency-utils.ts
getSignedCents(transaction)          // +/- cents da transaction
formatCents(cents)                   // cents → "€10,50"
parseCurrencyToCents(string)         // "10,50" → 1050
```

---

## 3. UI/UX Standards

### Page Structure
```tsx
<div className="container mx-auto p-4 md:p-8 space-y-8">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Title</h1>
      <p className="text-muted-foreground mt-1">Subtitle</p>
    </div>
    {/* Actions */}
  </div>
  {/* Content */}
</div>
```

### Component Patterns

| Pattern | Usa Per |
|---------|---------|
| `Sheet` | Form complessi, edit su mobile |
| `Dialog` | Conferme, azioni rapide |
| `AlertDialog` | Azioni distruttive (delete) |
| `Toast` | Feedback success/error transiente |

### Spacing Scale (Solo Tailwind)
- **Micro**: `gap-1`, `gap-2`
- **Component**: `gap-4`, `p-4`
- **Section**: `gap-6`, `gap-8`
- **Layout**: `py-6`, `py-10`

### Styling Rules
- ❌ No inline styles
- ❌ No arbitrary values (`[13px]`)
- ✅ Solo classi Tailwind
- ✅ Design tokens da CSS variables

---

## 4. Code Organization

### Feature Module Structure
```
features/[feature]/
├── api/           # Repository + hooks
├── components/    # UI components
├── utils/         # Feature-specific logic
└── __tests__/     # All tests
```

### Shared Logic
- `lib/` → Generic utilities (currency, date, storage)
- `components/ui/` → Radix/shadcn primitives
- `features/categories/config.ts` → Category definitions

### Categories
- Usare sempre `getCategoryById()` per lookup
- Usare `CategoryIcon` per icone
- Colori da `category.hexColor`

---

## 5. Git Workflow

### Branch Creation
```bash
git checkout main
git pull origin main
git checkout -b feat/my-feature
```

### Pre-Push Checklist
- [ ] `npm run build` passa
- [ ] `npm run test` passa
- [ ] `git log main..HEAD` contiene solo commit pertinenti
- [ ] Nessun `console.log` in produzione

### Branch Naming
- `feat/` → Nuove feature
- `fix/` → Bug fix
- `refactor/` → Refactoring
- `docs/` → Documentazione

---

## 6. Lessons Learned

### 2026-01-17 - Valori 100x nel Simulatore
**Causa**: `formatEuroNumber` su valori già in cents
**Fix**: Usare `formatCents` per valori in centesimi
**Regola**: Mai mischiare EUR e cents

### 2026-01-18 - Calcoli duplicati Flash Summary
**Causa**: Formula inline invece di utility centralizzata
**Fix**: Usare `calculateUtilizationPct` da `financial-math.ts`
**Regola**: Ogni calcolo % deve usare `financial-math.ts`

### 2026-01-14 - Branch contaminato
**Causa**: Branch creato da HEAD invece di origin/main
**Fix**: Sempre partire da `origin/main` aggiornato
**Regola**: `git checkout main && git pull` prima di creare branch

---

## 7. Quick Reference

### Imports Comuni
```typescript
// Currency
import { formatCents, getSignedCents, parseCurrencyToCents } from "@/lib/currency-utils"

// Financial Math
import { sumExpensesInCents, calculateSharePct } from "@/lib/financial-math"

// Categories
import { getCategoryById, getCategoryIcon } from "@/features/categories/config"
import { CategoryIcon } from "@/features/categories/components/category-icon"

// Date
import { calculateDateRange } from "@/lib/date-ranges"
```

---

*Ultima modifica: 2026-01-20*
