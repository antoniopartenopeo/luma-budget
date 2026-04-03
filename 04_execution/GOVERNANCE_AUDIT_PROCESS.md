# Audit Operativo Numa Budget

scope: governance-audit-process
owner: governance
status: active
last-verified: 2026-04-03
canonical-of: audit-process

Stato: attivo (guardrail non negoziabili)

Questo pacchetto rende operativo l'audit tecnico senza cambiare la logica di prodotto.

## Constraint non negoziabili

- Money: cents-only (`amountCents` integer), niente `parseFloat` su importi.
- UI: overlay + classi Tailwind, no `style={{...}}` salvo eccezioni tecniche documentate.
- Period filters: usare `filterByRange` (`/src/lib/date-ranges.ts`) invece di logiche duplicate.
- Test integrity: i test non devono simulare la logica di produzione se esiste una util importabile.
- Frozen surfaces: se la governance dichiara una superficie congelata, l'audit deve segnalarla come eccezione intenzionale e non come fix immediato. Default attivo: `src/features/dashboard/components/charts/spending-composition-card.tsx`.

## Documenti

- [Codebase navigation in 30 minutes](./CODEBASE_NAVIGATION_30_MIN.md)
- [Change patterns playbook](./CHANGE_PATTERNS_PLAYBOOK.md)
- [User-visible change ritual](./USER_VISIBLE_CHANGE_RITUAL.md)
- [Read-only systemic audit baseline](../05_specialists/NUMA_READONLY_SYSTEM_AUDIT.md)
- Generated output runtime: `04_execution/reports/generated-governance-quick-check.md` (non versionato)

## Due famiglie di audit

### A. Audit tecnico/governance

Serve a intercettare drift strutturale, regole non negoziabili, anti-pattern, routing e coerenza tra fonti canoniche.

### B. Audit user-visible

Serve a chiudere qualsiasi change che modifica cio che l'utente vede, legge, percepisce o interpreta.

Per questa famiglia il riferimento canonico non e questo file, ma:

- `04_execution/USER_VISIBLE_CHANGE_RITUAL.md`

Regola:

- un change utente-visibile non si chiude senza rituale findings-first
- se un rilievo si ripete due volte, va promosso a governance

## Quick start audit

1. Esegui `bash scripts/audit/governance-quick-check.sh`.
2. Leggi il report generato in `04_execution/reports/generated-governance-quick-check.md`.
3. Se hai toccato `CHANGELOG.md` (feed notifiche in-app), esegui anche `npm run release:validate`.
4. Se trovi violazioni con impatto su behavior o logica, apri backlog (non fix diretto in hot pass).

## Quick start user-visible change

Se il change e utente-visibile:

1. Esegui il rituale in `04_execution/USER_VISIBLE_CHANGE_RITUAL.md`.
2. Chiudi con finding concreti, non con summary generici.
3. Verifica cross-surface se il change tocca pagine, support surfaces, CTA o metadata pubblici.
4. Se un finding e gia emerso due volte in review precedenti, promuovilo a governance invece di lasciarlo implicito.

## Enforcement automatico

- Comando enforcement: `bash scripts/audit/governance-enforce.sh`
- Soglie baseline anti-regressione: `04_execution/GOVERNANCE_ENFORCEMENT_THRESHOLDS.env`
- Hook locale: `.githooks/pre-push` (attivabile con `bash scripts/setup.sh`)
- CI: workflow `.github/workflows/doe-verify.yml` (push + pull_request)
- Artifact CI: `04_execution/reports/generated-governance-quick-check.md` + `04_execution/reports/generated-governance-quick-check-summary.env`
- Coerenza release/changelog notifiche: `npm run release:validate`

## Regola di intervento

- Fix diretto ammesso: typo documentali, link rotti, commenti chiaramente fuorvianti, drift di navigazione o governance tra fonti canoniche e artifact operativi.
- Non fixare in audit pass: logica prodotto, comportamento UI, algoritmi dominio.
- Se il task e un user-visible change e non un audit puro, la chiusura deve comunque passare dal rituale user-visible prima della consegna finale.
