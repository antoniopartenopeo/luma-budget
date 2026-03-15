# Operating Rules

scope: operating-rules
owner: engineering
status: active
last-verified: 2026-03-15
canonical-of: operating-rules

This file defines ownership inside the root scaffold. No external governance surface overrides it.

## Ownership by Topic

- Runtime and implementation guardrails: `/01_rules/*`
- Specialist execution context: `/05_specialists/*`
- Live project context and session state: `/00_project-core/*`, `/04_execution/*`, `/07_handoffs/*`
- Product requirements and boundaries: `/02_specs/REQUIREMENTS.md`
- Architecture truth and module contracts: `/03_architecture/*`
- Decisions and ADRs: `/06_decisions/*`

## Working Rules

- Keep one canonical source per topic. Prefer linking over copying.
- Update `CURRENT_STATE`, `DECISION_LOG`, and `SESSION_HANDOFF` after substantial multi-file or cross-layer work.
- Keep governance, process, and specialist context inside the `00-07` scaffold only.
- Generated audit output belongs under `04_execution/reports/` and should not become policy truth.
- Treat backlog and work log as operational coordination artifacts, not as product marketing or policy documents.
