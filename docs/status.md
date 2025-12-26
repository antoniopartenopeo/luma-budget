# Project Status & Architecture — LumaBudget

## Overview
LumaBudget is a personal finance web app built with Next.js (App Router).  
Core data is persisted locally via `localStorage` and accessed through a repository pattern.  
React Query is used for caching, invalidation, and UI reactivity.

## Project Status (high level)
- Core (Dashboard / Transactions / Budget): **~100% functional**
- Insights: **Soon**
- Settings: **Soon (UI)** — data tooling already exists (seed/reset/repositories)

## App Sections
- **Dashboard**: High-level overview (income, expenses, monthly balance, budget remaining) + category distribution charts.
- **Transactions**: CRUD, filtering (search/type/category/period), CSV export.
- **Budget**: Monthly planning (YYYY-MM) + spending by groups (Essential / Comfort / Superfluous).
- **Insights** (Soon): analytics & trends.
- **Settings** (Soon): preferences + data management (reset / load demo / backup-restore).

## Data Flow & Persistence
### Source of truth
- **Repositories** read/write `localStorage` and expose async CRUD functions.
- **React Query hooks** call repositories and provide cached, reactive UI state.
- **Cross-tab sync**: a global `storage` event listener resets in-memory caches (transactions) and invalidates React Query keys.

### Persistence Keys (v1)
- `luma_transactions_v1`:
  - **Expected schema**: `Record<string, Transaction[]>` (keyed by `userId`)  
  - Note: if the app is currently single-user, explicitly document it and keep the schema consistent.
- `luma_budget_plans_v1`:
  - Budget plan storage keyed by `userId` + `period` (YYYY-MM), persisted as JSON.

### Money handling
- Amount parsing is centralized and robust (EU/US formats supported) and internally computed using **integer cents** to avoid float issues.
- No ad-hoc `parseFloat/parseInt` logic should exist outside the shared currency utility.

## Main Query Keys
- `["transactions"]`
- `["recent-transactions"]`
- `["budgets"]`
- `["budgets", period]`
- `["dashboard-summary"]`

## Notes
- **Seed Data**: seeded manually via the Transactions repository (no auto-seed on boot).
- **Expense classification**:
  - Default classification derives from category nature.
  - Manual override is stored per transaction (`isSuperfluous`, `classificationSource`) and must take precedence in budget/spending calculations.
- **Navigation**:
  - Insights/Settings are present but disabled ("Soon") to avoid 404 and keep roadmap visible.
