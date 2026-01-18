# Active Context

> "Focus on one thing at a time."

**Task ID**: FLASH-REFACTOR-001
**Status**: ✅ Completed
**Last Update**: 2026-01-18 13:20

## Scope (What are we doing?)
- [x] Refactor Flash Summary to use centralized `financial-math.ts`.
- [x] Update DOE system with self-improvement mechanisms.
- [x] Create `lessons-learned.md` for error tracking.

## Rationale (Why?)
- Eliminare duplicazione di logica finanziaria.
- Creare un sistema che impara dagli errori e previene ricorrenze.

## Exit Criteria (Definition of Done)
- [x] Tests passed (`doe:verify`)
- [x] Flash uses centralized functions
- [x] DOE updated with new rules (§5, §6)
- [x] `lessons-learned.md` creato con storico errori

---

## Recent Completions

| Date | Task | Key Changes |
|------|------|-------------|
| 2026-01-18 | Flash Refactor | `financial-math.ts` integration |
| 2026-01-17 | Simulator v2.0 | Expandable groups, real data, glassmorphism UI |
| 2026-01-17 | Financial Math Lib | Centralized `calculateSharePct`, `calculateUtilizationPct` |

---

## Incident Log

### 2026-01-14 - Branch Contamination
**Event**: DOE System Merge included unmerged `feat/insights` changes.
**Cause**: Branch `feat/doe-system` was created from `HEAD` (which pointed to `feat/insights-sensitivity`) instead of `origin/main`.
**Resolution**: Changes accepted as release.
**Corrective Action**: Branch Creation Policy added to `00-core-principles.md`.

