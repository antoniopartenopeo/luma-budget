# Requirements

scope: product-requirements
owner: engineering
status: active
last-verified: 2026-03-25
canonical-of: product-requirements

## Core Product Requirements

1. The app must support local-first financial tracking without requiring a remote backend for the main user journey.
2. The web app must expose a public landing at `/` that explains the product through the canonical sequence `import -> monthly reading -> forecast readiness -> fixed-cost sustainability`, using a static four-step `Come inizi` explainer for that flow and treating any dedicated Brain explainer as a deep-dive inside the forecast stage rather than a separate product promise.
3. The app must provide reliable views for dashboard summary, transaction history, settings, insights, simulator, updates, and privacy mode.
4. The app must support CSV import with parse, normalization, dedupe, enrichment, and guided review before persistence.
5. The app must expose deterministic narration based on domain facts and governed semantic rules.
6. The simulator must remain advisory and scenario-based, without directly mutating the live transaction ledger.
7. The app must support backup and restore of recognized local data sections.
8. The app must expose changelog-driven in-app notifications and updates.

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
- Public landing claims must stay product-verifiable, and its public navigation must remain constrained to in-page anchors and intentionally public app-entry routes.
- The public landing must keep one adaptive visual model per immersive hero or explainer across display sizes and reduced-motion contexts; motion may attenuate, but the surface pattern must not fork into separate mobile or simplified alternatives.

## Out of Scope by Default

- Mandatory account creation or server-side canonical storage
- Enabling open banking by default
- Divergent mobile and desktop UI codepaths for the same feature surface
