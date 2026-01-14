# Active Context

> "Focus on one thing at a time."

**Task ID**: [Jira/Issue ID]
**Status**: [Planning | Implementation | Verification]
**Last Update**: YYYY-MM-DD HH:MM

## Scope (What are we doing?)
- [ ] List specific files or modules being touched.

## Rationale (Why?)
- Explain the business value or technical necessity.

## Exit Criteria (Definition of Done)
- [ ] Tests passed?
- [ ] UI verified?
- [ ] Artifacts updated?

---

## Incident Report (2026-01-14)
**Event**: DOE System Merge included unmerged `feat/insights` changes.
**Cause**: Branch `feat/doe-system` was created from `HEAD` (which pointed to `feat/insights-sensitivity`) instead of `origin/main`.
**Resolution**: Changes accepted as release.
**Corrective Action**: Future branches MUST be created from `origin/main`. Added policy to `00-core-principles.md`.
