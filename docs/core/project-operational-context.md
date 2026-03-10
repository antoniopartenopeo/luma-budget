# Project Context

scope: operational-reference
owner: engineering
status: reference
last-verified: 2026-03-10
canonical-of: none

Last updated: 2026-03-10
Repository root: /Users/acvisuals/.gemini/antigravity/scratch/numa-budget
Source workflow: numa-governance-update

## Linguaggi e Framework Rilevati
- TypeScript: strict mode (`tsconfig.json`) con Next.js App Router
- React 19 + Next 16.1.6 (UI client-side + server layout)
- Tailwind CSS 4 + utility design tokens in `src/app/globals.css`
- Vitest + Testing Library per unit/component tests

## Pattern Architetturali Identificati
- Feature-first modules in `src/features/*`
- Domain pure logic in `src/domain/*`
- Isolated sensitive logic in `src/VAULT/*`
- Local-first persistence via `src/lib/storage-utils.ts` + storage keys registry
- Changelog-driven notifications (`CHANGELOG.md` -> `/api/notifications/changelog` -> TopBar + `/updates`)
- Open banking routes in `src/app/api/open-banking/*`, currently gated off by default at runtime
- Shared UI selector pattern via `SegmentedPillSelector` (Dashboard periods + Import CSV threshold presets)
- Dashboard temporal filter sincronizzato su URL/search params con handoff coerente verso `/transactions`
- Ledger surface riusabile tramite `TransactionRowCard` tra preview Dashboard e tabella movimenti
- Financial Lab scenario surface consolidata in `ScenarioDeck` con breakdown espandibile
- Governance agenti sdoppiata: `/.agent/*` canonico di progetto, `.agents/skills/*` vendorizzato e pinned in `skills-lock.json`

## Convenzioni di Naming e Stile
- Path alias `@/*` per import assoluti
- Monetary source of truth in cents (`amountCents`)
- UI composition con pattern condivisi (`MacroSection`, `SubSectionCard`, `NumaEngineCard`)
- Transizioni UI esplicite su proprieta mirate; evitare `transition-all`

## Dipendenze Critiche e Rischi
- `framer-motion`: rischio di inconsistenza reduced-motion se non gestito nei componenti locali
- skill bundle vendorizzati in `.agents/skills`: rischio drift operativo se non restano esplicitamente subordinati a `/.agent/*`
- localStorage migration/reset: rischio side effect cross-feature se cleanup troppo aggressivo
- backup export in cleartext JSON: rischio privacy se il file viene condiviso o archiviato senza protezioni esterne
- Mixed legacy goals types in VAULT: rischio semantic drift con nuovo Financial Lab quota-mode
- route open banking presenti nel repo: rischio drift tra documentazione "local-first" e superficie runtime se il gate env viene rimosso senza hardening ulteriore
- Terminologia source label (`Core` vs `Storico`) da mantenere allineata tra UI, changelog e regole semantiche
- Refactor estesi UI (dashboard/transactions/import/settings) con forte riuso di pattern shared: rischio drift test se checklist e docs non vengono riallineate

## ADR Sintetici (Decisioni Architetturali)
- 2026-02-11 Semantic shift Rhythm (ADR-005) - Contesto: ridurre tono punitivo budget. Impatto: copy e narrative contract.

## Problemi Ricorrenti Osservati
- Drift tra semantica governance e copy inline nei componenti feature
- Coesistenza codice legacy + nuovo modello nella stessa area VAULT

## Test e Qualita
- Comandi standard: `npm test`, `npx tsc --noEmit`
- Gap noti: alcune aree legacy non più centrali sono ancora presenti e possono sfuggire ai test di sezione

## Vincoli di Performance e Sicurezza
- Performance: preferenza per animazioni semantiche e leggere; no branching device
- Sicurezza: local-first per i flussi attivi, backup JSON non cifrati, route open banking presenti ma fail-closed di default, attenzione a mutazioni storage globali

## Assunzioni Attive
- Il branch corrente e trattato come baseline da documentare sul piano governance.
- `/.agent/*` resta la fonte canonica di regole e skill progetto; `.agents/*` sono supporto vendorizzato.

## Note Operative
- Aggiorna questo file a ogni esecuzione prefissata (`think:`, `arch:`, `review:`, `debug:`).
- Aggiornalo anche nei pass di governance quando cambia la superficie documentale o operativa del repository.
- Mantieni allineamento con la codebase esistente prima di proporre modifiche.
