# Decision Log

scope: decision-log
owner: engineering
status: active
last-verified: 2026-03-15
canonical-of: decision-log

| Date | Decision | Status | Why | Alternatives rejected |
| --- | --- | --- | --- | --- |
| 2026-02-11 | Shift user-facing semantics from "Budget" to "Rhythm" | accepted | Reduce punitive framing and align narration with the product promise | Keep classic budgeting language as the primary semantic layer |
| 2026-03-15 | Adopt the root scaffold as the only canonical project governance system | accepted | Keep context, rules, playbooks, specialist guidance, decisions, and handoff interconnected inside one structure | Keep bootstrap, governance, and process knowledge distributed across legacy surfaces |
| 2026-03-15 | Consolidate specialist governance into `05_specialists/*` | accepted | Keep domain-specific operating context close to the rest of the root scaffold and remove competing agent-only paths | Preserve `.agent/*` as a second canonical layer |
| 2026-03-15 | Keep open banking fail-closed by default | accepted | Preserve the local-first product baseline until remote integration is explicitly hardened | Enable remote banking flows by default |
