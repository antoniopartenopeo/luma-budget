# Visual Polish: Liquid Glass Flash Card

> **Goal:** Apply the `.glass-chrome` (Liquid Glass) material to the Flash Summary component to ensure 100% parity with Sidebar and Topbar.

## User Review Required
> [!NOTE]
> This overrides the previous "Glass Panel" styling of the Flash Card. It will now use the ultra-transparent, specular-edged, vibrant material defined in global utilities.

## Proposed Changes

### Components
#### [MODIFY] [flash-summary-view.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/features/flash/components/flash-summary-view.tsx)
*   **Root Container**:
    *   **Remove**: Any ad-hoc `bg-white/x`, `backdrop-blur`, `border` classes.
    *   **Add**: `.glass-chrome`.
    *   **Ensure**: `rounded-3xl` or similar is preserved if the design requires it (Flash Card is usually rounded). Note that `.glass-chrome` does NOT set border-radius, so I must keep the radius.

## Verification
*   **Visual Check**: Open the Flash Summary (Sparkles icon). Does it look like the Sidebar?
*   **Seam Check**: Edges should be crisp (1px specular) and transparent.
