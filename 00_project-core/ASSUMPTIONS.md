# Assumptions

scope: project-assumptions
owner: engineering
status: active
last-verified: 2026-03-15
canonical-of: project-assumptions

## Facts from the Repository

- Stack: Next.js 16, React 19, TypeScript strict mode, Tailwind CSS 4, Vitest, React Query
- Runtime targets: web app, Capacitor mobile shells, Electron Mac desktop shell
- Persistence model: local-first storage with explicit backup and restore
- Canonical runtime and implementation guardrails live in `01_rules/*` and `05_specialists/*`
- Open banking routes exist in codebase but stay disabled by default unless `NUMA_ENABLE_OPEN_BANKING=true`

## Active Operational Assumptions

- The root scaffold is the only canonical context and governance system for AI and operator sessions.
- Specialist workflows belong in `05_specialists/*`, not in ad hoc repo subtrees.
- Generated governance output belongs under `04_execution/reports/`.

## Open Decisions

- Whether open banking should remain permanently gated or move to a hardened supported flow
- How much legacy compatibility inside `src/VAULT/*` should survive future simplification passes
- Whether the local neural core should stay an optional advanced module or become a more central runtime surface
