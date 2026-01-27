# Premium Alignment Sweep (Pixel Perfect)

> **Goal:** Extend the "Premium" motion/UI standards (V1.1) to the **entire application** (100% coverage), eliminating all legacy standard animations.

## User Review Required
> [!IMPORTANT]
> This plan touches **core UI primitives** like `Skeleton.tsx`. Changing this will affect the entire app globally. This is intended but requires regression testing on all loading states.

## Proposed Changes

### Core Primitives
#### [MODIFY] [skeleton.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/components/ui/skeleton.tsx)
*   Replace `animate-pulse` with `animate-pulse-soft`.
*   Effect: All skeletons in the app will instantly feel "organic" and softer.

### Feature: Budget
#### [MODIFY] [global-budget-card.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/features/budget/components/global-budget-card.tsx)
*   Replace `animate-in fade-in slide-in...` with `animate-enter-up`.
#### [MODIFY] [empty-budget-state.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/features/budget/components/empty-budget-state.tsx)
*   Replace `fade-in zoom-in-95` with `animate-enter-up`.

### Feature: Transactions
#### [MODIFY] [transactions-filter-bar.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/features/transactions/components/transactions-filter-bar.tsx)
*   Update active filter container to use `animate-enter-up` or a micro-scale transition.
#### [MODIFY] [quick-expense-input.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/features/transactions/components/quick-expense-input.tsx)
*   Update error messages and success states to use `animate-enter-up` (for entry) or `animate-puls-soft` (for attention).
#### [MODIFY] [page.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/app/transactions/page.tsx)
*   Update page entry to `animate-enter-up`.

### Feature: Import Wizard
#### [MODIFY] [step-summary.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/features/import-csv/components/step-summary.tsx)
*   Replace standard slide-ins with `animate-enter-up`.
#### [MODIFY] [wizard-shell.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/features/import-csv/components/wizard-shell.tsx)
*   Ensure wizard steps transition smoothly with premium curves.

### Feature: Settings
#### [MODIFY] [categories-section.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/features/settings/components/categories-section.tsx)
*   Update TabsContent entry animation.

## Verification Plan

### Automated Tests
*   `npm run build` (Standard).

### Manual Verification
*   **Global Loading:** Reload page to see `Skeleton` using `pulse-soft`.
*   **Budget Page:** Verify Budget Card entry is consistent with Dashboard.
*   **Transactions:** Verify page entry and filter bar interactions.
*   **Import:** Run a dummy CSV import to verify wizard transitions.
