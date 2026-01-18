---
name: DOE Governance
description: Enforces the Directive-Orchestration-Execution protocol for safe, self-improving development.
---

# DOE Governance Protocol

This skill governs the development process to ensure safety, consistency, and continuous improvement.

## 1. Context & Directive (START)
Before beginning any significant task:
1. **Read**: `docs/doe/active-context.md` to understand the current focus.
2. **Review**: `docs/doe/directives/00-core-principles.md` for critical rules.
3. **Check**: `docs/doe/legacy-registry.md` if touching legacy code.

## 2. Execution Standards (DURING)
1. **Safety First**: Never break the build.
2. **Financial Logic**:
   - **Prohibited**: `parseFloat` on monetary values.
   - **Mandatory**: Use `src/lib/financial-math.ts` for percentages, growth, utilization, and aggregations.
3. **Styling**: Use strictly Tailwind CSS (no inline styles).
4. **Icons**: Use centralized `CategoryIcon` or `lucide-react` consistently.
5. **Validation**: Run `npm run doe:verify` before considering code "complete".

## 3. Documentation Sync (FINISH)
Documentation is part of the code. Never skip this step.
1. **Status Update**:
   - Update `docs/status.md` with any new features, stability changes, or version bumps.
   - Update the "Changelog" table in `docs/status.md`.
2. **Active Context**:
   - Update `docs/doe/active-context.md` to reflect task completion (mark as Done).
3. **Lessons Learned**:
   - If a significant error occurred and was fixed, add an entry to `docs/doe/lessons-learned.md` with Root Cause and Prevention.

## 4. Emergency Procedures
If `doe:verify` fails:
1. Fix the error (do not bypass).
2. If the error is a legitimate legacy pattern that cannot be refactored, add it to `legacy-registry.md` (requires strong justification).
