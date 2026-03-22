# Session Handoff

scope: session-handoff
owner: engineering
status: active
last-verified: 2026-03-22
canonical-of: session-handoff

## Current State

- Root scaffold migration completed on 2026-03-15
- Governance, specialist context, playbooks, and ADRs now live entirely inside the root scaffold
- Legacy `.agent/*` and `docs/*` governance surfaces were retired
- Public landing page now lives at `/` and the operational dashboard now lives at `/dashboard`
- Premium UI utilities (`PullToRefresh`, `ScrollToTop`, `AppleFluidMesh`) implemented and integrated into root layout and landing primitives.
- Landing page evolved with interactive previews (Mar 17).
- Landing governance now treats `/` as a constrained acquisition surface with anchored navigation, sticky step demo, and product-truth copy.
- A dedicated Brain explainer now lives inside the landing forecast stage and is governed as an immersive but reduced-motion-safe deep dive.
- The latest landing revision also emphasizes the closing zero-cloud/no-account CTA and a longer Brain interlude with reveal copy that returns focus to month control.

## Read First to Restart Work

1. `/01_rules/NUMA_CORE_RULES.md`
2. `/00_project-core/CURRENT_STATE.md`
3. `/03_architecture/SYSTEM_OVERVIEW.md`
4. `/06_decisions/DECISION_LOG.md`
5. `/04_execution/GOVERNANCE_AUDIT_PROCESS.md`

## Next Expected Maintenance

- Keep scripts, tests, CI, and specialist files aligned with the root scaffold paths.
- Re-audit landing reduced-motion behavior and public-link constraints whenever `src/features/landing/*` changes materially.
