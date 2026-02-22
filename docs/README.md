# Numa Documentation Hub

Single entrypoint for all Markdown documentation.

## 1) Fast path (read this order)

1. `/.agent/rules/numa-core-rules.md` (always-on constraints)
2. `/docs/ARCHITECTURE.md` (system boundaries)
3. Scope-specific docs from section 3 below

## 2) Canonical sources

- Runtime governance rules: `/.agent/rules/*`
- Agent operational skills: `/.agent/skills/*`
- Human architecture/governance docs: `/docs/*`
- Product/release notes: `/CHANGELOG.md`

## 3) Scope map (what/where/when/why)

| Scope | Primary file | When | Why |
|---|---|---|---|
| Core hard rules | `/.agent/rules/numa-core-rules.md` | Every task | Non-negotiable guardrails |
| Architecture | `/docs/ARCHITECTURE.md` | Before structural changes | Prevent boundary leaks |
| UI regression | `/.agent/rules/ui-regression-checklist.md` | Any UI change | Deterministic UI quality gate |
| Motion governance | `/docs/governance/MOTION_PRINCIPLES.md` | Motion/animation changes | Semantic and performance-safe motion |
| UX governance | `/docs/governance/UX_STANDARDS.md` | AI/UX interaction changes | Trust patterns (real-processing states, feedback loops) |
| Semantic ADR | `/docs/governance/adr/ADR-005-Semantic-Shift-Rhythm.md` | Copy/narration changes | Budget -> Rhythm language contract |
| Audit process | `/docs/audit/README.md` | Pre-merge/release checks | Governance quick-check workflow |
| Financial Lab runtime contract | `/src/features/simulator/README.md` | Changes on `/simulator` or goals overlay | Preserve read-only advisory behavior and quota derivation invariants |
| Release + in-app updates feed | `/CHANGELOG.md` | Every release note change | Canonical source for `/updates` and TopBar notifications |
| Governance operations | Global skill `$numa-governance-update` | Updating rules/skills/docs policy | Keep docs and agent memory aligned |

## 4) Documentation hygiene policy

- Keep one canonical source per topic.
- Use bridge files only to redirect to canonical source.
- Update both `/docs` and `/.agent` only when behavior/policy changes.
- Avoid adding standalone markdown unless it has a clear owner and lifecycle.

## 5) Current special notes

- `/docs/ui-regression-checklist.md` is a bridge file. Canonical checklist is `/.agent/rules/ui-regression-checklist.md`.
- `/docs/audit/quick-check.md` is generated output from `bash scripts/audit/governance-quick-check.sh`.
