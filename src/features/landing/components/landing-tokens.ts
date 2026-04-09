import {
  GLASS_V2_PANEL_CLASS,
  LIQUID_CAPSULE_CLASS,
  LIQUID_REFRACTION_CLASS
} from "@/components/ui/glass-tokens"

export const LANDING_NAV_LINK_CLASS =
  "rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/72 transition-colors hover:bg-black/[0.04] hover:text-foreground/90 dark:hover:bg-white/[0.08]"

export const LANDING_FLOATING_NAV_CLASS =
  `${LIQUID_CAPSULE_CLASS} ${LIQUID_REFRACTION_CLASS} flex items-center gap-0.5 rounded-full px-1.5 py-1`

export const LANDING_SECTION_EYEBROW_CLASS =
  "text-[11px] font-bold uppercase tracking-[0.2em] text-primary dark:text-foreground/58"

export const LANDING_SECTION_TITLE_CLASS =
  "max-w-[17ch] text-3xl font-black leading-[0.95] tracking-tighter text-foreground sm:text-4xl lg:text-5xl"

export const LANDING_SECTION_DESCRIPTION_CLASS =
  "max-w-[54ch] text-[15px] font-normal leading-relaxed text-muted-foreground sm:text-[1rem]"

export const LANDING_EDITORIAL_CARD_TITLE_CLASS =
  "text-3xl font-black leading-[1.05] tracking-tighter text-foreground sm:text-4xl lg:text-5xl"

export const LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS =
  "text-4xl font-black leading-[0.92] tracking-tighter text-foreground sm:text-5xl lg:text-6xl"



export const LANDING_HERO_FRAME_CLASS =
  `${GLASS_V2_PANEL_CLASS} relative z-10 rounded-[2.6rem] px-6 py-8 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.38)] sm:px-10 sm:py-12 lg:px-14 lg:py-14`

export const LANDING_PRIMARY_CTA_CLASS =
  "h-10 rounded-full px-8 text-[0.95rem] font-semibold shadow-[0_20px_44px_-24px_rgba(14,165,168,0.42)] transition-[box-shadow,transform] hover:shadow-[0_28px_56px_-24px_rgba(14,165,168,0.58)] sm:h-11 sm:px-9 sm:text-[1rem]"
