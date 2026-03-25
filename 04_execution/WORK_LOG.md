# Work Log

scope: execution-work-log
owner: engineering
status: active
last-verified: 2026-03-25
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
- Refreshed docs again after the latest landing iteration to capture the longer Brain interlude and the zero-cloud/no-account closing CTA.
- Created `AppleFluidBackground` master primitive (unifying `AppleFluidMesh` SVG with complex black scaling gradients) and re-engineered both the landing Hero and Brain Hero to use this identical Apple Premium immersive animated background.
- Executed a rigorous linguistic and typographic audit across the entire landing page, fixing dozens of missing Italian accents and normalizing all responsive header scales (clamping `text-8xl` to `text-7xl`) for flawless visual hierarchy.

## 2026-03-25

- Removed alternate simplified reduced-motion hero variants from the landing immersive sections.
- Re-aligned the `Differenza` hero and `LandingBrainHero` so smartphone, desktop, and reduced-motion contexts share the same adaptive surface pattern.
- Updated governance and documentation to codify the single-surface landing rule across requirements, UX, motion, architecture, decisions, and handoff context.
- Replaced the old animated four-moment landing demo with a static `Come inizi` explainer in the same narrative position, and removed the obsolete component/test path.
