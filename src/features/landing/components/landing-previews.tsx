"use client"

import { LANDING_STORY_POINTS } from "../data"
import { LANDING_EDITORIAL_CARD_TITLE_CLASS } from "./landing-tokens"
import { LandingEditorialCardFrame } from "./landing-editorial-card-frame"

const STORY_ACCENTS = [
  {
    border: "border-cyan-400/20 dark:border-white/10",
    panel: "from-cyan-500/[0.02] via-white to-cyan-50/50 dark:from-white/[0.06] dark:via-black/84 dark:to-zinc-900/62",
    icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100"
  },
  {
    border: "border-slate-400/18 dark:border-white/9",
    panel: "from-slate-500/[0.03] via-white to-slate-50/60 dark:from-white/[0.05] dark:via-black/84 dark:to-zinc-950/68",
    icon: "border-slate-400/25 bg-slate-500/8 text-slate-700 dark:border-white/9 dark:bg-white/[0.045] dark:text-zinc-200"
  },
  {
    border: "border-teal-400/20 dark:border-white/10",
    panel: "from-teal-500/[0.02] via-white to-teal-50/50 dark:from-white/[0.055] dark:via-black/84 dark:to-stone-950/64",
    icon: "border-teal-400/25 bg-teal-500/10 text-teal-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-200"
  }
] as const

export function LandingHeroConsole() {
  return (
    <div className="space-y-6 sm:space-y-7 [perspective:1200px]">
      <div className="space-y-4">
        {LANDING_STORY_POINTS.map((point, index) => {
          const accent = STORY_ACCENTS[index]

          return (
            <LandingEditorialCardFrame
              key={point.title}
              borderClassName={accent.border}
              panelClassName={accent.panel}
              leadingIconWrapperClassName={accent.icon}
              leadingText={String(index + 1).padStart(2, "0")}
              leadingTextClassName="text-current"
              decorativeIcon={point.icon}
              decorativeIconPositionClassName="-bottom-[8%] right-[3%]"
              className="p-8 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.16)] dark:shadow-[0_30px_90px_-40px_rgba(0,0,0,0.5)] sm:p-10"
            >
              <div className="relative space-y-3 pr-12 pt-18 sm:pr-20 sm:pt-24 lg:pr-28 lg:pt-28">
                <p className={`${LANDING_EDITORIAL_CARD_TITLE_CLASS} whitespace-nowrap [font-size:clamp(1.15rem,2.8vw,3rem)]`}>
                  {point.title}
                </p>
                <p className="max-w-[56ch] text-[16px] font-normal leading-relaxed text-muted-foreground sm:text-[17px]">
                  {point.description}
                </p>
              </div>
            </LandingEditorialCardFrame>
          )
        })}
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/62 px-6 py-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.14)] sm:px-8 sm:py-8 backdrop-blur-3xl dark:border-white/10 dark:bg-zinc-950/40 dark:shadow-[0_24px_70px_-42px_rgba(0,0,0,0.42)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_46%)]" />
        <p className="relative text-[16px] font-normal leading-relaxed text-muted-foreground sm:text-[17px]">
          Numa non è un tracker più elegante. È un modo più calmo per leggere il mese e decidere con più chiarezza.
        </p>
      </div>
    </div>
  )
}
