# Visual Polish: L-Shape Frame Strategy

> **Goal:** Move the "Soft Corner" to the junction between Topbar Bottom and Sidebar Right (L-Shape Frame), and restore Sticky Topbar behavior.

## User Review Required
> [!IMPORTANT]
> The **Top Bar** will now visually belong to the "Frame" (Dark Background), not the "Page" (Light Background). The white "Page" will start *below* the Top Bar with a rounded top-left corner.

## Proposed Changes

### Layout Architecture
#### [MODIFY] [app-shell.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/components/layout/app-shell.tsx)
*   **Wrapper (`div.lg:ml-64`)**:
    *   **Remove**: `bg-background`, `rounded-tl-[2.5rem]`, `shadow-2xl`, `border-l/t`.
    *   **Remove**: `overflow-hidden` (Fixes Sticky Topbar).
    *   **Keep**: `min-h-screen`, `bg-sidebar` (transparent to root).
*   **Page Container (`main`)**:
    *   **Add**: `bg-background` (The White Page).
    *   **Add**: `rounded-tl-[2.5rem]` (The Curve below Topbar).
    *   **Add**: `min-h-[calc(100vh-80px)]` (Full height minus header).
    *   **Add**: `shadow-2xl`.
    *   **Add**: `ml-4` or padding to emphasize separation? No, user wants connection. Just `rounded-tl`.

#### [MODIFY] [topbar.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/components/layout/topbar.tsx)
*   **Background**: Ensure it blends with the Sidebar/Frame (Glass over Dark).
*   **Border**: Keep removed.

## Visualization
```
[ Sidebar Dark ] [ Topbar Dark/Glass ... ]
[              ] [ (Curve)               ]
[              ] [ White Main Content... ]
```
This creates the desired "L-Shape" corner.

## Verification
*   **Sticky Check**: Scroll down. Topbar stays?
*   **Curve Check**: Is the curve *under* the header?
