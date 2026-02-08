# Common change patterns

Pattern operativi per cambiare il codice in modo conforme alla governance.

## 1) Aggiungere un campo transazione

Intento: estendere il model senza rompere compatibilita e calcoli monetari.

Passi minimi:
1. Aggiorna il contratto in `src/domain/transactions/types.ts`.
2. Aggiorna la normalizzazione in `src/domain/transactions/utils.ts`.
3. Aggiorna repository in `src/features/transactions/api/repository.ts`.
4. Aggiorna eventuale persistenza/migrazione in test repository.
5. Aggiorna test in `src/features/transactions/api/__tests__/` e `src/domain/transactions/`.

Guardrail:
- non reintrodurre `amount` deprecato nel modello persistito
- mantenere `amountCents` integer come source of truth

## 2) Aggiungere una nuova KPI card

Intento: nuova metrica in dashboard con UI coerente.

Passi minimi:
1. Deriva la metrica in `src/features/dashboard/api/repository.ts` o `src/features/dashboard/utils/kpi-logic.ts`.
2. Esponi la metrica nel tipo API (`src/features/dashboard/api/types.ts` se necessario).
3. Renderizza in `src/features/dashboard/components/kpi-cards.tsx` usando pattern `KpiCard`.
4. Copri con test in `src/features/dashboard/api/__tests__/` o `src/features/dashboard/__tests__/`.

Guardrail:
- niente formule duplicate nei componenti
- niente inline style evitabile
- niente calcolo monetario fuori util/domain gia esistenti

## 3) Aggiungere un nuovo filtro periodo

Intento: nuovo preset temporale o variante di range.

Passi minimi:
1. Estendi preset in `src/features/transactions/components/transactions-filter-bar.tsx` (o feature target).
2. Centralizza il calcolo periodo in `src/lib/date-ranges.ts`.
3. Applica filtro con `filterByRange` nella logica dati (repo/utils), non nel rendering.
4. Aggiorna test di parity/range.

Guardrail:
- vietata logica periodo duplicata con confronti manuali date se `filterByRange` e disponibile

## 4) Aggiungere una nuova insight

Intento: nuova insight deterministic-driven in modulo insights.

Passi minimi:
1. Definisci criterio in `src/features/insights/generators.ts`.
2. Aggiorna tipi in `src/features/insights/types.ts` se necessario.
3. Aggiorna orchestrazione hook (`use-insights`, `use-orchestrated-insights`) solo per wiring.
4. Aggiorna rendering in `src/features/insights/components/`.
5. Aggiungi test in `src/features/insights/__tests__/insights-generators.test.ts`.

Guardrail:
- niente stringhe narrative arbitrarie nei componenti se gia coperte da layer deterministico
- mantenere compatibilita con link/azioni e sorting esistenti

## Definition of done minima

1. `npm run test:run` passa.
2. `npm run build` passa.
3. `bash scripts/audit/governance-quick-check.sh` aggiornato e letto.
4. Nessuna regressione ai constraint non negoziabili.
