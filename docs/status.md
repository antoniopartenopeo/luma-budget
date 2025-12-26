# Project Status & Architecture

## Overview
LumaBudget is a personal finance management application built with Next.js, focusing on clean UI and local data persistence.

## App Sections
- **Dashboard**: High-level overview of spending, income, and budget. Features category distribution charts and balance summaries.
- **Transactions**: Full list of transactions with filtering (search, type, category, period) and CRUD operations.
- **Budget**: Planning tool to set monthly limits for different category groups (Essential, Comfort, Superfluous).
- **Insights** (Soon): Detailed analytics and spending trends.
- **Settings** (Soon): User preferences and data management.

## Data Flow & Persistence
The application uses a repository pattern with React Query for state management and `localStorage` for persistence.

### Persistence Keys (v1)
- `luma_transactions_v1`: Array of `Transaction` objects.
- `luma_budget_plans_v1`: Budget configuration for various periods.

### Main Query Keys
- `transactions`: All transactions data.
- `budget`: Budget planning and spending calculations.
- `dashboard-summary`: Aggregated data for the dashboard.

## Notes
- **Seed Data**: Data is seeded manually via the `repository.ts`. There is no automatic seeding on boot to prevent overwriting user data.
- **Logic**: Expense classification (Superfluous vs Necessary) is rule-based by default (based on category) but can be manually overridden per transaction.
