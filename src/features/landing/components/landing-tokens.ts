import {
  GLASS_V2_PANEL_CLASS,
  LIQUID_CAPSULE_CLASS,
  LIQUID_REFRACTION_CLASS
} from "@/components/ui/glass-tokens"

export const LANDING_NAV_LINK_CLASS =
  "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/60 transition-[color,background-color,box-shadow] hover:bg-white/42 hover:text-foreground hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] dark:text-white/70 dark:hover:bg-white/[0.10] dark:hover:text-white"

export const LANDING_FLOATING_NAV_CLASS =
  `${LIQUID_CAPSULE_CLASS} ${LIQUID_REFRACTION_CLASS} flex items-center gap-0.5 rounded-full px-1.5 py-1`

export const LANDING_SECTION_EYEBROW_CLASS =
  "text-[11px] font-bold uppercase tracking-[0.2em] text-primary dark:text-foreground/58"

export const LANDING_SECTION_TITLE_CLASS =
  "max-w-[17ch] [font-size:clamp(1.875rem,4.5vw,3rem)] font-black leading-[0.95] text-foreground"

export const LANDING_SECTION_DESCRIPTION_CLASS =
  "max-w-[54ch] text-[15px] font-normal leading-relaxed text-muted-foreground sm:text-[1rem]"

export const LANDING_EDITORIAL_CARD_TITLE_CLASS =
  "[font-size:clamp(1.875rem,5.5vw,3rem)] font-black leading-[1.05] text-foreground"

export const LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS =
  "[font-size:clamp(2.25rem,7vw,3.75rem)] font-black leading-[0.92] text-foreground"



export const LANDING_HERO_FRAME_CLASS =
  `${GLASS_V2_PANEL_CLASS} relative z-10 rounded-[2.6rem] px-6 py-8 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.38)] sm:px-10 sm:py-12 lg:px-14 lg:py-14`

export const LANDING_PRIMARY_CTA_CLASS =
  "h-10 rounded-full px-8 text-[0.95rem] font-semibold shadow-[0_20px_44px_-24px_rgba(14,165,168,0.42)] transition-[box-shadow,transform] hover:shadow-[0_28px_56px_-24px_rgba(14,165,168,0.58)] sm:h-11 sm:px-9 sm:text-[1rem]"

export const EDITORIAL_ACCENTS = [
  {
    ambient: "from-cyan-500/15 via-background to-background dark:from-white/[0.05] dark:via-background/88 dark:to-background",
    glow: "bg-cyan-500/30 dark:bg-white/12",
    liquid: "rgba(34,211,238,0.8)",
    card: "border-transparent bg-gradient-to-br from-cyan-500/[0.02] via-white to-cyan-50/50 dark:from-white/[0.07] dark:via-black/84 dark:to-zinc-900/[0.56] dark:backdrop-blur-3xl",
    kicker: "text-cyan-700 dark:text-white/62 dark:drop-shadow-none drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]",
    icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100"
  },
  {
    ambient: "from-teal-500/14 via-background to-background dark:from-white/[0.045] dark:via-background/88 dark:to-background",
    glow: "bg-teal-500/26 dark:bg-white/11",
    liquid: "rgba(45,212,191,0.8)",
    card: "border-transparent bg-gradient-to-br from-teal-500/[0.02] via-white to-teal-50/50 dark:from-white/[0.06] dark:via-black/84 dark:to-zinc-950/[0.58] dark:backdrop-blur-3xl",
    kicker: "text-teal-700 dark:text-white/58 dark:drop-shadow-none drop-shadow-[0_0_8px_rgba(45,212,191,0.22)]",
    icon: "border-teal-400/25 bg-teal-500/10 text-teal-700 dark:border-white/9 dark:bg-white/[0.045] dark:text-zinc-200"
  },
  {
    ambient: "from-slate-500/12 via-background to-background dark:from-white/[0.04] dark:via-background/88 dark:to-background",
    glow: "bg-slate-500/22 dark:bg-white/10",
    liquid: "rgba(255,255,255,0.6)",
    card: "border-transparent bg-gradient-to-br from-slate-500/[0.03] via-white to-slate-50/60 dark:from-white/[0.055] dark:via-black/84 dark:to-stone-950/[0.52] dark:backdrop-blur-3xl",
    kicker: "text-slate-700 dark:text-white/56 dark:drop-shadow-none drop-shadow-[0_0_8px_rgba(148,163,184,0.18)]",
    icon: "border-slate-400/25 bg-slate-500/8 text-slate-700 dark:border-white/9 dark:bg-white/[0.04] dark:text-stone-200"
  }
] as const
