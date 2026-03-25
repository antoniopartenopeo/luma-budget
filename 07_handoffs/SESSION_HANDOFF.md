# Session Handoff

scope: session-handoff
owner: engineering
status: active
last-verified: 2026-03-25
canonical-of: session-handoff

## Current State

- Root scaffold migration completed on 2026-03-15
- Governance, specialist context, playbooks, and ADRs now live entirely inside the root scaffold
- Legacy `.agent/*` and `docs/*` governance surfaces were retired
- Public landing page now lives at `/` and the operational dashboard now lives at `/dashboard`
- Premium UI Phase: `PullToRefresh`, `ScrollToTop`, and `AppleFluidBackground` master primitive implemented and integrated into the global layout to ensure perfect rendering across all heroes.
- Landing page evolved with interactive previews (Mar 17).
- Landing governance now treats `/` as a constrained acquisition surface with anchored navigation, a static four-step `Come inizi` explainer, and highly vetted product-truth copy.
- A dedicated Brain explainer now lives inside the landing forecast stage and is governed as an immersive cinematic deep dive (`LandingBrainHero`).
- The entire landing page has undergone a rigid linguistic and responsive typography audit to perfectly align with Apple-style standards, capping all hero titles to `text-7xl` and fixing all Italian accents.
- Landing immersive heroes now keep the same adaptive visual pattern on smartphone and under `prefers-reduced-motion`; only the motion amplitude changes.

## Read First to Restart Work

1. `/01_rules/NUMA_CORE_RULES.md`
2. `/00_project-core/CURRENT_STATE.md`
3. `/03_architecture/SYSTEM_OVERVIEW.md`
4. `/06_decisions/DECISION_LOG.md`
5. `/04_execution/GOVERNANCE_AUDIT_PROCESS.md`

## Next Expected Maintenance

- Keep scripts, tests, CI, and specialist files aligned with the root scaffold paths.
- Re-audit landing reduced-motion behavior and public-link constraints whenever `src/features/landing/*` changes materially.
