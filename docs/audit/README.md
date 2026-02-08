# Audit Operativo Luma/Numa

Stato: attivo (guardrail non negoziabili)

Questo pacchetto rende operativo l'audit tecnico senza cambiare la logica di prodotto.

## Constraint non negoziabili

- Money: cents-only (`amountCents` integer), niente `parseFloat` su importi.
- UI: overlay + classi Tailwind, no `style={{...}}` salvo eccezioni tecniche documentate.
- Period filters: usare `filterByRange` (`/src/lib/date-ranges.ts`) invece di logiche duplicate.
- Test integrity: i test non devono simulare la logica di produzione se esiste una util importabile.

## Documenti

- [How to navigate the codebase in 30 minutes](./how-to-navigate-codebase-30-min.md)
- [Common change patterns](./common-change-patterns.md)
- [Governance Quick Check report](./quick-check.md)

## Quick start audit

1. Esegui `bash scripts/audit/governance-quick-check.sh`.
2. Leggi il report generato in `docs/audit/quick-check.md`.
3. Se trovi violazioni con impatto su behavior o logica, apri backlog (non fix diretto in hot pass).

## Enforcement automatico

- Comando enforcement: `bash scripts/audit/governance-enforce.sh`
- Soglie baseline anti-regressione: `docs/audit/governance-thresholds.env`
- Hook locale: `.githooks/pre-push` (attivabile con `bash scripts/setup.sh`)
- CI: workflow `.github/workflows/doe-verify.yml` (push + pull_request)

## Regola di intervento

- Fix diretto ammesso: typo documentali, link rotti, commenti chiaramente fuorvianti.
- Non fixare in audit pass: logica prodotto, comportamento UI, algoritmi dominio.
