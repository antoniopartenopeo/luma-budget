# Current State

scope: current-state
owner: engineering
status: active
last-verified: 2026-05-09
canonical-of: project-current-state

## Snapshot

- Product maturity: established codebase with working feature modules, tests, governance, and release tooling
- Current phase: active maintenance and iterative evolution, not greenfield bootstrap
- Context migration status: root scaffold adopted as canonical live context on 2026-03-15
- Premium UI Phase: `PullToRefresh` and `ScrollToTop` utilities integrated into global layout (Mar 17)
- Premium UI Phase: `AppleFluidBackground` master primitive implemented merging zero-weight mathematical mesh gradients with perfect volumetric CSS blending (Mar 22/23)
- Public landing governance aligned as a dedicated acquisition surface with anchored narrative, constrained public navigation, and a static operational explainer that replaces the previous sticky demo pattern (Mar 23/25)
- Public trust wave 1 shipped on the acquisition surface (Apr 2): calmer metadata/copy, explicit demo CTA toward `/transactions/import`, inline trust strip, landing FAQ, dedicated public trust pages for FAQ/privacy, and public support surfaces for `/updates` plus import demo without false beta-notification affordances
- User-visible governance ritual adopted (Apr 3): any change that alters what the user sees, reads, or perceives now closes with a findings-first ritual covering narrative, typography, composition, truth, cross-surface coherence, and verification
- Landing clarity pass completed (Apr 28): first scan moved toward clearer user language, explicit no-account/device-data trust items, curated demo previews, and support copy centered on demo, import, local data, and backup.
- Landing narrative separation completed (May 9): `/` now uses distinct public jobs for hero promise, problem clarity, operational flow, Brain decision logic, outcomes, and final CTA instead of repeating the same "what remains" message across sections.
- Landing editorial pass completed (May 9): public copy now stays practical and plain, separates problem/method/decision/results, and avoids technical acquisition labels such as margin/quota/base or internal Brain jargon in first-scan surfaces.
- Landing modular-card visual alignment completed (May 7): modular cards now use sobered edge-lit glass, ambient section glow, reduced hover tilt, and controlled icon/number treatments instead of scattered microcard density.
- Landing immersive heroes now preserve one adaptive surface across desktop, smartphone, and reduced-motion contexts; motion intensity changes, but the composition does not fork into mobile/static alternates (Mar 25)
- Dashboard `Composizione spese` is now governed as a frozen interaction surface and is out of scope by default for future UI cleanup or motion standardization (Apr 1)
- Repository-wide governance/app audit completed (Apr 1): root-scaffold drift in audit guidance was corrected and the remaining runtime risks were made explicit for source-label semantics, transition contracts, and period-filter consistency

## What Is Stable

- Public landing page now exposed at `/` with the operational dashboard moved to `/dashboard`
- Public trust routes now exposed at `/faq`, `/privacy`, and `/updates`, with `/transactions/import` remaining the only app-native safe-trial route reachable from the landing
- Public landing now encodes a six-stage acquisition story: product promise -> why the current month is hard to read -> how Numa turns existing movements into an answer -> how Brain combines real data, recurring costs, and a tested scenario -> what users gain -> final app entry.
- The public landing now includes a dedicated Brain/curve explainer scoped to decision logic and transparency, not a second AI product promise.
- The public landing keeps the primary action on `/dashboard` and uses support/trust copy as reassurance rather than a separate onboarding funnel.
- Landing demo visuals and static story data stay isolated from live repositories and must not imply user-data access on the public page.
- Feature-first application structure under `src/features/*`
- Pure domain boundaries under `src/domain/*`
- Sensitive financial scenario logic isolated in `src/VAULT/*`
- Local-first persistence, backup/restore, and changelog-driven public updates
- Governance guardrails consolidated in `01_rules/*` and `05_specialists/*`
- The Dashboard spending composition surface is intentionally preserved and excluded from default UI refactor scope
- User-visible changes now have an explicit closure standard in `04_execution/USER_VISIBLE_CHANGE_RITUAL.md`

## Current Risks

- Legacy compatibility paths in VAULT can drift from the newer Financial Lab model
- Semantic drift can appear between governance rules and inline feature copy
- Backup payloads are cleartext JSON and remain privacy-sensitive
- Open banking code can drift from the documented local-first default if the runtime gate changes without further hardening
- Landing motion and acquisition semantics require periodic reduced-motion, public-copy, and section-differentiation audits to avoid drift from governance
- Public support and safe-trial routes must remain aligned with the landing's trust promises and must not drift into false support affordances or cloud-first implications
- Immersive landing explainers must stay aligned with local-first messaging and must not imply enabled remote sync flows by default
- The current Brain/curve explainer must remain synchronized with motion governance, user-language copy, and the single-surface reduced-motion rule.
- Landing copy can drift back into repetition if `landing.json`, `content.ts`, `landing-page.tsx`, and Brain/outcome tests are not reviewed together.
- Repeated user-visible findings can still drift back into ad hoc review unless they are promoted promptly from local fixes into canonical governance
- Forecast provenance labels still drift in some runtime surfaces where `brain` is rendered as `Fonte Brain` instead of the governed `Fonte Core`
- Shared UI tokens and a subset of runtime components still rely on `transition-all`, which conflicts with the execution policy and can mask motion regressions
- Governance quick check still flags candidate period-filter logic outside `filterByRange`; these paths need owner review before behavioral fixes

## Quality and Verification Baseline

- Core validation commands: `npm run test:run`, `npm run validate`, `npm run release:validate`
- Full verification sweep: `npm run doe:verify`
- Governance quick check writes generated output into `04_execution/reports/`
- Root scaffold paths must stay aligned with scripts, tests, and CI
- Landing tests now participate in this alignment by asserting public-link constraints, distinct narrative sections, the operational `Come funziona` flow, and Brain curve labels.
- Landing preview tests continue to guard any isolated demo-number surfaces that use curated cents and money-domain formatting.
- User-visible changes must now close with the ritual in `04_execution/USER_VISIBLE_CHANGE_RITUAL.md`, not only with passing tests/build

## Next Coordination Step

- Keep the new root scaffold updated after substantial cross-layer work, especially `CURRENT_STATE`, `DECISION_LOG`, and `SESSION_HANDOFF`
- Re-check landing docs, motion rules, support surfaces, Brain/landing tests, and public-link tests whenever `/` changes its narrative order, public links, preview behaviors, or first-viewport trust copy
- Promote repeated UI/copy findings to governance instead of leaving them as reviewer memory
