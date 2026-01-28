# Visual Polish: Native App Layout (Internal Scrolling)

> **Goal:** Resolve the visual disconnection between Topbar and Sidebar by keeping both static and unified over the background, while moving content scrolling *inside* the definition card.

## User Context
The user observed that when scrolling, the Topbar behaves differently from the Sidebar (showing content blur vs showing void), breaking the "Single Body" illusion. They also want to preserve the "Glass Effect" (which will now focus on the ambient background refraction).

## Proposed Changes

### Layout Architecture
#### [MODIFY] [app-shell.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/components/layout/app-shell.tsx)
*   **Root**: Lock height to screen (`h-screen w-full overflow-hidden`).
*   **Content Wrapper** (`lg:ml-64`): Convert to `flex flex-col h-full`.
*   **TopBar**: Remove `sticky`, make it a standard flex child.
*   **Main**: Make it the scroll container:
    *   `flex-1` (Take remaining height).
    *   `overflow-y-auto` (Internal scroll).
    *   `relative` (For positioning context).
    *   `rounded-tl-[2.5rem]` (The stable corner).
    *   `bg-background` (Deep Black Surface).

### CSS implications
*   Content will no longer scroll *under* the Topbar.
*   The Topbar will persistently show the blurred Ambient Mesh (Deep Space), matching the Sidebar exactly.

## Verification
*   **Scroll Test**: Does the content move?
*   **Frame Test**: Do Topbar and Sidebar remain absolutely still?
*   **Corner Test**: Does the rounded corner stay fixed at (0, 80px) regardless of scroll?
