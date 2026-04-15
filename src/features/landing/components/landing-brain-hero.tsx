"use client"

import { useRef } from "react"
import { BrainCircuit, CircleAlert, DatabaseZap, Gauge, ShieldCheck } from "lucide-react"
import { m, useReducedMotion, useScroll, useTransform, useMotionTemplate } from "framer-motion"
import { cn } from "@/lib/utils"
import { LANDING_BRAIN_CONTENT } from "../content"
import { AppleFluidBackground } from "./motion-primitives"
import {
  LANDING_BRAIN_RANGES,
  LANDING_BLUR_REVEAL,
  LANDING_BLUR_TRANSITION,
  LANDING_NO_BLUR_REVEAL,
  LANDING_NO_BLUR_TRANSITION
} from "./landing-motion"
import { LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS } from "./landing-tokens"

export function LandingBrainHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion() ?? false

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const coreRadius = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.fluidExpansion,
    ["2%", "15%", "30%"]
  )
  const fadeEdge = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.fluidExpansion,
    ["40%", "70%", "100%"]
  )
  const maskImageStyle = useMotionTemplate`radial-gradient(circle at 50% 50%, black ${coreRadius}, transparent ${fadeEdge})`

  const act1Opacity = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act1,
    [0, 1, 1, 0]
  )
  const act1Blur = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act1,
    prefersReducedMotion ? LANDING_NO_BLUR_TRANSITION : LANDING_BLUR_TRANSITION
  )

  const act2Opacity = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act2,
    [0, 1, 1, 0]
  )
  const act2Y = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act2,
    [20, 0, 0, -20]
  )
  const act2Blur = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act2,
    prefersReducedMotion ? LANDING_NO_BLUR_TRANSITION : LANDING_BLUR_TRANSITION
  )

  const act3Opacity = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act3,
    [0, 1, 1, 0]
  )
  const act3Y = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act3Y,
    [20, 0]
  )
  const act3Blur = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act3Y,
    prefersReducedMotion ? LANDING_NO_BLUR_REVEAL : LANDING_BLUR_REVEAL
  )
  const fluidMaskStyle = {
    WebkitMaskImage: maskImageStyle,
    maskImage: maskImageStyle,
  }

  const reasoningRows = [
    {
      icon: DatabaseZap,
      label: "Base certa",
      value: "Entrate lette + ricorrenze gia emerse",
      toneClassName:
        "border-cyan-400/18 bg-cyan-500/[0.07] text-cyan-700 dark:border-cyan-300/12 dark:bg-cyan-300/[0.08] dark:text-cyan-100"
    },
    {
      icon: Gauge,
      label: "Peso del mese",
      value: "Spese stimate assorbite prima dello scenario",
      toneClassName:
        "border-white/10 bg-white/[0.05] text-foreground dark:text-white"
    },
    {
      icon: ShieldCheck,
      label: "Spazio residuo",
      value: "Margine sostenibile prima di decidere",
      toneClassName:
        "border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-700 dark:border-emerald-300/12 dark:bg-emerald-300/[0.08] dark:text-emerald-100"
    }
  ] as const

  const truthRows = [
    {
      icon: BrainCircuit,
      label: "Stima attiva",
      value: "Il Brain conclude solo quando i segnali sono coerenti"
    },
    {
      icon: CircleAlert,
      label: "Limite chiaro",
      value: "Se manca base, Numa non riempie i vuoti con fiction"
    }
  ] as const
  const act1Style = { opacity: act1Opacity, filter: act1Blur }
  const act2Style = { opacity: act2Opacity, y: act2Y, filter: act2Blur }
  const act3Style = { opacity: act3Opacity, y: act3Y, filter: act3Blur }
  const stageSurfaceClassName =
    "flex w-full max-w-5xl flex-col items-center rounded-[2.2rem] border border-black/6 bg-white/52 px-7 py-8 text-center shadow-[0_28px_80px_-42px_rgba(15,23,42,0.26)] backdrop-blur-2xl dark:border-white/8 dark:bg-white/[0.04] sm:px-10 sm:py-10"
  const [act1, act2, act3] = LANDING_BRAIN_CONTENT.acts

  const renderTitleLines = (lines: readonly string[]) =>
    lines.map((line, index) => (
      <span key={`${line}-${index}`}>
        {index > 0 ? <br /> : null}
        {line}
      </span>
    ))

  return (
    <div ref={containerRef} className="relative h-[440vh] w-full">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 z-10 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]">
          <m.div style={fluidMaskStyle} className="absolute inset-0 h-full w-full">
            <AppleFluidBackground />
          </m.div>
        </div>

        <m.div
          style={act1Style}
          data-testid="landing-brain-act-1"
          className="absolute inset-x-0 z-30 flex w-full flex-col items-center text-center pointer-events-none px-6"
        >
          <div className={stageSurfaceClassName}>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/85 dark:text-foreground/56 sm:text-[12px]">
              {act1.kicker}
            </p>
            <h2
              id="landing-brain-hero-title"
              aria-label={act1.titleLines.join(" ")}
              className={cn(LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS, "mx-auto max-w-[16ch] dark:text-white")}
            >
              {renderTitleLines(act1.titleLines)}
            </h2>
            <p className="mx-auto mt-5 max-w-[40ch] text-[15px] font-normal leading-relaxed text-foreground/64 dark:text-zinc-400 sm:text-lg">
              {act1.description}
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/18 bg-cyan-500/[0.08] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-cyan-300/12 dark:bg-cyan-300/[0.08]">
              <BrainCircuit className="h-4 w-4 text-cyan-700 dark:text-cyan-100" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-100">
                Il margine nasce da segnali letti, non da medie vuote
              </span>
            </div>
          </div>
        </m.div>

        <m.div
          style={act2Style}
          data-testid="landing-brain-act-2"
          className="absolute inset-x-0 z-30 flex w-full flex-col items-center text-center pointer-events-none px-6"
        >
          <div className={stageSurfaceClassName}>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/85 dark:text-foreground/56 sm:text-[12px]">
              {act2.kicker}
            </p>
            <h3
              aria-label={act2.titleLines.join(" ")}
              className={cn(LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS, "mx-auto max-w-[15ch] font-extrabold dark:text-white")}
            >
              {renderTitleLines(act2.titleLines)}
            </h3>
            <p className="mx-auto mt-5 max-w-[40ch] text-[15px] font-normal leading-relaxed text-foreground/64 dark:text-zinc-400 sm:text-lg">
              {act2.description}
            </p>
            <div className="mt-8 grid w-full max-w-4xl gap-3">
              {reasoningRows.map((row) => {
                const Icon = row.icon

                return (
                  <div
                    key={row.label}
                    className={cn(
                      "grid min-h-20 grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-[1.6rem] border px-5 py-4 text-left shadow-[0_18px_34px_-28px_rgba(15,23,42,0.22)] backdrop-blur-xl",
                      row.toneClassName
                    )}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-current/12 bg-white/50 dark:bg-black/12">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-current/72">
                        {row.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold tracking-tight text-foreground dark:text-white">
                        {row.value}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </m.div>

        <m.div
          style={act3Style}
          data-testid="landing-brain-act-3"
          className="absolute inset-x-0 z-30 flex w-full flex-col items-center text-center pointer-events-none px-6"
        >
          <div className={stageSurfaceClassName}>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/85 dark:text-foreground/56 sm:text-[12px]">
              {act3.kicker}
            </p>
            <h3
              aria-label={act3.titleLines.join(" ")}
              className={cn(LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS, "mx-auto max-w-[16ch] font-extrabold dark:text-white")}
            >
              {renderTitleLines(act3.titleLines)}
            </h3>
            <p className="mx-auto mt-5 max-w-[40ch] text-[15px] font-normal leading-relaxed text-foreground/64 dark:text-zinc-400 sm:text-lg">
              {act3.description}
            </p>
            <div className="mt-8 grid w-full max-w-3xl gap-3">
              {truthRows.map((row) => {
                const Icon = row.icon

                return (
                  <div
                    key={row.label}
                    className="grid min-h-20 grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.06] px-5 py-4 text-left shadow-[0_18px_34px_-28px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:bg-white/[0.05]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-white/40 text-foreground dark:bg-black/14 dark:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground/52 dark:text-white/56">
                        {row.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold tracking-tight text-foreground dark:text-white">
                        {row.value}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </m.div>
      </div>
    </div>
  )
}
