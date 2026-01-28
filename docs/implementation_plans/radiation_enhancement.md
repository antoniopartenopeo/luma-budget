# Visual Polish: Radiation Enhancement

> **Goal:** Maximize the "Light Expansion" effect behind the Sidebar, creating a vibrant, radioactive glow that interacts with the glass overlay.

## Proposed Changes

### [MODIFY] [app-shell.tsx](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/components/layout/app-shell.tsx)
*   **Sidebar Activation Glow**:
    *   Increase `opacity-60` -> `opacity-80` (Standard) or `opacity-90`.
    *   Increase `blur-[100px]` -> `blur-[140px]` (Softer spread).
    *   Increase `w-[400px]` -> `w-[600px]` (Wider reach into the content area).
    *   Result: A massive, soft wall of cyan light backing the sidebar.

### [MODIFY] [globals.css](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/app (globals.css) - NO CHANGES needed if glass-chrome is ready.
*   **Glass Material (`.glass-chrome`)**:
    *   Review `backdrop-blur-2xl` (40px).
    *   Maybe try `backdrop-blur-[60px]` for ultra-creamy dispersion?
    *   *Decision*: Stick to Tailwind's `3xl` or `40px` unless user complains about "grain". 2xl is usually fine.
    *   *Focus*: The *Light Source* (AppShell) is the key variable here.

## Verification
*   **Visual Check**: Does the sidebar look "electric"?
*   **Scroll Check**: Does content passing under it contribute to the turbulence?
