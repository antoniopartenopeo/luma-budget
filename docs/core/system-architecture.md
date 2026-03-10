# Numa Budget Architecture

scope: system-architecture
owner: engineering
status: active
last-verified: 2026-03-10
canonical-of: architecture

> **Status**: Active
> **Last update**: 2026-03-10
> **Principles**: Feature-first, domain isolation, local-first persistence, explicitly gated remote integrations, deterministic narration.

## 1) System Topology

```text
src/
├── app/                         # Next.js routes/layout only
├── components/                  # Shared UI primitives + layout + reusable patterns
├── brain/                       # Local neural core (training, snapshot, nowcast)
├── domain/                      # Framework-agnostic logic
│   ├── money/                   # Currency parsing/format/math in cents
│   ├── transactions/            # Signed semantics + normalization
│   ├── categories/              # Category model + enrichment rules
│   ├── narration/               # Deterministic copy state/narrators/orchestrator
│   └── simulation/              # Savings/application maps for scenario simulation
├── features/                    # Business modules
│   ├── dashboard/
│   ├── transactions/
│   ├── import-csv/
│   ├── insights/
│   ├── simulator/
│   ├── goals/
│   ├── settings/
│   ├── notifications/
│   ├── categories/
│   ├── privacy/
│   └── flash/
├── VAULT/                       # Isolated high-value logic/persistence
│   └── goals/                   # Scenario/projection/rhythm orchestration
└── lib/                         # Cross-feature utilities (date ranges, storage keys, build info)
```

## 2) Runtime Surfaces

Primary pages:
- `/` Dashboard
- `/transactions`
- `/insights`
- `/simulator`
- `/settings`
- `/updates`
- `/brain`
- `/offline`

Primary API endpoints:
- `/api/notifications/changelog` (in-app updates feed generated from `CHANGELOG.md`)
- `/api/open-banking/institutions`, `/api/open-banking/session`, `/api/open-banking/sync` (present in codebase, fail-closed unless `NUMA_ENABLE_OPEN_BANKING=true`)

Navigation contract:
- Sidebar hosts core pages (`/`, `/transactions`, `/insights`, `/simulator`, `/settings`).
- Topbar hosts cross-cutting actions (quick expense, flash overlay, privacy toggle, notifications, neural-core trigger).

## 3) Domain Boundaries

### Domain (`src/domain/*`)
- Pure logic only.
- No React/UI dependencies.
- Monetary source of truth: `amountCents` integer.

### VAULT (`src/VAULT/*`)
- Sensitive/strategic logic isolated from UI.
- `goals` controls scenarios, baseline, projection and realtime overlay orchestration (no direct commitment path in simulator runtime).
- Legacy budget state survives only through compatibility paths (`luma_budget_plans_v1`) used by backup/reset and one-shot migration logic.

### Brain (`src/brain/*`)
- Local on-device training/inference.
- Two outputs:
  - next-month expense tendency
  - current-month remaining expense nowcast
- Advisor can use Brain output only when readiness thresholds are met.

### Narration (`src/domain/narration/*`)
- Facts -> derive state -> narrate text.
- No math in narrator functions.
- Orchestrator suppresses contradictory low-priority reassurance in current critical contexts.

### Insights runtime (`src/features/insights/*`)
- Advisor forecast source transparency (`Core` vs `Storico` fallback).
- Subscription detection and grouping powered by merchant-normalized monthly cadence.
- Trend timeline supports upcoming charge milestones for active subscriptions.

### Financial Lab runtime (`src/app/simulator/page.tsx` + `src/features/goals/*`)
- Simulator surface is scenario-deck centric: each scenario card is expandable and shows the 3-step quota derivation.
- Live correction (`realtime overlay`) is folded inside scenario details rather than a separate results panel.
- Runtime remains advisory/read-only on transactions; no direct portfolio commit from the simulator page.

### Import CSV runtime (`src/features/import-csv/*`)
- Upload/review/summary wizard with grouped merchant review.
- Review step uses threshold presets and KPI summaries instead of a continuous threshold slider, and keeps groups/categories/duplicates visible before save.
- Summary step is the last confirmation surface before writing imported movements into the historical ledger.
- Import page surfaces a dedicated `NumaEngineCard` for flow transparency.

### Notifications runtime (`src/features/notifications/*`)
- Changelog-driven source: release entries are parsed from `/CHANGELOG.md`.
- Server endpoint (`/api/notifications/changelog`) transforms markdown release sections into typed notification items.
- Client reads feed via React Query and persists read-state in `numa_notifications_state_v2`.
- Topbar bell and `/updates` page consume the same feed, so release notes and in-app notifications stay aligned.

### Dashboard and ledger runtime (`src/features/dashboard/*`, `src/features/transactions/*`)
- Dashboard period filters are URL-backed, so month/range state can be restored and deep-linked.
- The recent-movements preview builds a custom-range handoff to `/transactions` instead of losing the active temporal context.
- `TransactionRowCard` is the shared ledger surface for dashboard preview and transactions runtime, keeping semantics, privacy blur, and motion consistent.

## 4) Data and State Flow

1. Repositories read/write local storage.
2. Feature hooks expose data through React Query.
3. View state (filters/tab) stays in URL/search params where relevant, including dashboard month/range filters and transaction deep-links derived from them.
4. Cross-tab sync invalidates queries through `STORAGE_KEYS_REGISTRY`.
5. Backup restore accepts only recognized payload sections before overwriting local state.
6. UI renders computed values and narration outputs, without embedding business formulas in components.

## 5) Storage Contracts

Active app-level registry (canonical): `src/lib/storage-keys.ts`
- `luma_transactions_v1`
- `luma_categories_v1`
- `luma_settings_v1`
- `numa_goal_portfolio_v1`
- `numa_active_goal_v1` (legacy)
- `numa_finlab_hard_switch_v1_done`
- `numa_notifications_state_v2`
- `numa-privacy-storage`
- `numa_brain_adaptive_policy_v1`

Legacy compatibility key (not part of active cross-tab registry):
- `luma_budget_plans_v1`

Brain storage (managed in `src/brain/storage.ts`):
- `numa_neural_core_v1`

## 6) Non-Negotiable Architecture Constraints

- Cents-only monetary logic (`amountCents`, signed semantics via domain utils).
- No device-branching UI (`*Mobile.tsx`, `*Desktop.tsx` forbidden).
- Period filters must use shared range utilities (`src/lib/date-ranges.ts`).
- Narration copy must come from domain narration layer, not ad-hoc component strings.
