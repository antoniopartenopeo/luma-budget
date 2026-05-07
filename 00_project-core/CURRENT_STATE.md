# Current State

scope: current-state
owner: engineering
status: active
last-verified: 2026-05-07
canonical-of: project-current-state

## Snapshot

- Product maturity: established codebase with working feature modules, tests, governance, and release tooling
- Current phase: active maintenance and iterative evolution, not greenfield bootstrap
- Context migration status: root scaffold adopted as canonical live context on 2026-03-15
- Premium UI Phase: `PullToRefresh` and `ScrollToTop` utilities integrated into global layout (Mar 17)
- Premium UI Phase: `AppleFluidBackground` master primitive implemented merging zero-weight mathematical mesh gradients with perfect volumetric CSS blending (Mar 22/23)
- Public landing governance aligned as a dedicated acquisition surface with anchored narrative, constrained public navigation, and a static `Come inizi` explainer that replaces the previous sticky demo pattern (Mar 23/25)
- Public trust wave 1 shipped on the acquisition surface (Apr 2): calmer metadata/copy, explicit demo CTA toward `/transactions/import`, inline trust strip, landing FAQ, dedicated public trust pages for FAQ/privacy, and public support surfaces for `/updates` plus import demo without false beta-notification affordances
- User-visible governance ritual adopted (Apr 3): any change that alters what the user sees, reads, or perceives now closes with a findings-first ritual covering narrative, typography, composition, truth, cross-surface coherence, and verification
- Landing clarity pass completed (Apr 28): first scan now leads with "il tuo mese, piu chiaro", explicit no-account/device-data/re-readable-estimate trust items, a curated cents-backed cover-flow preview, and support copy centered on demo, import, local data, and backup.
- Landing narrative simplification completed (May 4): `/` now uses five macro sections by folding the standalone `Differenza` moment into `Come inizi`, reducing the problem block to one demo, fusing the prior interactive estimate graph into the Brain interlude, and moving the final CTA inside `Cosa cambia`.
- Landing editorial pass completed (May 5): public copy now avoids technical labels such as margin/quota/base in visible acquisition surfaces, `Come funziona` uses a reference-driven bento rhythm, and the Brain interlude uses one theme-aware light/dark curve visual.
- Landing modular-card visual alignment completed (May 7): bento/outcome cards now use sobered edge-lit glass, ambient section glow, reduced hover tilt, and a compact signal strip in `Come funziona` instead of the previous cluster of extra microcards.
- Landing immersive heroes now preserve one adaptive surface across desktop, smartphone, and reduced-motion contexts; motion intensity changes, but the composition does not fork into mobile/static alternates (Mar 25)
- Dashboard `Composizione spese` is now governed as a frozen interaction surface and is out of scope by default for future UI cleanup or motion standardization (Apr 1)
- Repository-wide governance/app audit completed (Apr 1): root-scaffold drift in audit guidance was corrected and the remaining runtime risks were made explicit for source-label semantics, transition contracts, and period-filter consistency

## What Is Stable

- Public landing page now exposed at `/` with the operational dashboard moved to `/dashboard`
- Public trust routes now exposed at `/faq`, `/privacy`, and `/updates`, with `/transactions/import` remaining the only app-native safe-trial route reachable from the landing
- Public landing now encodes the canonical public product story: import movements -> review what was read -> read the month estimate -> test a possible expense -> notice recurring/fixed pressure
- The public landing now includes a dedicated graph-backed Brain explainer between the month story and downstream decision guidance, using public-facing "can I afford it?" language rather than internal forecast vocabulary
- The public landing now closes inside `Cosa cambia` with an explicit no-account/device-data CTA posture while keeping the primary action on `/dashboard`
- Landing preview math lives in `src/features/landing/preview-model.ts`, uses cents/domain formatters, and stays isolated from live repositories.
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
- Landing motion and acquisition semantics require periodic reduced-motion and public-copy audits to avoid drift from governance
- Public support and safe-trial routes must remain aligned with the landing's trust promises and must not drift into false support affordances or cloud-first implications
- Immersive landing explainers must stay aligned with local-first messaging and must not imply enabled remote sync flows by default
- The current Brain/stima explainer uses a long-form scroll interlude with spring-smoothed depth separation and final reveal copy, which must remain synchronized with motion governance, user-language copy, and the single-surface reduced-motion rule
- Landing preview copy can drift from the curated cents model if `landing.json`, `content.ts`, `preview-model.ts`, and cover-flow tests are not reviewed together.
- Repeated user-visible findings can still drift back into ad hoc review unless they are promoted promptly from local fixes into canonical governance
- Forecast provenance labels still drift in some runtime surfaces where `brain` is rendered as `Fonte Brain` instead of the governed `Fonte Core`
- Shared UI tokens and a subset of runtime components still rely on `transition-all`, which conflicts with the execution policy and can mask motion regressions
- Governance quick check still flags candidate period-filter logic outside `filterByRange`; these paths need owner review before behavioral fixes

## Quality and Verification Baseline

- Core validation commands: `npm run test:run`, `npm run validate`, `npm run release:validate`
- Full verification sweep: `npm run doe:verify`
- Governance quick check writes generated output into `04_execution/reports/`
- Root scaffold paths must stay aligned with scripts, tests, and CI
- Landing tests now participate in this alignment by asserting public-link constraints, the bento `Come funziona` story, and the curated preview model
- Landing preview tests now assert the curated cents formula, signed display, bounded percentages, incomplete-data state, and warning state.
- User-visible changes must now close with the ritual in `04_execution/USER_VISIBLE_CHANGE_RITUAL.md`, not only with passing tests/build

## Next Coordination Step

- Keep the new root scaffold updated after substantial cross-layer work, especially `CURRENT_STATE`, `DECISION_LOG`, and `SESSION_HANDOFF`
- Re-check landing docs, motion rules, support surfaces, preview-model tests, and public-link tests whenever `/` changes its narrative order, public links, preview behaviors, or first-viewport trust copy
- Promote repeated UI/copy findings to governance instead of leaving them as reviewer memory
