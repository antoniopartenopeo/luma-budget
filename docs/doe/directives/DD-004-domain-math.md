# DD-004: Domain Math Centralization

> "La logica finanziaria vive in un solo luogo. La UI si limita a visualizzarla."

## 1. Obiettivo
Prevenire la dispersione di logica calcistica (formulette) nei componenti UI, garantendo correttezza e manutenibilità.

## 2. Regole Zero (Math)
1.  **Integer First**: Tutti gli importi monetari sono trattati come INTERI (centesimi).
2.  **No Float Parsing**: `parseFloat` è severamente vietato. Usare `Number()` o utility sicure.
3.  **No Ad-Hoc Math**: Vietato inventare calcoli locally components (es. `amount * 0.20` sparso nel JSX).

## 3. Centralizzazione
Tutta la logica matematica deve risiedere in:
- `src/lib/financial-math.ts`: Per funzioni pure (calcolo percentuali, growth, ripartizioni).
- `src/lib/currency-utils.ts`: Per formattazione.
- `src/features/*/utils.ts`: Per logiche specifiche di dominio (ma riutilizzabili).

### Pattern Richiesto
**Bad (Component.tsx):**
```tsx
const tax = Math.round(amount * 0.22); // ❌ Logica di dominio nella UI
```

**Good (Component.tsx):**
```tsx
import { calculateTax } from "@/lib/financial-math";
const tax = calculateTax(amount); // ✅ Delegato
```

## 4. Verifica
Il DOE monitora (via `grep` o code review) l'introduzione di operatori matematici complessi o `Math.*` all'interno di file `.tsx` non di utility.
