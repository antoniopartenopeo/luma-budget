# How to navigate the codebase in 30 minutes

Obiettivo: capire dove intervenire senza rompere i vincoli finanziari e di governance.

## Minuti 0-5: mappa ad alto livello

1. Leggi `README.md` e `docs/ARCHITECTURE.md`.
2. Verifica i guardrail in `.agent/rules/numa-core-rules.md`.
3. Fissa i 4 vincoli chiave: cents-only, Tailwind/no inline style, `filterByRange`, test senza logica simulata.

## Minuti 5-12: data model e denaro

1. Apri `src/domain/transactions/types.ts` (fonte verita transazioni).
2. Apri `src/domain/transactions/utils.ts` (normalizzazione e signed cents).
3. Apri `src/domain/money/*` (parse/format/math monetari).

Checklist:
- Esiste solo `amountCents` per persistenza nuova.
- Nessun `parseFloat` sui flussi monetari applicativi.

## Minuti 12-18: periodi e filtri data

1. Apri `src/lib/date-ranges.ts`.
2. Cerca dove i moduli feature filtrano per periodo (`dashboard`, `insights`, `simulator`, `transactions`).
3. Verifica uso di `filterByRange` nei punti con filtro temporale.

Checklist:
- Niente calcolo range manuale duplicato quando esiste util condivisa.

## Minuti 18-24: feature touchpoints (dove cambierai davvero)

- Transactions: `src/features/transactions/`.
- Dashboard/KPI: `src/features/dashboard/`.
- Insights: `src/features/insights/`.
- Vault (logica sensibile): `src/VAULT/`.

Approccio:
- parti dal file `api/repository` o `utils` della feature
- poi passa a `components`
- chiudi con `__tests__`

## Minuti 24-30: test e regressioni governance

1. Esegui `npm run test:run`.
2. Esegui `npm run build`.
3. Esegui `bash scripts/audit/governance-quick-check.sh`.

Se fallisce:
- separa i problemi in backlog: `logic behavior`, `ui behavior`, `doc/comment`.
- risolvi subito solo doc/comment a rischio nullo.

## Navigazione rapida per task comuni

- "Sto aggiungendo dati transazione": parti da `src/domain/transactions/types.ts`.
- "Sto aggiungendo una KPI": parti da `src/features/dashboard/api/repository.ts`.
- "Sto aggiungendo un filtro periodo": parti da `src/lib/date-ranges.ts`.
- "Sto aggiungendo una insight": parti da `src/features/insights/generators.ts`.
