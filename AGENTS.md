# Numa Budget Agents

scope: agent-entrypoint
owner: engineering
status: active
last-verified: 2026-03-15
canonical-of: agent-entrypoint

This repository uses the root scaffold as the only canonical governance and coordination system.

- `00_project-core/` stores product truth, assumptions, and current state.
- `01_rules/` stores non-negotiable rules, UX governance, motion, and execution standards.
- `02_specs/` stores product requirements.
- `03_architecture/` stores architecture truth and module contracts.
- `04_execution/` stores backlog, work log, playbooks, audit process, thresholds, and generated governance reports.
- `05_specialists/` stores specialist operating contexts.
- `06_decisions/` stores ADRs and decision history.
- `07_handoffs/` stores restart context between sessions.
- `/.agents/*` remains vendored reference material only, never canonical project governance.

## Reading Order

1. `/README.md`
2. `/00_project-core/PROJECT_BRIEF.md`
3. `/00_project-core/CURRENT_STATE.md`
4. `/01_rules/NUMA_CORE_RULES.md`
5. `/03_architecture/SYSTEM_OVERVIEW.md`
6. `/04_execution/GOVERNANCE_AUDIT_PROCESS.md`

## Canonical Sources

- Project brief: `/00_project-core/PROJECT_BRIEF.md`
- Active assumptions: `/00_project-core/ASSUMPTIONS.md`
- Current state: `/00_project-core/CURRENT_STATE.md`
- Core rules and governance: `/01_rules/*`
- Product requirements: `/02_specs/REQUIREMENTS.md`
- Architecture and module contracts: `/03_architecture/*`
- Execution playbooks, backlog, logs, and reports: `/04_execution/*`
- Specialist operating contexts: `/05_specialists/*`
- Closed decisions: `/06_decisions/DECISION_LOG.md`
- Session restart point: `/07_handoffs/SESSION_HANDOFF.md`

## Specialist Routing

- UI, layout, motion: `/05_specialists/NUMA_UI_STANDARDS.md`
- Financial logic and KPI behavior: `/05_specialists/NUMA_FINANCIAL_LOGIC.md`
- Budget semantics: `/05_specialists/NUMA_BUDGET_SEMANTICS.md`
- Insights semantics: `/05_specialists/NUMA_INSIGHTS_SEMANTICS.md`
- Import CSV flows: `/05_specialists/NUMA_IMPORT_CSV.md`
- Cross-layer implementation: `/05_specialists/NUMA_SUPER_EXECUTION.md`
- Read-only systemic audit: `/05_specialists/NUMA_READONLY_SYSTEM_AUDIT.md`

## Migration Note

- The root scaffold became the canonical governance system on 2026-03-15.
- Legacy governance surfaces under `.agent/` and `docs/` were retired in favor of this single interconnected structure.
