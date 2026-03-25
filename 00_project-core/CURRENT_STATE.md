# Current State

scope: current-state
owner: engineering
status: active
last-verified: 2026-03-25
canonical-of: project-current-state

## Snapshot

- Product maturity: established codebase with working feature modules, tests, governance, and release tooling
- Current phase: active maintenance and iterative evolution, not greenfield bootstrap
- Context migration status: root scaffold adopted as canonical live context on 2026-03-15
- Premium UI Phase: `PullToRefresh` and `ScrollToTop` utilities integrated into global layout (Mar 17)
- Premium UI Phase: `AppleFluidBackground` master primitive implemented merging zero-weight mathematical mesh gradients with perfect volumetric CSS blending (Mar 22/23)
- Public landing governance aligned as a dedicated acquisition surface with anchored narrative, constrained public navigation, and a static `Come inizi` explainer that replaces the previous sticky demo pattern (Mar 23/25)
- Landing immersive heroes now preserve one adaptive surface across desktop, smartphone, and reduced-motion contexts; motion intensity changes, but the composition does not fork into mobile/static alternates (Mar 25)

## What Is Stable

- Public landing page now exposed at `/` with the operational dashboard moved to `/dashboard`
- Public landing now encodes the canonical public product story: import -> month reading -> forecast readiness -> fixed-cost sustainability
- The public landing now includes a dedicated Brain explainer between forecast storytelling and downstream decision guidance
- The public landing now closes with an explicit local-first CTA that reinforces zero-cloud and no mandatory account for the first scan
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
- Landing motion and acquisition semantics require periodic reduced-motion and public-copy audits to avoid drift from governance
- Immersive landing explainers must stay aligned with local-first messaging and must not imply enabled remote sync flows by default
- The current Brain explainer uses a long-form scroll interlude with spring-smoothed depth separation and final reveal copy, which must remain synchronized with motion governance and the single-surface reduced-motion rule

## Quality and Verification Baseline

- Core validation commands: `npm run test:run`, `npm run validate`, `npm run release:validate`
- Governance quick check writes generated output into `04_execution/reports/`
- Root scaffold paths must stay aligned with scripts, tests, and CI
- Landing tests now participate in this alignment by asserting public-link constraints and the static four-step `Come inizi` story

## Next Coordination Step

- Keep the new root scaffold updated after substantial cross-layer work, especially `CURRENT_STATE`, `DECISION_LOG`, and `SESSION_HANDOFF`
- Re-check landing docs, motion rules, and tests whenever `/` changes its narrative order, public links, or preview behaviors
