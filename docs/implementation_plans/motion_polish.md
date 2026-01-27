# Motion Polish: Premium Refinements

> **Goal:** Elevate the quality of motion from "Functional" to "Premium" by replacing standard utilities with custom, organic keyframes.

## User Review Required
> [!NOTE]
> This plan addresses the feedback "you can do better". We are moving from standard `ease-out` to custom `cubic-bezier(0.16, 1, 0.3, 1)` for that "Apple-like" friction feel.

## Proposed Changes

### Global Styles
#### [MODIFY] [globals.css](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/app/globals.css)
*   **Add Custom Keyframes:**
    *   `enter-up`: Smooth entry with slight Y-axis travel and opacity.
    *   `pulse-soft`: A gentle scale/opacity breathe (0.98 -> 1.02), less mechanical than standard pulse.
    *   `flash-green`: A quick heavy flash of emerald color that decays slowly.
*   **Add Animation Variables:**
    *   `--animate-enter-up`
    *   `--animate-pulse-soft`
    *   `--animate-flash-green`

### Components
#### [MODIFY] [kpi-cards.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/features/dashboard/components/kpi-cards.tsx)
*   Replace `animate-in fade-in` with `animate-enter-up`.

#### [MODIFY] [ai-advisor-card.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/features/insights/components/ai-advisor-card.tsx)
*   Replace `blur-xl animate-pulse` with `animate-pulse-soft`.
*   Replace icon `animate-spin` with a more subtle effect or keep spin if combined with soft pulse.

#### [MODIFY] [page.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/app/simulator/page.tsx)
*   Replace `animate-[pulse...]` with `animate-flash-green`.

## Verification Plan

### Automated Tests
*   `npm run build` to ensure CSS syntax is correct and valid.

### Manual Verification
*   **Dashboard:** Verify KPI grid slides in gently from bottom when filtering.
*   **Inputs:** Verify "Thinking" state breathes organically.
*   **Simulator:** Verify "Risparmio" card flashes green when numbers improve.
