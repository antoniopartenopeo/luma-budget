# Current State

scope: current-state
owner: engineering
status: active
last-verified: 2026-03-15
canonical-of: project-current-state

## Snapshot

- Product maturity: established codebase with working feature modules, tests, governance, and release tooling
- Current phase: active maintenance and iterative evolution, not greenfield bootstrap
- Context migration status: root scaffold adopted as canonical live context on 2026-03-15
- Premium UI Phase: `PullToRefresh` and `ScrollToTop` utilities integrated into global layout (Mar 17)

## What Is Stable

- Public landing page now exposed at `/` with the operational dashboard moved to `/dashboard`
- Feature-first application structure under `src/features/*`
- Pure domain boundaries under `src/domain/*`
- Sensitive financial scenario logic isolated in `src/VAULT/*`
- Local-first persistence, backup/restore, and changelog-driven notifications
- Governance guardrails consolidated in `01_rules/*` and `05_specialists/*`

## Current Risks

- Legacy compatibility paths in VAULT can drift from the newer Financial Lab model
- Semantic drift can appear between governance rules and inline feature copy
- Backup payloads are cleartext JSON and remain privacy-sensitive
- Open banking code can drift from the documented local-first default if the runtime gate changes without further hardening

## Quality and Verification Baseline

- Core validation commands: `npm run test:run`, `npm run validate`, `npm run release:validate`
- Governance quick check writes generated output into `04_execution/reports/`
- Root scaffold paths must stay aligned with scripts, tests, and CI

## Next Coordination Step

- Keep the new root scaffold updated after substantial cross-layer work, especially `CURRENT_STATE`, `DECISION_LOG`, and `SESSION_HANDOFF`
