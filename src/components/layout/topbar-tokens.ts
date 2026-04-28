// ── Layout primitives ──────────────────────────────────────────────

export const TOPBAR_INLINE_PANEL_ROOT_CLASS =
    "relative flex min-w-0 shrink-0 items-center overflow-visible"

export const TOPBAR_INLINE_PANEL_SURFACE_CLASS =
    "flex h-10 min-w-0 items-center overflow-hidden"

// ── Dividers ───────────────────────────────────────────────────────

export const TOPBAR_CLUSTER_DIVIDER_CLASS =
    "mx-1 h-6 w-px shrink-0 bg-border/50"

export const TOPBAR_INLINE_DIVIDER_CLASS =
    "h-5 w-px shrink-0 bg-border/35"

// ── Typography ─────────────────────────────────────────────────────

export const TOPBAR_INLINE_LABEL_CLASS =
    "mr-2 shrink-0 text-[9px] font-bold uppercase tracking-[0.18em] leading-none text-muted-foreground/80"

export const TOPBAR_INLINE_KPI_VALUE_CLASS =
    "text-[15px] font-black tracking-tight leading-none tabular-nums"

export const TOPBAR_INLINE_INPUT_TEXT_CLASS =
    "text-[15px] font-medium leading-none"

export const TOPBAR_INLINE_SUPPORT_TEXT_CLASS =
    "text-[13px] font-medium leading-none"

// ── Button primitives ──────────────────────────────────────────────

/** Circular 40×40 icon button used across all topbar actions (cluster, quick, mobile). */
export const TOPBAR_ICON_BUTTON_CLASS =
    "group relative h-10 w-10 shrink-0 rounded-full border border-primary/15 bg-transparent text-muted-foreground transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-primary/10 hover:text-primary hover:shadow-md hover:scale-[1.05] active:scale-[0.95] active:bg-primary/20 active:text-primary focus-visible:ring-2 focus-visible:ring-primary/25"

/** Base trigger class for inline panel triggers (Flash, Brain, Notifications, Theme). */
export const TOPBAR_PANEL_TRIGGER_CLASS =
    "relative z-10 h-10 w-10 shrink-0 text-primary transition-colors focus-visible:ring-0"

/** Additional class applied to panel triggers when the panel is expanded. */
export const TOPBAR_PANEL_TRIGGER_OPEN_CLASS =
    "border-transparent bg-transparent hover:bg-transparent hover:shadow-none"

// ── Glassmorphism ──────────────────────────────────────────────────

/** Shared gradient overlay for glass surfaces (capsule, cluster, standalone). */
export const TOPBAR_GLASS_OVERLAY_CLASS =
    "pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.08)_18%,transparent_48%)] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_18%,transparent_52%)]"

// ── Tone resolution ────────────────────────────────────────────────

export function resolveTopbarToneClass(tone: "positive" | "neutral" | "warning" | "negative"): string {
    if (tone === "positive") return "text-emerald-600 dark:text-emerald-300"
    if (tone === "warning") return "text-amber-600 dark:text-amber-300"
    if (tone === "negative") return "text-rose-600 dark:text-rose-300"
    return "text-foreground"
}
