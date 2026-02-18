# Numa Budget Architecture

> **Status**: Active
> **Last update**: 2026-02-18
> **Principles**: Feature-first, domain isolation, local-first persistence, deterministic narration.

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
│   ├── goals/                   # Scenario/projection/rhythm orchestration
│   └── budget/                  # Budget persistence + deterministic budget computations
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
- `goals` controls scenarios, baseline, projection, active rhythm commit.
- `budget` stores and derives budget plans used by dashboard/runtime.

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
- Advisor forecast source transparency (`Brain` vs `Storico` fallback).
- Subscription detection and grouping powered by merchant-normalized monthly cadence.
- Trend timeline supports upcoming charge milestones for active subscriptions.

## 4) Data and State Flow

1. Repositories read/write local storage.
2. Feature hooks expose data through React Query.
3. View state (filters/tab) stays in URL/search params where relevant.
4. Cross-tab sync invalidates queries through `STORAGE_KEYS_REGISTRY`.
5. UI renders computed values and narration outputs, without embedding business formulas in components.

## 5) Storage Contracts

App-level registry (canonical): `src/lib/storage-keys.ts`
- `luma_transactions_v1`
- `luma_budget_plans_v1`
- `luma_categories_v1`
- `luma_settings_v1`
- `numa_goal_portfolio_v1`
- `numa_active_goal_v1` (legacy)
- `numa_finlab_hard_switch_v1_done`
- `numa_notifications_state_v2`
- `numa-privacy-storage`

Brain storage (managed in `src/brain/storage.ts`):
- `numa_neural_core_v1`

## 6) Non-Negotiable Architecture Constraints

- Cents-only monetary logic (`amountCents`, signed semantics via domain utils).
- No device-branching UI (`*Mobile.tsx`, `*Desktop.tsx` forbidden).
- Period filters must use shared range utilities (`src/lib/date-ranges.ts`).
- Narration copy must come from domain narration layer, not ad-hoc component strings.
