# Backlog

scope: execution-backlog
owner: engineering
status: active
last-verified: 2026-04-01
canonical-of: execution-backlog

1. Keep root scaffold files updated when architecture, governance, or release behavior changes.
2. Resolve forecast provenance label drift so all runtime surfaces use the governed `Fonte Core` / `Fonte Storico` terminology.
3. Review and reduce remaining `transition-all` usage outside approved exceptions, starting from shared control tokens and high-traffic UI surfaces.
4. Investigate governance quick-check candidates for period filtering consistency before touching runtime behavior:
   - `src/features/dashboard/components/kpi-cards.tsx`
   - `src/features/dashboard/utils/dashboard-filter.ts`
   - `src/features/transactions/components/transactions-filter-bar.tsx`
   - `src/features/transactions/hooks/use-transactions-view.ts`
5. Retire or simplify legacy compatibility paths in `src/VAULT/*` when they stop carrying real user value.
6. Decide whether open banking should stay permanently gated or receive a hardened activation path.
7. Keep `05_specialists/*` aligned with real recurring workflows and avoid governance drift into random folders.
