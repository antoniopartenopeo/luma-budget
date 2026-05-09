"use client"

import { useRef } from "react"
import { Check, Sparkles } from "lucide-react"
import { m, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion"
import { useDeviceHardware } from "@/hooks/use-device-hardware"
import { LANDING_BRAIN_CONTENT } from "../content"

const CASH_FLOW_MARKERS = [
  {
    label: "Dati reali",
    value: "movimenti",
    x: 78,
    y: 284,
    width: 176
  },
  {
    label: "Ricorrenze",
    value: "costi fissi",
    x: 336,
    y: 218,
    width: 160
  },
  {
    label: "Scenario",
    value: "nuova spesa",
    x: 548,
    y: 104,
    width: 150
  }
] as const

export function LandingBrainHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion() ?? false
  const { safeToAnimate3D } = useDeviceHardware()
  const shouldReduceVisualEffects = prefersReducedMotion || !safeToAnimate3D

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 32,
    restDelta: 0.001
  })

  const graphDraw = useTransform(scrollYProgress, [0.12, 0.58], [0.2, 1])
  const graphGlow = useTransform(scrollYProgress, [0.18, 0.48, 0.82], [0.48, 1, 0.7])
  const visualY = useTransform(smoothProgress, [0, 1], shouldReduceVisualEffects ? [0, 0] : [28, -26])
  const visualRotate = useTransform(smoothProgress, [0, 1], shouldReduceVisualEffects ? [0, 0] : [-1.4, 1.2])
  const panelY = useTransform(smoothProgress, [0, 1], shouldReduceVisualEffects ? [0, 0] : [14, -16])
  const markerOneOpacity = useTransform(scrollYProgress, [0.17, 0.24], [0, 1])
  const markerTwoOpacity = useTransform(scrollYProgress, [0.32, 0.42], [0, 1])
  const markerThreeOpacity = useTransform(scrollYProgress, [0.48, 0.58], [0, 1])
  const markerOneY = useTransform(scrollYProgress, [0.17, 0.24], [10, 0])
  const markerTwoY = useTransform(scrollYProgress, [0.32, 0.42], [10, 0])
  const markerThreeY = useTransform(scrollYProgress, [0.48, 0.58], [10, 0])

  const [act1, act2, act3] = LANDING_BRAIN_CONTENT.acts
  const acts = [act1, act2, act3]
  const markerStyles = [
    { opacity: markerOneOpacity, y: markerOneY },
    { opacity: markerTwoOpacity, y: markerTwoY },
    { opacity: markerThreeOpacity, y: markerThreeY }
  ] as const

  const renderTitleLines = (lines: readonly string[]) =>
    lines.map((line, index) => (
      <span key={`${line}-${index}`}>
        {index > 0 ? <br /> : null}
        {line}
      </span>
    ))

  return (
    <div ref={containerRef} className="relative overflow-hidden bg-background px-5 py-24 text-slate-950 sm:px-8 sm:py-28 lg:px-10 dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(58,133,145,0.12),transparent_28%),radial-gradient(circle_at_82%_76%,rgba(20,184,166,0.10),transparent_30%)] dark:bg-[radial-gradient(circle_at_18%_28%,rgba(161,222,235,0.12),transparent_28%),radial-gradient(circle_at_82%_76%,rgba(45,212,191,0.10),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(15,23,42,0.052)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.052)_1px,transparent_1px)] [background-size:120px_120px] dark:opacity-[0.14] dark:[background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]" />

      <div className="relative mx-auto grid max-w-[92rem] gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-16">
        <m.div
          style={{ y: visualY, rotate: visualRotate }}
          data-testid="landing-brain-estimate-graph"
          className="relative min-h-[31rem] overflow-hidden rounded-[2rem] border border-slate-950/10 bg-white/70 shadow-[0_34px_110px_-70px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl sm:min-h-[39rem] lg:h-full dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_34px_120px_-74px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.08)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_68%_24%,rgba(58,133,145,0.22),transparent_24%),radial-gradient(circle_at_28%_74%,rgba(20,184,166,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.72),rgba(240,253,244,0.22),rgba(255,255,255,0.84))] dark:bg-[radial-gradient(circle_at_68%_24%,rgba(161,222,235,0.18),transparent_24%),radial-gradient(circle_at_28%_74%,rgba(45,212,191,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.075),rgba(3,18,15,0.18),rgba(0,0,0,0.22))]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(180deg,transparent,rgba(58,133,145,0.10)_58%,rgba(58,133,145,0.18))] dark:bg-[linear-gradient(180deg,transparent,rgba(161,222,235,0.07)_58%,rgba(161,222,235,0.12))]" />

          <svg
            viewBox="0 0 760 560"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full text-[#3a8591] dark:text-[#a1deeb]"
            role="img"
            aria-label="Curva Numa: movimenti, scelta e risposta"
          >
            <defs>
              <filter id="cash-flow-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="15" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="cash-flow-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
                <stop offset="48%" stopColor="currentColor" stopOpacity="0.58" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="cash-flow-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path d="M76 470 H700" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.13" />
            <path d="M76 336 H700" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.11" />
            <path d="M76 202 H700" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.09" />
            <path d="M155 92 V520" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="10 14" opacity="0.14" />
            <path d="M402 92 V520" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="10 14" opacity="0.14" />
            <path d="M640 92 V520" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="10 14" opacity="0.14" />

            <m.path
              d="M 34 456 C 98 410, 128 370, 186 356 C 278 334, 322 360, 402 284 C 488 204, 540 242, 612 176 C 654 138, 696 104, 734 76"
              fill="none"
              stroke="url(#cash-flow-line)"
              strokeWidth="14"
              strokeLinecap="round"
              filter={shouldReduceVisualEffects ? undefined : "url(#cash-flow-glow)"}
              style={{ pathLength: graphDraw, opacity: graphGlow }}
            />
            <m.path
              d="M 34 456 C 98 410, 128 370, 186 356 C 278 334, 322 360, 402 284 C 488 204, 540 242, 612 176 C 654 138, 696 104, 734 76 L734 560 L34 560 Z"
              fill="url(#cash-flow-fill)"
              style={{ opacity: graphGlow }}
            />
            <m.circle cx="186" cy="356" r="24" fill="currentColor" opacity="0.14" style={{ opacity: markerOneOpacity }} />
            <m.circle cx="186" cy="356" r="8" fill="currentColor" style={{ opacity: markerOneOpacity }} />
            <m.circle cx="402" cy="284" r="24" fill="currentColor" opacity="0.18" style={{ opacity: markerTwoOpacity }} />
            <m.circle cx="402" cy="284" r="9" fill="currentColor" style={{ opacity: markerTwoOpacity }} />
            <m.circle cx="612" cy="176" r="28" fill="currentColor" opacity="0.16" style={{ opacity: markerThreeOpacity }} />
            <m.circle cx="612" cy="176" r="10" fill="currentColor" style={{ opacity: markerThreeOpacity }} />

            {CASH_FLOW_MARKERS.map(({ label, value, x, y, width }, index) => (
              <m.foreignObject
                key={label}
                x={x}
                y={y}
                width={width}
                height="78"
                style={markerStyles[index]}
              >
                <div className="rounded-2xl border border-slate-950/8 bg-white/78 px-4 py-3 shadow-[0_16px_42px_-32px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-xl dark:border-white/10 dark:bg-black/34">
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#0f5a6c] dark:text-[#a1deeb]">{label}</p>
                  <p className="mt-1 text-[0.92rem] font-black text-slate-950 dark:text-white">{value}</p>
                </div>
              </m.foreignObject>
            ))}
          </svg>

          <div className="absolute left-7 top-7 flex items-center gap-3 rounded-full border border-slate-950/8 bg-white/72 px-4 py-2.5 text-sm font-black text-slate-950 shadow-[0_18px_44px_-32px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.07] dark:text-white">
            <Sparkles className="h-4 w-4 text-[#3a8591] dark:text-[#a1deeb]" strokeWidth={1.9} />
            Dal dato alla risposta
          </div>

          <div className="absolute bottom-6 left-6 right-6 rounded-[1.35rem] border border-slate-950/8 bg-white/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[0.74rem] font-black uppercase tracking-[0.16em] text-[#0f5a6c] dark:text-[#a1deeb]">Risposta finale</p>
                <p className="mt-1 text-2xl font-black tracking-[-0.03em]">Ci sta</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#3a8591]/12 px-4 py-2 text-sm font-black text-[#0f5a6c] dark:bg-[#a1deeb]/10 dark:text-[#a1deeb]">
                <Check className="h-4 w-4" />
                Mese ancora sereno
              </div>
            </div>
          </div>
        </m.div>

        <m.div style={{ y: panelY }} className="relative flex h-full flex-col justify-center">
          <p className="text-[0.78rem] font-black uppercase tracking-[0.22em] text-[#0f5a6c] dark:text-[#a1deeb]">
            {LANDING_BRAIN_CONTENT.sectionTitle}
          </p>
          <h2 id="landing-brain-hero-title" className="mt-5 max-w-[12ch] text-[clamp(2.75rem,5.4vw,5.9rem)] font-black leading-[0.94] tracking-[-0.045em] text-slate-950 dark:text-white">
            Una curva che spiega la risposta.
          </h2>
          <p className="mt-7 max-w-[38rem] text-[1.12rem] font-medium leading-relaxed text-slate-600 sm:text-[1.24rem] dark:text-white/62">
            Numa non chiede di fidarti di una scatola nera. Ti mostra quali dati legge, quali costi riconosce e dove entra la nuova scelta.
          </p>

          <div className="mt-9 grid gap-4">
            {acts.map((act) => (
              <div key={act.kicker} className="rounded-[1.25rem] border border-slate-950/10 bg-white/72 p-5 shadow-[0_18px_54px_-42px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045]">
                <p className="text-[0.72rem] font-black uppercase tracking-[0.17em] text-[#0f5a6c] dark:text-[#a1deeb]">{act.kicker}</p>
                <h3 aria-label={act.titleLines.join(" ")} className="mt-2 text-[1.45rem] font-black leading-[1.02] tracking-[-0.025em] text-slate-950 dark:text-white">
                  {renderTitleLines(act.titleLines)}
                </h3>
                <p className="mt-2 max-w-[38rem] text-[0.98rem] font-medium leading-relaxed text-slate-600 dark:text-white/58">
                  {act.description}
                </p>
              </div>
            ))}
          </div>
        </m.div>
      </div>
    </div>
  )
}
