# Requirements

scope: product-requirements
owner: engineering
status: active
last-verified: 2026-03-15
canonical-of: product-requirements

## Core Product Requirements

1. The app must support local-first financial tracking without requiring a remote backend for the main user journey.
2. The app must provide reliable views for dashboard summary, transaction history, settings, insights, simulator, updates, and privacy mode.
3. The app must support CSV import with parse, normalization, dedupe, enrichment, and guided review before persistence.
4. The app must expose deterministic narration based on domain facts and governed semantic rules.
5. The simulator must remain advisory and scenario-based, without directly mutating the live transaction ledger.
6. The app must support backup and restore of recognized local data sections.
7. The app must expose changelog-driven in-app notifications and updates.

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

## Out of Scope by Default

- Mandatory account creation or server-side canonical storage
- Enabling open banking by default
- Divergent mobile and desktop UI codepaths for the same feature surface
