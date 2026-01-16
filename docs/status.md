# Project Status & Architecture — LumaBudget

## Overview
LumaBudget is a personal finance web app built with Next.js (App Router).  
Core data is persisted locally via `localStorage` and accessed through a repository pattern.  
React Query is used for caching, invalidation, and UI reactivity.

## Governance (DOE System)
**Status**: Active (v1.0.0-doe)
The project is governed by the **Directive, Orchestration, Execution (DOE)** system.
- **Verification**: `npm run doe:verify` is the mandatory gate for all commits.
- **Rules**: Documented in `docs/doe/directives/`.
- **Legacy**: Documented debt in `docs/doe/legacy-registry.md`.

## Project Status (high level)
- Core (Dashboard / Transactions / Budget): **Stable**
- Insights: **Live (v1.0.0-doe)** — Trend Analysis & AI Advisor.
- Settings: **Stable (v1.1.0)** — Tabs UI, Data Management, Backup/Restore.

## App Sections
- **Dashboard**: High-level overview (income, expenses, monthly balance, budget remaining) + category distribution charts.
- **Transactions**: CRUD, filtering (search/type/category/period), CSV export.
- **Budget**: Monthly planning (YYYY-MM) + spending by groups (Essential / Comfort / Superfluous).
- **Insights**: Trend visualization over 12 months, sensitivity analysis, AI-driven observations.
- **Settings**: Preferences, Data Management (JSON Backup/Restore), Theme.

## Data Flow & Persistence
### Source of truth
- **Repositories** read/write `localStorage` and expose async CRUD functions.
- **React Query hooks** call repositories and provide cached, reactive UI state.
- **Cross-tab sync**: A global `storage` event listener resets in-memory caches and invalidates React Query keys.

### Persistence Keys (v1)
Registry defined in `src/lib/storage-keys.ts`:
- `luma_transactions_v1`: Transaction records.
- `luma_budget_plans_v1`: Budget plans (period-keyed).
- `luma_categories_v1`: Custom categories configuration.
- `luma_settings_v1`: App preferences.

### Money handling
- Amount parsing is centralized and robust (EU/US formats supported) and internally computed using **integer cents**.
- **Governance**: `parseFloat` is banned in new code (enforced by DOE verify).
- **Legacy**: Existing float usage acts as whitelisted technical debt.

## Main Query Keys
- `["transactions"]`
- `["budgets"]`
- `["settings"]`
- `["dashboard-summary"]`

## Notes
- **Branching Policy**: Feature branches MUST start from `origin/main` (see Governance). Use `docs/doe/active-context.md` to track scope.
- **Seed Data**: seeded manually (no auto-seed).
