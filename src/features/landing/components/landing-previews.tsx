"use client"

import { cn } from "@/lib/utils"
import { LANDING_STORY_POINTS } from "../data"
import { CinematicScrollCard } from "./motion-primitives"
import {
  LANDING_SECTION_DESCRIPTION_CLASS,
  LANDING_SECTION_EYEBROW_CLASS,
  LANDING_SECTION_TITLE_CLASS
} from "./landing-tokens"

const STORY_ACCENTS = [
  {
    border: "border-cyan-500/18 dark:border-cyan-400/14",
    panel: "from-cyan-500/[0.09] via-white/74 to-white/90 dark:from-cyan-500/[0.12] dark:via-black/28 dark:to-black/22",
    icon: "border-cyan-500/18 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    label: "text-cyan-700/88 dark:text-cyan-300/84"
  },
  {
    border: "border-violet-500/18 dark:border-violet-400/14",
    panel: "from-violet-500/[0.09] via-white/74 to-white/90 dark:from-violet-500/[0.12] dark:via-black/28 dark:to-black/22",
    icon: "border-violet-500/18 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    label: "text-violet-700/88 dark:text-violet-300/84"
  },
  {
    border: "border-amber-500/18 dark:border-amber-400/14",
    panel: "from-amber-500/[0.09] via-white/74 to-white/90 dark:from-amber-500/[0.12] dark:via-black/28 dark:to-black/22",
    icon: "border-amber-500/18 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    label: "text-amber-700/88 dark:text-amber-300/84"
  }
] as const

export function LandingHeroConsole() {
  return (
    <div className="space-y-6 sm:space-y-7 [perspective:1200px]">
      <CinematicScrollCard className="relative overflow-hidden rounded-[2.2rem] border border-primary/14 bg-gradient-to-br from-primary/[0.09] via-white/76 to-white/92 p-6 shadow-[0_30px_90px_-58px_rgba(15,23,42,0.42)] backdrop-blur-sm dark:border-primary/12 dark:from-primary/[0.12] dark:via-black/26 dark:to-black/20 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.74),transparent_44%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_48%)]" />
        <div className="relative space-y-5">
          <div className="space-y-3">
            <p className={LANDING_SECTION_EYEBROW_CLASS}>Il nodo</p>
            <h3 className={cn(LANDING_SECTION_TITLE_CLASS, "max-w-[17ch]")}>
              Tra estratto conto e decisione c&apos;e un vuoto.
            </h3>
            <p className={cn(LANDING_SECTION_DESCRIPTION_CLASS, "max-w-[48ch]")}>
              Molte app registrano quello che e gia successo. Numa usa il passato per rispondere a una domanda piu utile: questa spesa ci sta davvero nel mese di oggi?
            </p>
          </div>
        </div>
      </CinematicScrollCard>

      <div className="space-y-4">
        {LANDING_STORY_POINTS.map((point, index) => {
          const accent = STORY_ACCENTS[index]

          return (
            <CinematicScrollCard
              key={point.title}
              className={`group relative overflow-hidden rounded-[2rem] border ${accent.border} bg-gradient-to-br ${accent.panel} p-5 shadow-[0_28px_90px_-56px_rgba(15,23,42,0.38)] backdrop-blur-sm sm:p-6`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_46%)]" />
              <div className="relative flex items-start gap-4 sm:gap-5">
                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border shadow-[0_18px_36px_-24px_rgba(15,23,42,0.35)]", accent.icon)}>
                  <point.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-2">
                  <p className={cn("text-[11px] font-semibold uppercase tracking-[0.14em]", accent.label)}>
                    Punto chiave {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="max-w-[26ch] text-lg font-extrabold leading-tight tracking-tight text-foreground sm:text-[1.3rem]">
                    {point.title}
                  </p>
                  <p className="max-w-[56ch] text-[15px] font-normal leading-relaxed text-muted-foreground">
                    {point.description}
                  </p>
                </div>
              </div>
            </CinematicScrollCard>
          )
        })}
      </div>

      <div className="relative overflow-hidden rounded-[1.8rem] border border-primary/14 bg-primary/8 px-5 py-5 sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.5),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_46%)]" />
        <p className="relative text-[15px] font-medium leading-relaxed text-foreground">
          Numa non e un tracker piu elegante. E un modo piu calmo per leggere il mese e decidere con piu chiarezza.
        </p>
      </div>
    </div>
  )
}
