# Project Context

Last updated: 2026-02-22
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
- Shared UI selector pattern via `SegmentedPillSelector` (Dashboard periods + Import CSV threshold presets)
- Financial Lab scenario surface consolidata in `ScenarioDeck` con breakdown espandibile

## Convenzioni di Naming e Stile
- Path alias `@/*` per import assoluti
- Monetary source of truth in cents (`amountCents`)
- UI composition con pattern condivisi (`MacroSection`, `SubSectionCard`, `NumaEngineCard`)

## Dipendenze Critiche e Rischi
- `framer-motion`: rischio di inconsistenza reduced-motion se non gestito nei componenti locali
- localStorage migration/reset: rischio side effect cross-feature se cleanup troppo aggressivo
- Mixed legacy goals types in VAULT: rischio semantic drift con nuovo Financial Lab quota-mode
- Terminologia source label (`Core` vs `Storico`) da mantenere allineata tra UI, changelog e regole semantiche
- Refactor estesi UI (simulator/import) con forte riduzione componenti legacy: rischio drift test se checklist non aggiornata

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
- Sicurezza: local-first, nessun backend critico; attenzione a mutazioni storage globali

## Assunzioni Attive
- "Intera sezione" interpretata come Financial Lab (`/simulator` + `features/goals` correlati)

## Note Operative
- Aggiorna questo file a ogni esecuzione prefissata (`think:`, `arch:`, `review:`, `debug:`).
- Mantieni allineamento con la codebase esistente prima di proporre modifiche.
