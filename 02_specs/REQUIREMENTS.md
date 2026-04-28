# Requirements

scope: product-requirements
owner: engineering
status: active
last-verified: 2026-04-28
canonical-of: product-requirements

## Core Product Requirements

1. The app must support local-first financial tracking without requiring a remote backend for the main user journey.
2. The web app must expose a public landing at `/` that explains the product through the canonical sequence `import movements -> review what was read -> read the month estimate -> test a possible expense -> understand recurring/fixed pressure`, using a static four-step `Come inizi` explainer for the operational flow and treating any dedicated Brain/stima explainer as a transparency deep-dive rather than a separate product promise.
3. The public surface may expose intentionally public trust and safe-trial routes such as `/transactions/import`, `/faq`, `/privacy`, and `/updates`, provided they remain product-verifiable and publicly reachable without implying remote onboarding. Dedicated trust pages like `/faq` and `/privacy` stay outside the operational app shell, while app-native routes like `/transactions/import` and `/updates` preserve the operational shell when opened directly.
4. The app must provide reliable views for dashboard summary, transaction history, settings, insights, simulator, updates, and privacy mode.
5. The app must support CSV import with parse, normalization, dedupe, enrichment, and guided review before persistence.
6. The app must expose deterministic narration based on domain facts and governed semantic rules.
7. The simulator must remain advisory and scenario-based, without directly mutating the live transaction ledger.
8. The app must support backup and restore of recognized local data sections.
9. The app must expose changelog-driven in-app notifications and updates.

## Platform Requirements

- Web app is the primary runtime surface.
- Capacitor mobile wrappers and Electron desktop wrapper must remain supported without changing core financial rules.
- PWA installability must remain available on the web build.

## Quality Constraints

- Monetary source of truth stays `amountCents` integer.
- Period and range logic uses shared date utilities.
- Narration copy does not live ad hoc inside feature components.
- Open banking routes remain fail-closed unless `NUMA_ENABLE_OPEN_BANKING=true`.
- Cross-layer changes should preserve governance quick-check and release validation flows.
- Public landing claims must stay product-verifiable, and its public navigation must remain constrained to in-page anchors and intentionally public routes (`/dashboard`, `/transactions/import`, `/faq`, `/privacy`, `/updates`).
- The public landing must keep one adaptive visual model per immersive hero or explainer across display sizes and reduced-motion contexts; motion may attenuate, but the surface pattern must not fork into separate mobile or simplified alternatives.
- Public landing preview numbers must come from curated demo cents and shared money utilities, never from ad hoc floating-point math, live repositories, or implied user data.
- Above-the-fold public copy must lead with user-language benefit and trust: no account required to start, data on the device, and estimates that can be re-read or checked.

## Out of Scope by Default

- Mandatory account creation or server-side canonical storage
- Enabling open banking by default
- Divergent mobile and desktop UI codepaths for the same feature surface
- Positioning Brain/AI as an unconditional prediction engine on the public landing
