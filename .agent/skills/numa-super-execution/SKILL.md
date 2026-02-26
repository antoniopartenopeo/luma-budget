---
name: numa-super-execution
description: Protocollo operativo end-to-end per task complessi su Numa Budget che toccano piu layer (UI, feature, domain, governance, semantica, test). Usare quando la richiesta richiede implementazione completa con verifica quality gate e quando l'utente chiede esplicitamente una "super skill" di progetto.
---

# Numa Super Execution Protocol

Eseguire task cross-layer con standard release-ready, evitando drift tra codice, test e governance.

## 1) Preflight obbligatorio

Leggere sempre:
1. `/.agent/rules/numa-core-rules.md`
2. `/docs/README.md`
3. `/docs/core/system-architecture.md`

Classificare il task in una o piu categorie:
- `UI`: layout, componenti, interaction, motion
- `Financial`: importi, KPI, calcoli, periodi
- `Semantics`: copy, narration, tone, advisor
- `Governance`: policy, docs, checklist, audit
- `Feature`: comportamento applicativo cross-modulo

## 2) Routing skill specialistica

Attivare in sequenza minima solo le skill necessarie:
- `UI` -> `/.agent/skills/numa-ui-standards/SKILL.md`
- `Financial` -> `/.agent/skills/numa-financial-logic/SKILL.md`
- `Semantics budget` -> `/.agent/skills/numa-budget-semantics/SKILL.md`
- `Semantics insights` -> `/.agent/skills/numa-insights-semantics/SKILL.md`
- `Import CSV` -> `/.agent/skills/numa-import-csv/SKILL.md`
- `Governance update` -> skill globale `$numa-governance-update`

Se nessuna categoria specialistica e coinvolta, applicare solo questo protocollo + core rules.

## 3) Workflow esecutivo (obbligatorio)

1. Definire outcome tecnico verificabile (file target + comportamento atteso).
2. Leggere i file interessati e identificare il minimo set di modifiche.
3. Implementare in piccoli step mantenendo coerenza con design system e dominio.
4. Aggiornare/aggiungere test nello stesso pass della modifica.
5. Eseguire verifica mirata locale sui test toccati.
6. Eseguire verifica allargata sul dominio impattato.
7. Se cambia governance/docs, eseguire `npm run validate` e quick-check audit.
8. Riportare output con delta file, comandi eseguiti, esito, rischi residui.

## 4) Quality gate hard

Non chiudere il task se uno dei seguenti e violato:
- introduzione di `parseFloat` su flussi monetari
- duplicazione mobile/desktop o branching `if (isMobile)`
- inline style statico non giustificato tecnicamente
- test mancanti per nuova logica business
- regressione su focus/accessibilita nei controlli interattivi
- drift tra documentazione governance e skill agentiche

## 5) Command baseline

Usare la baseline minima in base all'impatto:
- test mirati: `npm run test:run -- <path-o-suite>`
- componenti UI: `npm run test:run -- src/components`
- enforcement governance (quando rilevante): `npm run validate`
- audit snapshot (quando rilevante): `bash scripts/audit/governance-quick-check.sh`

Se un comando non e eseguibile, dichiarare blocco e motivo nel report finale.

## 6) Definition of done

Chiudere solo quando:
1. comportamento richiesto implementato e verificato
2. test aggiornati o nuovi test verdi
3. nessuna violazione delle core rules
4. governance allineata quando impattata
5. report finale con riferimenti file e risultati comandi
