"use client"

import { cn } from "@/lib/utils"
import { LANDING_STORY_POINTS } from "../data"
import { CinematicScrollCard } from "./motion-primitives"
import { LandingEditorialCardFrame } from "./landing-editorial-card-frame"

const STORY_ACCENTS = [
  {
    border: "border-cyan-400/20 dark:border-cyan-400/10",
    panel: "from-cyan-500/[0.02] via-white to-cyan-50/50 dark:from-cyan-900/30 dark:via-black/80 dark:to-cyan-950/20",
    icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-900/40 dark:text-cyan-400",
    label: "text-cyan-600 dark:text-cyan-400"
  },
  {
    border: "border-emerald-400/20 dark:border-emerald-400/10",
    panel: "from-emerald-500/[0.02] via-white to-emerald-50/50 dark:from-emerald-900/30 dark:via-black/80 dark:to-emerald-950/20",
    icon: "border-emerald-400/25 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-900/40 dark:text-emerald-400",
    label: "text-emerald-600 dark:text-emerald-400"
  },
  {
    border: "border-indigo-400/20 dark:border-indigo-400/10",
    panel: "from-indigo-500/[0.02] via-white to-indigo-50/50 dark:from-indigo-900/30 dark:via-black/80 dark:to-indigo-950/20",
    icon: "border-indigo-400/25 bg-indigo-500/10 text-indigo-600 dark:border-indigo-400/15 dark:bg-indigo-900/40 dark:text-indigo-400",
    label: "text-indigo-600 dark:text-indigo-400"
  }
] as const

export function LandingHeroConsole() {
  return (
    <div className="space-y-6 sm:space-y-7 [perspective:1200px]">
      <CinematicScrollCard className="relative overflow-hidden rounded-[2.5rem] border border-black/6 bg-gradient-to-br from-slate-200/78 via-white to-slate-100/90 p-8 shadow-[0_40px_100px_-40px_rgba(15,23,42,0.22)] backdrop-blur-3xl dark:border-white/10 dark:bg-gradient-to-br dark:from-zinc-900/80 dark:via-black/90 dark:to-zinc-950/60 dark:shadow-[0_40px_100px_-40px_rgba(0,0,0,0.6)] sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.3),transparent_44%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_48%)]" />
        <div className="relative space-y-5">
          <div className="space-y-4 text-center mx-auto flex flex-col items-center">
            <p className="text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.2em] text-foreground/42 dark:text-foreground/50">Il nodo</p>
            <h3 className="max-w-[19ch] text-4xl font-black leading-[0.92] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Smetti di indovinare le tue spese.
            </h3>
            <p className="mt-6 max-w-[48ch] text-[15px] font-normal leading-relaxed text-muted-foreground sm:text-lg">
              Molte app registrano quello che fgià successo. Numa usa il passato per rispondere a una domanda più utile: questa spesa ci sta davvero nel mese di oggi?
            </p>
          </div>
        </div>
      </CinematicScrollCard>

      <div className="space-y-4">
        {LANDING_STORY_POINTS.map((point, index) => {
          const accent = STORY_ACCENTS[index]

          return (
            <LandingEditorialCardFrame
              key={point.title}
              borderClassName={accent.border}
              panelClassName={accent.panel}
              decorativeIcon={point.icon}
              decorativeIconPositionClassName="-bottom-[8%] right-[3%]"
              className="p-8 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.16)] dark:shadow-[0_30px_90px_-40px_rgba(0,0,0,0.5)] sm:p-10"
            >
              <div className="relative space-y-3 pr-12 sm:pr-20 lg:pr-28">
                <p className={cn("text-[12px] font-bold uppercase tracking-[0.2em]", accent.label)}>
                  Punto chiave {String(index + 1).padStart(2, "0")}
                </p>
                <p className="max-w-[26ch] text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl">
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
          Numa non e un tracker piu elegante. E un modo piu calmo per leggere il mese e decidere con piu chiarezza.
        </p>
      </div>
    </div>
  )
}
