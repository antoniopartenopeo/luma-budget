"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LANDING_STORY_POINTS } from "../data"
import {
  LANDING_SECTION_DESCRIPTION_CLASS,
  LANDING_SECTION_EYEBROW_CLASS,
  LANDING_SECTION_TITLE_CLASS
} from "./landing-tokens"
import { LANDING_MOTION_TIMINGS } from "./landing-motion"

const PROBLEM_PILLS = [
  "Movimenti ordinati",
  "Contesto assente",
  "Decisioni al buio"
] as const

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
    <div className="space-y-6 sm:space-y-7">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-primary/14 bg-gradient-to-br from-primary/[0.09] via-white/76 to-white/92 p-6 shadow-[0_30px_90px_-58px_rgba(15,23,42,0.42)] backdrop-blur-sm dark:border-primary/12 dark:from-primary/[0.12] dark:via-black/26 dark:to-black/20 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.74),transparent_44%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_48%)]" />
        <div className="relative space-y-5">
          <div className="space-y-3">
            <p className={LANDING_SECTION_EYEBROW_CLASS}>Perche succede</p>
            <h3 className={cn(LANDING_SECTION_TITLE_CLASS, "max-w-[13ch]")}>
              Sai quanto hai speso. Non se il mese sta davvero tenendo.
            </h3>
            <p className={cn(LANDING_SECTION_DESCRIPTION_CLASS, "max-w-[48ch]")}>
              Tra un elenco di movimenti e una decisione serena c&apos;e un vuoto enorme. Quasi nessuna app lo colma.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {PROBLEM_PILLS.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-primary/12 bg-background/62 px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em] text-foreground/72 backdrop-blur-sm"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {LANDING_STORY_POINTS.map((point, index) => {
          const accent = STORY_ACCENTS[index]

          return (
            <motion.article
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={LANDING_MOTION_TIMINGS.fast}
              className={`group relative overflow-hidden rounded-[2rem] border ${accent.border} bg-gradient-to-br ${accent.panel} p-5 shadow-[0_28px_90px_-56px_rgba(15,23,42,0.38)] backdrop-blur-sm sm:p-6`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_46%)]" />
              <div className="relative flex items-start gap-4 sm:gap-5">
                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border shadow-[0_18px_36px_-24px_rgba(15,23,42,0.35)]", accent.icon)}>
                  <point.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-2">
                  <p className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", accent.label)}>
                    Punto {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="max-w-[26ch] text-lg font-black leading-tight tracking-tight text-foreground sm:text-[1.35rem]">
                    {point.title}
                  </p>
                  <p className="max-w-[56ch] text-sm font-medium leading-relaxed text-muted-foreground sm:text-[15px]">
                    {point.description}
                  </p>
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>

      <div className="relative overflow-hidden rounded-[1.8rem] border border-primary/14 bg-primary/8 px-5 py-5 sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.5),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_46%)]" />
        <p className="relative text-sm font-semibold leading-relaxed text-foreground sm:text-[15px]">
          Numa non aggiunge un altro tracker. Ti restituisce un quadro: presente, stima e sostenibilita delle spese fisse.
        </p>
      </div>
    </div>
  )
}
