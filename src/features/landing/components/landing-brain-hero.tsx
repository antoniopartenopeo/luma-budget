"use client"

import type { ElementType } from "react"
import { useRef } from "react"
import { BrainCircuit, CircleAlert, DatabaseZap, Gauge, ShieldCheck } from "lucide-react"
import { m, useReducedMotion, useScroll, useTransform, useMotionTemplate, useSpring } from "framer-motion"
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

interface HologramRow {
  icon: ElementType
  label: string
  value: string
  positionClassName?: string
  toneClassName: string
}

export function LandingBrainHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion() ?? false

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Cinematic Spring Configuration for smooth parallax
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const coreRadius = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.fluidExpansion,
    ["2%", "15%", "35%"]
  )
  const fadeEdge = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.fluidExpansion,
    ["40%", "70%", "100%"]
  )
  const maskImageStyle = useMotionTemplate`radial-gradient(circle at 50% 50%, black ${coreRadius}, transparent ${fadeEdge})`

  const act1Opacity = useTransform(scrollYProgress, LANDING_BRAIN_RANGES.act1, [0, 1, 1, 0])
  const act1Y = useTransform(smoothProgress, LANDING_BRAIN_RANGES.act1, [40, 0, 0, -40])
  const act1Blur = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act1,
    prefersReducedMotion ? LANDING_NO_BLUR_TRANSITION : LANDING_BLUR_TRANSITION
  )
  const act1Scale = useTransform(smoothProgress, LANDING_BRAIN_RANGES.act1, [0.95, 1, 1, 1.05])

  const act2Opacity = useTransform(scrollYProgress, LANDING_BRAIN_RANGES.act2, [0, 1, 1, 0])
  const act2Y = useTransform(smoothProgress, LANDING_BRAIN_RANGES.act2, [40, 0, 0, -60])
  const act2Blur = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act2,
    prefersReducedMotion ? LANDING_NO_BLUR_TRANSITION : LANDING_BLUR_TRANSITION
  )
  const act2Scale = useTransform(smoothProgress, LANDING_BRAIN_RANGES.act2, [0.95, 1, 1, 1.05])

  const act3Opacity = useTransform(scrollYProgress, LANDING_BRAIN_RANGES.act3, [0, 1, 1, 0])
  const act3Y = useTransform(smoothProgress, LANDING_BRAIN_RANGES.act3Y, [40, 0])
  const act3Blur = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act3Y,
    prefersReducedMotion ? LANDING_NO_BLUR_REVEAL : LANDING_BLUR_REVEAL
  )
  const act3Scale = useTransform(smoothProgress, LANDING_BRAIN_RANGES.act3Y, [0.95, 1])

  const fluidMaskStyle = {
    WebkitMaskImage: maskImageStyle,
    maskImage: maskImageStyle,
  }

  const reasoningRows: readonly HologramRow[] = [
    {
      icon: DatabaseZap,
      label: "Base certa",
      value: "Entrate e ricorrenze emerse",
      positionClassName: "md:-translate-y-8 md:rotate-[-2deg]",
      toneClassName: "border-cyan-400/18 bg-cyan-400/[0.04] text-cyan-800 dark:border-cyan-300/12 dark:bg-cyan-300/[0.08] dark:text-cyan-100 shadow-[0_16px_40px_-12px_rgba(8,145,178,0.12)]"
    },
    {
      icon: Gauge,
      label: "Peso del mese",
      value: "Spese base assorbite in anticipo",
      positionClassName: "md:translate-y-6 md:rotate-[1.5deg] z-10",
      toneClassName: "border-slate-400/20 bg-slate-100/50 text-foreground dark:border-white/10 dark:bg-white/[0.05] dark:text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_40px_-12px_rgba(255,255,255,0.05)]"
    },
    {
      icon: ShieldCheck,
      label: "Spazio residuo",
      value: "Margine reale calcolato",
      positionClassName: "md:-translate-y-4 md:rotate-[-1deg]",
      toneClassName: "border-emerald-400/18 bg-emerald-400/[0.04] text-emerald-800 dark:border-emerald-300/12 dark:bg-emerald-300/[0.08] dark:text-emerald-100 shadow-[0_16px_40px_-12px_rgba(5,150,105,0.12)]"
    }
  ]

  const truthRows: readonly HologramRow[] = [
    {
      icon: BrainCircuit,
      label: "Feedback Attivo",
      value: "Il Brain calcola solo su dati certi",
      positionClassName: "md:-translate-y-6 md:rotate-[-1.5deg]",
      toneClassName: "border-slate-400/20 bg-slate-100/50 text-foreground dark:border-white/10 dark:bg-white/[0.05] dark:text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_40px_-12px_rgba(255,255,255,0.05)]"
    },
    {
      icon: CircleAlert,
      label: "Nessuna Allucinazione",
      value: "Numa non inventa medie fittizie",
      positionClassName: "md:translate-y-6 md:rotate-[2deg]",
      toneClassName: "border-rose-400/18 bg-rose-400/[0.04] text-rose-800 dark:border-rose-300/12 dark:bg-rose-300/[0.08] dark:text-rose-100 shadow-[0_16px_40px_-12px_rgba(225,29,72,0.12)]"
    }
  ]

  const act1Style = { opacity: act1Opacity, y: act1Y, filter: act1Blur, scale: act1Scale }
  const act2Style = { opacity: act2Opacity, y: act2Y, filter: act2Blur, scale: act2Scale }
  const act3Style = { opacity: act3Opacity, y: act3Y, filter: act3Blur, scale: act3Scale }

  // Massive typography that adapts beautifully to both Light and Dark mode
  const massiveTitleClass = "mx-auto max-w-[16ch] text-balance text-center [font-size:clamp(2.5rem,7vw,5.5rem)] font-black leading-[0.95] tracking-tighter text-foreground drop-shadow-sm dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-white/60"

  const [act1, act2, act3] = LANDING_BRAIN_CONTENT.acts

  const renderTitleLines = (lines: readonly string[]) =>
    lines.map((line, index) => (
      <span key={`${line}-${index}`}>
        {index > 0 ? <br /> : null}
        {line}
      </span>
    ))

  const renderHologramPanel = (row: HologramRow) => {
    const Icon = row.icon
    return (
      <m.div
        key={row.label}
        className={cn(
          "flex w-full min-w-[280px] md:w-auto md:max-w-xs items-center gap-4 rounded-3xl border px-5 py-4 backdrop-blur-3xl transition-transform",
          row.toneClassName,
          row.positionClassName
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-current/10 bg-black/5 dark:bg-white/5 drop-shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">
            {row.label}
          </p>
          <p className="mt-0.5 text-sm font-semibold tracking-tight text-current/95">
            {row.value}
          </p>
        </div>
      </m.div>
    )
  }

  return (
    <div ref={containerRef} className="relative h-[440vh] w-full bg-background">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-background">
        
        {/* Background Fluid with proper stacking */}
        <div className="absolute inset-0 z-10 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]">
          <m.div style={fluidMaskStyle} className="absolute inset-0 h-full w-full">
            <AppleFluidBackground />
          </m.div>
        </div>

        {/* HUD Radial Overlay for deep edge vignetting (Dynamic to theme) */}
        <div className="absolute inset-0 z-20 pointer-events-none opacity-90 [background:radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background))_100%)]" />

        {/* ACT 1 */}
        <m.div
          style={act1Style}
          data-testid="landing-brain-act-1"
          className="absolute inset-x-0 z-30 flex w-full flex-col items-center justify-center pointer-events-none px-6"
        >
          <div className="flex flex-col items-center">
            <p className="mb-6 text-[12px] font-bold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300/80 drop-shadow-sm dark:drop-shadow-[0_0_12px_rgba(103,232,249,0.4)]">
              {act1.kicker}
            </p>
            <h2 id="landing-brain-hero-title" aria-label={act1.titleLines.join(" ")} className={massiveTitleClass}>
              {renderTitleLines(act1.titleLines)}
            </h2>
            <p className="mx-auto mt-6 max-w-[44ch] text-center text-[16px] font-medium leading-relaxed text-muted-foreground dark:text-zinc-400 sm:text-xl">
              {act1.description}
            </p>
            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-100/50 dark:bg-cyan-950/40 px-5 py-2.5 backdrop-blur-xl shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_20px_rgba(8,145,178,0.2)]">
              <BrainCircuit className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-800 dark:text-cyan-100">
                Il margine nasce da segnali letti, non da medie vuote
              </span>
            </div>
          </div>
        </m.div>

        {/* ACT 2 */}
        <m.div
          style={act2Style}
          data-testid="landing-brain-act-2"
          className="absolute inset-x-0 z-30 flex w-full flex-col items-center justify-center pointer-events-none px-6 h-screen"
        >
          <div className="flex w-full max-w-6xl flex-col items-center justify-center h-full relative">
            <div className="relative z-20 flex flex-col items-center text-center">
              <p className="mb-6 text-[12px] font-bold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300/80 drop-shadow-sm dark:drop-shadow-[0_0_12px_rgba(103,232,249,0.4)]">
                {act2.kicker}
              </p>
              <h3 aria-label={act2.titleLines.join(" ")} className={massiveTitleClass}>
                {renderTitleLines(act2.titleLines)}
              </h3>
              <p className="mx-auto mt-6 max-w-[44ch] text-center text-[16px] font-medium leading-relaxed text-muted-foreground dark:text-zinc-400 sm:text-xl">
                {act2.description}
              </p>
            </div>
            
            {/* Holographic HUD floating below the text */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mt-16 md:mt-24 w-full pointer-events-none">
               {reasoningRows.map(renderHologramPanel)}
            </div>
          </div>
        </m.div>

        {/* ACT 3 */}
        <m.div
          style={act3Style}
          data-testid="landing-brain-act-3"
          className="absolute inset-x-0 z-30 flex w-full flex-col items-center justify-center pointer-events-none px-6 h-screen"
        >
          <div className="flex w-full max-w-6xl flex-col items-center justify-center h-full relative">
            <div className="relative z-20 flex flex-col items-center text-center">
              <p className="mb-6 text-[12px] font-bold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300/80 drop-shadow-sm dark:drop-shadow-[0_0_12px_rgba(110,231,183,0.4)]">
                {act3.kicker}
              </p>
              <h3 aria-label={act3.titleLines.join(" ")} className={massiveTitleClass}>
                {renderTitleLines(act3.titleLines)}
              </h3>
              <p className="mx-auto mt-6 max-w-[44ch] text-center text-[16px] font-medium leading-relaxed text-muted-foreground dark:text-zinc-400 sm:text-xl">
                {act3.description}
              </p>
            </div>

            {/* Holographic HUD floating below the text */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mt-16 md:mt-24 w-full pointer-events-none">
              {truthRows.map(renderHologramPanel)}
            </div>
          </div>
        </m.div>
      </div>
    </div>
  )
}
