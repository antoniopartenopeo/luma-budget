# Audit Operativo Numa Budget

scope: governance-audit-process
owner: governance
status: active
last-verified: 2026-02-26
canonical-of: audit-process

Stato: attivo (guardrail non negoziabili)

Questo pacchetto rende operativo l'audit tecnico senza cambiare la logica di prodotto.

## Constraint non negoziabili

- Money: cents-only (`amountCents` integer), niente `parseFloat` su importi.
- UI: overlay + classi Tailwind, no `style={{...}}` salvo eccezioni tecniche documentate.
- Period filters: usare `filterByRange` (`/src/lib/date-ranges.ts`) invece di logiche duplicate.
- Test integrity: i test non devono simulare la logica di produzione se esiste una util importabile.

## Documenti

- [Codebase navigation in 30 minutes](./codebase-navigation-30-min.md)
- [Change patterns playbook](./change-patterns-playbook.md)
- Generated output runtime: `docs/reports/generated-governance-quick-check.md` (non versionato)

## Quick start audit

1. Esegui `bash scripts/audit/governance-quick-check.sh`.
2. Leggi il report generato in `docs/reports/generated-governance-quick-check.md`.
3. Se hai toccato `CHANGELOG.md` (feed notifiche in-app), esegui anche `npm run release:validate`.
4. Se trovi violazioni con impatto su behavior o logica, apri backlog (non fix diretto in hot pass).

## Enforcement automatico

- Comando enforcement: `bash scripts/audit/governance-enforce.sh`
- Soglie baseline anti-regressione: `docs/operations/governance-enforcement-thresholds.env`
- Hook locale: `.githooks/pre-push` (attivabile con `bash scripts/setup.sh`)
- CI: workflow `.github/workflows/doe-verify.yml` (push + pull_request)
- Coerenza release/changelog notifiche: `npm run release:validate`

## Regola di intervento

- Fix diretto ammesso: typo documentali, link rotti, commenti chiaramente fuorvianti.
- Non fixare in audit pass: logica prodotto, comportamento UI, algoritmi dominio.
