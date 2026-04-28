# Work Log

scope: execution-work-log
owner: engineering
status: active
last-verified: 2026-04-28
canonical-of: execution-work-log

## 2026-03-15

- Migrated the repository from a distributed bootstrap model to a fully root-scaffold governance system.
- Consolidated rules, architecture references, execution playbooks, specialist contexts, and ADRs into the `00-07` structure.
- Retired legacy governance surfaces under `.agent/*` and `docs/*`.

## 2026-03-16

- Implemented `PullToRefresh` component using `framer-motion` for mobile-style interaction.
- Integrated `PullToRefresh` into `AppShell` for global layout support.

## 2026-03-17

- Implemented `ScrollToTop` component for better navigation on long pages.
- Standardized Root Layout to include UI utility registries.
- Evolved landing page with interactive previews and product demo enhancements.
- Audited repository for governance alignment and identified drift in documentation and coding standards (amount cents).

## 2026-03-22

- Audited the public landing page at code and runtime level as the canonical acquisition surface for Numa.
- Realigned requirements, UX/motion rules, architecture overview, specialist UI guidance, and execution playbooks around the landing's product-truth narrative.
- Updated landing verification artifacts so tests now track public-link constraints and the public step-by-step acquisition story.
- Folded the new Brain explainer into the same governance layer, tightening its local-first copy, motion constraints, and verification coverage.
- Refreshed docs again after the latest landing iteration to capture the longer Brain interlude and no-account/local-data closing CTA.
- Created `AppleFluidBackground` master primitive (unifying `AppleFluidMesh` SVG with complex black scaling gradients) and re-engineered both the landing Hero and Brain Hero to use this identical Apple Premium immersive animated background.
- Executed a rigorous linguistic and typographic audit across the entire landing page, fixing dozens of missing Italian accents and normalizing all responsive header scales (clamping `text-8xl` to `text-7xl`) for flawless visual hierarchy.

## 2026-03-25

- Removed alternate simplified reduced-motion hero variants from the landing immersive sections.
- Re-aligned the `Differenza` hero and `LandingBrainHero` so smartphone, desktop, and reduced-motion contexts share the same adaptive surface pattern.
- Updated governance and documentation to codify the single-surface landing rule across requirements, UX, motion, architecture, decisions, and handoff context.
- Replaced the old animated four-moment landing demo with a static `Come inizi` explainer in the same narrative position, and removed the obsolete component/test path.

## 2026-04-01

- Executed a repository-wide governance and application audit across root scaffold docs, runtime routes, storage contracts, and generated audit artifacts.
- Corrected the read-only audit specialist so its mandatory reading list now follows the root-scaffold canonical sources instead of legacy expectations.
- Clarified the audit process to allow direct fixes for governance/navigation drift inside audit passes without normalizing runtime code regressions.
- Re-verified and documented open runtime risks around forecast provenance labels, `transition-all` usage, and period-filter consistency candidates.

## 2026-04-02

- Implemented trust wave 1 on the public surface: calmer landing copy and metadata, explicit demo CTA toward `/transactions/import`, inline trust strip, and landing FAQ.
- Added public support routes `/faq` and `/privacy`, made `/updates` and `/transactions/import` publicly reachable from the landing, and aligned sitemap/robots with the intended public perimeter.
- Re-aligned canonical governance and entrypoint docs so public navigation, support surfaces, and safe-trial behavior stay explicit and testable.
- Corrected the public/app shell split so only `/faq` and `/privacy` stay outside `AppShell`, while `/updates` and `/transactions/import` remain publicly reachable without breaking internal navigation continuity.
- Consolidated public FAQ copy into a shared source of truth reused by the landing and `/faq`, and brought release traceability back in sync with the Wave 1 public changes.

## 2026-04-28

- Realigned the full root-scaffold documentation surface after the latest landing pass.
- Documented the clearer public narrative: import movements, review what was read, understand the month estimate, test a possible expense, and recognize recurring/fixed pressure.
- Promoted `src/features/landing/preview-model.ts` as the governed source for curated hero/cover-flow demo math, using cents and domain money formatting instead of component-local calculations.
- Updated UX, motion, UI specialist, architecture, requirements, decision log, handoff, and changelog references so Brain is described as a transparent estimate rather than an unconditional prediction promise.
- Captured the simplified FAQ/privacy posture around demo, import, data on device, no mandatory account/bank connection, and cleartext JSON backup risk.
- Hardened `scripts/audit/governance-quick-check.sh` so generated-report validation no longer stalls while counting large multi-line scan results.
