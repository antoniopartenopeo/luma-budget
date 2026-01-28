# Visual Polish: Liquid Glass (iOS 26 / VisionOS)

> **Goal:** Achieve the "Liquid Glass" aesthetic requested by the user. The previous iteration was too opaque. This version simulates a physically distinct, highly transparent, yet heavily blurred material with specular edges.

## User Review Required
> [!NOTE]
> This reduces the background opacity from ~60% to ~40%. This creates a "lighter" feel, letting the dark background mesh show through more clearly.

## Proposed Changes

### Global Styles
#### [MODIFY] [globals.css](file:///Users/acvisuals/.gemini/antigravity/playground/numa-budget/src/app/globals.css)
*   **`.glass-chrome`**:
    *   **Transparency**: Reduce background opacity significantly (`white/70` -> `white/40`).
    *   **Gradient**: Subtle vertical fade (`white/40` -> `white/25`).
    *   **Specular Highlights**: Add a clear top-edge inner highlight (`inset 0 1px 0 0 rgba(255,255,255,0.2)`) to simulate light catching the glass edge.
    *   **Volume**: Keep the soft inner glow for "thickness".
    *   **Blur**: Maintain `backdrop-blur-2xl`.

### CSS Implementation
```css
.glass-chrome {
    /* Base Material */
    @apply bg-gradient-to-b from-white/40 to-white/20 dark:from-slate-950/40 dark:to-slate-950/20;
    
    /* Optical Physics */
    @apply backdrop-blur-2xl backdrop-saturate-[180%];
    
    /* Specular Lighting (Top Edge + Volume) */
    box-shadow: 
        inset 0 1px 0 0 rgba(255, 255, 255, 0.2), /* Top Edge Light */
        inset 0 0 20px rgba(255, 255, 255, 0.05); /* Inner Volume */
}
```

## Verification
*   **Transparency Check**: Can you clearly see the background mesh blobs moving/existing behind the sidebar?
*   **Legibility Check**: Is text still readable? (Blur should handle this).
