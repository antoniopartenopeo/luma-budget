# Numa Budget Architecture

scope: system-architecture
owner: engineering
status: active
last-verified: 2026-03-15
canonical-of: architecture

> Principles: feature-first modules, domain isolation, local-first persistence, explicitly gated remote integrations, deterministic narration.

## 1) System Topology

```text
src/
├── app/                         # Next.js routes and route-level layout only
├── components/                  # Shared UI primitives, patterns, and layout building blocks
├── brain/                       # Local neural core training, storage, and inference
├── domain/                      # Framework-agnostic business logic
│   ├── money/                   # Currency parsing, formatting, and arithmetic in cents
│   ├── transactions/            # Signed semantics and normalization contracts
│   ├── categories/              # Category model and enrichment logic
│   ├── narration/               # Deterministic copy derivation and orchestrators
│   └── simulation/              # Savings and scenario math support
├── features/                    # User-facing business modules
├── VAULT/                       # Isolated high-value financial scenario logic
└── lib/                         # Shared runtime utilities and registries
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

- `/api/notifications/changelog`
- `/api/open-banking/institutions`
- `/api/open-banking/session`
- `/api/open-banking/sync`

Open banking routes are present in codebase but remain fail-closed unless `NUMA_ENABLE_OPEN_BANKING=true`.

## 3) Domain Boundaries

### Domain (`src/domain/*`)

- Pure logic only
- No React or UI dependencies
- Monetary source of truth: `amountCents`

### VAULT (`src/VAULT/*`)

- Sensitive and strategic scenario logic isolated from UI composition
- Goals logic manages baseline, projection, scenario, and realtime overlay orchestration
- Legacy compatibility survives only where backup, reset, or one-shot migrations still require it

### Brain (`src/brain/*`)

- Local on-device training and inference
- Forecast output stays advisory and readiness-gated

### Narration (`src/domain/narration/*`)

- Facts -> derived state -> narration output
- Financial math stays outside narrator functions

## 4) Data and State Flow

1. Repositories read and write local storage.
2. Feature hooks expose state through React Query.
3. URL-backed filters preserve deep-linkable temporal context where relevant.
4. Storage events and registry keys drive cross-tab synchronization.
5. Backup restore accepts only recognized sections before local overwrite.
6. UI components render computed values and narration outputs without embedding business formulas.

## 5) Storage Contracts

Active app-level registry keys:

- `luma_transactions_v1`
- `luma_categories_v1`
- `luma_settings_v1`
- `numa_goal_portfolio_v1`
- `numa_active_goal_v1`
- `numa_finlab_hard_switch_v1_done`
- `numa_notifications_state_v2`
- `numa-privacy-storage`
- `numa_brain_adaptive_policy_v1`

Legacy compatibility key:

- `luma_budget_plans_v1`

Brain storage key:

- `numa_neural_core_v1`

## 6) Non-Negotiable Architecture Constraints

- Cents-only monetary logic
- No device-branching UI surfaces like `*Mobile.tsx` or `*Desktop.tsx`
- Shared date range utilities for temporal filters
- Narration copy originates from the narration layer, not ad hoc component strings
