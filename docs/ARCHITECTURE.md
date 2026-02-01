# NUMA Budget Architecture

> **Status**: CLEAN SLATE (Jan 2026)
> **Principles**: Feature-First, Domain Isolation, Logic Vault.

## 1. High-Level Structure

The application follows a strict **Feature-Based Architecture**. Code is organized by business feature rather than technical layer (hooks/components).

```
src/
├── app/                 # Next.js App Router (Routing & Layouts Only)
├── components/          # Shared Generic UI Components (Shadcn/Primitive)
├── features/            # Feature Modules (Self-contained)
│   ├── dashboard/       # Dashboard Logic & UI
│   ├── transactions/    # Transaction Management
│   ├── insights/        # AI Analysis & Charts
│   ├── settings/        # User Preferences
│   └── simulator/       # "Ottimizzatore Avanzato" (Interactive projections)
├── domain/              # Pure Domain Logic (Framework Agnostic)
│   ├── money/           # Currency math (Cents only)
│   └── categories/      # Core Category logic
└── VAULT/               # Logic Safes (Isolated Logic)
    └── goals/           # Goals Logic (No UI, Strict Governance)
```

## 2. Key Concepts

### The Logic Vault (`src/VAULT`)
A specialized directory for high-value, high-complexity domain logic that is being protected from UI coupling.
*   **Current Resident**: `goals` (Post-Nuclear Reset).
*   **Rules**: NO imports from `src/components`, `src/app`, or React UI libraries. purely `ts` logic and hooks.

### Domain Isolation (`src/domain`)
Contains the "Truth" of the application data structures.
*   **Money**: All values are explicitly integer cents. `parseFloat` is banned.
*   **Transactions**: Normalized structures.

### Feature Modules (`src/features/*`)
Each feature contains its own:
*   `api/`: Data fetching & mutations.
*   `components/`: Feature-specific UI.
*   `config/`: Constants and definitions.
*   `hooks/`: React state logic.

## 3. Data Flow
1.  **Storage**: LocalStorage (via `zustand` or direct adapters).
2.  **State**: React Query for async data, URL search params for view state.
3.  **Governance**: Strict ESLint rules prevent cross-feature contamination (e.g., Dashboard importing internal Insight components).

## 4. Routing (Clean)
* `/` -> Dashboard
* `/transactions` -> Transaction List
* `/insights` -> AI Analysis
* `/simulator` -> Ottimizzatore Avanzato
* `/goals` -> Financial Lab (Active)
* `/settings` -> Settings
* *(Legacy `/budget` -> Redirect to `/goals`)*
