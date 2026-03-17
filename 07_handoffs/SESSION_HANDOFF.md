# Session Handoff

scope: session-handoff
owner: engineering
status: active
last-verified: 2026-03-15
canonical-of: session-handoff

## Current State

- Root scaffold migration completed on 2026-03-15
- Governance, specialist context, playbooks, and ADRs now live entirely inside the root scaffold
- Legacy `.agent/*` and `docs/*` governance surfaces were retired
- Public landing page now lives at `/` and the operational dashboard now lives at `/dashboard`
- Premium UI utilities (`PullToRefresh`, `ScrollToTop`) implemented and integrated into root layout.
- Landing page evolved with interactive previews (Mar 17).

## Read First to Restart Work

1. `/01_rules/NUMA_CORE_RULES.md`
2. `/00_project-core/CURRENT_STATE.md`
3. `/03_architecture/SYSTEM_OVERVIEW.md`
4. `/06_decisions/DECISION_LOG.md`
5. `/04_execution/GOVERNANCE_AUDIT_PROCESS.md`

## Next Expected Maintenance

- Keep scripts, tests, CI, and specialist files aligned with the root scaffold paths.
