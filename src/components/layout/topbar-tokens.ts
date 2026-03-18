export const TOPBAR_INLINE_PANEL_ROOT_CLASS =
    "relative flex min-w-0 shrink-0 items-center overflow-visible"

export const TOPBAR_INLINE_PANEL_SURFACE_CLASS =
    "flex h-10 min-w-0 items-center overflow-hidden"

export const TOPBAR_CLUSTER_DIVIDER_CLASS =
    "mx-1 h-6 w-px shrink-0 bg-border/50"

export const TOPBAR_INLINE_DIVIDER_CLASS =
    "h-5 w-px shrink-0 bg-border/35"

export const TOPBAR_INLINE_LABEL_CLASS =
    "mr-2 shrink-0 text-[9px] font-bold uppercase tracking-[0.18em] leading-none text-muted-foreground/80"

export const TOPBAR_INLINE_KPI_VALUE_CLASS =
    "text-[15px] font-black tracking-tight leading-none tabular-nums"

export const TOPBAR_INLINE_INPUT_TEXT_CLASS =
    "text-[15px] font-medium leading-none"

export const TOPBAR_INLINE_SUPPORT_TEXT_CLASS =
    "text-[13px] font-medium leading-none"

export function resolveTopbarToneClass(tone: "positive" | "neutral" | "warning" | "negative"): string {
    if (tone === "positive") return "text-emerald-600 dark:text-emerald-300"
    if (tone === "warning") return "text-amber-600 dark:text-amber-300"
    if (tone === "negative") return "text-rose-600 dark:text-rose-300"
    return "text-foreground"
}
