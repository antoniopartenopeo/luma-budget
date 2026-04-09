"use client"

import { useRef } from "react"
import { m } from "framer-motion"
import { useHardwareParallax } from "@/hooks/use-hardware-parallax"
import { LANDING_PROBLEM_SECTION, LANDING_STORY_POINTS } from "../content"
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

function ConsoleChassis() {
  const cardRef = useRef<HTMLDivElement>(null)
  const { rotateX, rotateY, backgroundPosition, handleMouseMove, handleMouseLeave } = useHardwareParallax({ tiltMax: 6 })

  const _handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    handleMouseMove(e, cardRef.current.getBoundingClientRect())
  }

  return (
    <m.div
      ref={cardRef}
      onMouseMove={_handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/62 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-zinc-950/40 dark:shadow-[0_24px_70px_-42px_rgba(0,0,0,0.42)] will-change-transform"
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_52%)]" />
      
      <m.div 
        className="pointer-events-none absolute inset-0 z-[1] opacity-40 dark:opacity-20 mix-blend-overlay transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, transparent 60%)",
          backgroundSize: "200% 200%",
          backgroundPosition
        }}
      />

      <div className="relative z-10 p-6 sm:p-8 sm:py-10 [transform-style:preserve-3d]">
        <div className="mb-4 flex items-center gap-1.5" style={{ transform: "translateZ(10px)" }}>
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/80 dark:bg-red-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80 dark:bg-amber-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80 dark:bg-emerald-500/50" />
          <span className="ml-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Console.log</span>
        </div>

        <m.p 
          className="relative text-[17px] font-medium leading-relaxed tracking-tight text-foreground/80 sm:text-[19px] lg:text-[21px]"
          style={{ transform: "translateZ(30px)" }}
        >
          {LANDING_PROBLEM_SECTION.statement}
        </m.p>
      </div>
    </m.div>
  )
}

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
              className="shadow-[0_30px_90px_-40px_rgba(15,23,42,0.16)] dark:shadow-[0_30px_90px_-40px_rgba(0,0,0,0.5)]"
              contentClassName="p-8 sm:p-10"
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

      <ConsoleChassis />
    </div>
  )
}
