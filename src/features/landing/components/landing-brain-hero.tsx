"use client"

import { useRef } from "react"
import { m, useReducedMotion, useScroll, useTransform, useSpring } from "framer-motion"
import { useDeviceHardware } from "@/hooks/use-device-hardware"
import { LANDING_BRAIN_CONTENT } from "../content"
import {
  LANDING_BRAIN_RANGES,
  LANDING_BLUR_REVEAL,
  LANDING_BLUR_TRANSITION,
  LANDING_DEEP_BLUR,
  LANDING_NO_BLUR,
  LANDING_NO_BLUR_REVEAL,
  LANDING_NO_BLUR_TRANSITION
} from "./landing-motion"

export function LandingBrainHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion() ?? false
  const { safeToAnimate3D } = useDeviceHardware()
  const shouldReduceVisualEffects = prefersReducedMotion || !safeToAnimate3D

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

  const act1Opacity = useTransform(scrollYProgress, LANDING_BRAIN_RANGES.act1, [1, 1, 1, 0])
  const act1Y = useTransform(smoothProgress, LANDING_BRAIN_RANGES.act1, shouldReduceVisualEffects ? [0, 0, 0, -12] : [0, 0, 0, -40])
  const act1Blur = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act1,
    shouldReduceVisualEffects ? LANDING_NO_BLUR_TRANSITION : [LANDING_NO_BLUR, LANDING_NO_BLUR, LANDING_NO_BLUR, LANDING_DEEP_BLUR]
  )
  const act1Scale = useTransform(smoothProgress, LANDING_BRAIN_RANGES.act1, shouldReduceVisualEffects ? [1, 1, 1, 1] : [0.95, 1, 1, 1.05])

  const act2Opacity = useTransform(scrollYProgress, LANDING_BRAIN_RANGES.act2, [0, 1, 1, 0])
  const act2Y = useTransform(smoothProgress, LANDING_BRAIN_RANGES.act2, shouldReduceVisualEffects ? [12, 0, 0, -16] : [40, 0, 0, -60])
  const act2Blur = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act2,
    shouldReduceVisualEffects ? LANDING_NO_BLUR_TRANSITION : LANDING_BLUR_TRANSITION
  )
  const act2Scale = useTransform(smoothProgress, LANDING_BRAIN_RANGES.act2, shouldReduceVisualEffects ? [1, 1, 1, 1] : [0.95, 1, 1, 1.05])

  const act3Opacity = useTransform(scrollYProgress, LANDING_BRAIN_RANGES.act3, [0, 1, 1, 1])
  const act3Y = useTransform(smoothProgress, LANDING_BRAIN_RANGES.act3Y, shouldReduceVisualEffects ? [12, 0] : [40, 0])
  const act3Blur = useTransform(
    scrollYProgress,
    LANDING_BRAIN_RANGES.act3Y,
    shouldReduceVisualEffects ? LANDING_NO_BLUR_REVEAL : LANDING_BLUR_REVEAL
  )
  const act3Scale = useTransform(smoothProgress, LANDING_BRAIN_RANGES.act3Y, shouldReduceVisualEffects ? [1, 1] : [0.95, 1])

  const graphY = useTransform(smoothProgress, [0, 1], shouldReduceVisualEffects ? [0, -8] : [24, -44])
  const graphScale = useTransform(smoothProgress, [0, 0.48, 1], shouldReduceVisualEffects ? [1, 1, 1] : [0.98, 1.04, 1.01])
  const historyDraw = useTransform(scrollYProgress, [0.02, 0.22], [0.42, 1])
  const forecastDraw = useTransform(scrollYProgress, [0.28, 0.66], [0, 1])
  const baselineOpacity = useTransform(scrollYProgress, [0.02, 0.18, 0.86, 1], [0.34, 0.62, 0.5, 0.34])
  const forecastOpacity = useTransform(scrollYProgress, [0.24, 0.46, 0.92], [0.34, 1, 0.78])
  const nodeBaseOpacity = useTransform(scrollYProgress, [0.04, 0.18], [0.36, 0.72])
  const nodeTodayOpacity = useTransform(scrollYProgress, [0.2, 0.42], [0.2, 1])
  const nodeLimitOpacity = useTransform(scrollYProgress, [0.58, 0.78], [0, 1])
  const metricOneOpacity = act1Opacity
  const metricTwoOpacity = act2Opacity
  const metricThreeOpacity = act3Opacity

  const act1Style = { opacity: act1Opacity, y: act1Y, filter: act1Blur, scale: act1Scale }
  const act2Style = { opacity: act2Opacity, y: act2Y, filter: act2Blur, scale: act2Scale }
  const act3Style = { opacity: act3Opacity, y: act3Y, filter: act3Blur, scale: act3Scale }

  const titleClass = "mx-auto max-w-[17ch] text-balance text-center [font-size:clamp(2.15rem,4.8vw,4.4rem)] font-black leading-[0.98] text-foreground drop-shadow-[0_18px_46px_rgba(15,23,42,0.16)] dark:text-white dark:drop-shadow-[0_18px_46px_rgba(0,0,0,0.42)]"

  const [act1, act2, act3] = LANDING_BRAIN_CONTENT.acts

  const renderTitleLines = (lines: readonly string[]) =>
    lines.map((line, index) => (
      <span key={`${line}-${index}`}>
        {index > 0 ? <br /> : null}
        {line}
      </span>
    ))

  return (
    <div ref={containerRef} className="relative h-[440svh] w-full bg-background">
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_70%_42%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_24%_78%,rgba(6,182,212,0.12),transparent_36%),linear-gradient(145deg,hsl(var(--background))_0%,rgba(240,253,250,0.82)_48%,hsl(var(--background))_100%)] dark:bg-[radial-gradient(circle_at_70%_42%,rgba(40,255,191,0.22),transparent_28%),radial-gradient(circle_at_24%_78%,rgba(20,184,166,0.25),transparent_34%),linear-gradient(145deg,#010302_0%,#03110d_45%,#000_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.2] [background-image:linear-gradient(rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.055)_1px,transparent_1px)] [background-size:120px_120px] dark:opacity-[0.18] dark:[background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background))_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(0,0,0,0.78)_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,hsl(var(--background))_0%,transparent_24%,transparent_74%,hsl(var(--background))_100%)] dark:bg-[linear-gradient(180deg,rgba(0,0,0,0.72)_0%,transparent_22%,transparent_74%,rgba(0,0,0,0.84)_100%)]" />

        <m.div
          style={{ y: graphY, scale: graphScale }}
          data-testid="landing-brain-estimate-graph"
          className="pointer-events-none absolute inset-0 z-20"
        >
          <div className="relative h-full w-full">
            <svg
              viewBox="0 0 1200 760"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 h-full w-full overflow-visible text-teal-700 dark:text-emerald-100"
              role="img"
              aria-label="Curva Numa: dati caricati, risposta di oggi e avviso quando manca qualcosa"
            >
              <defs>
                <linearGradient id="brain-estimate-history" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
                  <stop offset="72%" stopColor="currentColor" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.74" />
                </linearGradient>
                <linearGradient id="brain-estimate-forecast" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.78" />
                  <stop offset="48%" stopColor="currentColor" stopOpacity="0.96" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="brain-estimate-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.13" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
                <filter id="brain-estimate-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="16" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <m.path
                d="M -90 604 C 64 506, 184 704, 324 586 C 444 486, 398 352, 548 330 C 668 312, 696 398, 806 346"
                fill="none"
                stroke="url(#brain-estimate-history)"
                strokeWidth="11"
                strokeLinecap="round"
                filter={shouldReduceVisualEffects ? undefined : "url(#brain-estimate-glow)"}
                style={{ pathLength: historyDraw, opacity: baselineOpacity }}
              />
              <m.path
                d="M 806 346 C 918 294, 868 120, 1048 84 C 1124 68, 1168 32, 1270 -18"
                fill="none"
                stroke="url(#brain-estimate-forecast)"
                strokeWidth="12"
                strokeLinecap="round"
                filter={shouldReduceVisualEffects ? undefined : "url(#brain-estimate-glow)"}
                style={{ pathLength: forecastDraw, opacity: forecastOpacity }}
              />
              <m.path
                d="M -90 604 C 64 506, 184 704, 324 586 C 444 486, 398 352, 548 330 C 668 312, 696 398, 806 346 C 918 294, 868 120, 1048 84 C 1124 68, 1168 32, 1270 -18 L 1270 760 L -90 760 Z"
                fill="url(#brain-estimate-fill)"
                style={{ opacity: forecastOpacity }}
              />

              <m.g style={{ opacity: nodeBaseOpacity }}>
                <circle cx="548" cy="330" r="11" className="fill-teal-700/78 dark:fill-emerald-100/86" />
                <circle cx="548" cy="330" r="34" className="fill-teal-500/12 dark:fill-emerald-100/13" />
              </m.g>
              <m.g style={{ opacity: nodeTodayOpacity }}>
                <circle cx="806" cy="346" r="34" className="fill-teal-500/18 dark:fill-emerald-100/22" filter={shouldReduceVisualEffects ? undefined : "url(#brain-estimate-glow)"} />
                <circle cx="806" cy="346" r="23" className="fill-teal-50/94 dark:fill-emerald-50/94" />
                <circle cx="806" cy="346" r="10" className="fill-teal-900/42 dark:fill-emerald-950/62" />
              </m.g>
              <m.g style={{ opacity: nodeLimitOpacity }}>
                <circle cx="1048" cy="84" r="16" className="fill-teal-500/92 dark:fill-emerald-200/96" filter={shouldReduceVisualEffects ? undefined : "url(#brain-estimate-glow)"} />
                <circle cx="1048" cy="84" r="6" className="fill-teal-950/54 dark:fill-emerald-950/62" />
              </m.g>
            </svg>

            <m.div style={{ opacity: nodeBaseOpacity }} className="absolute left-[44%] top-[45%] hidden -translate-x-1/2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/42 dark:text-white/48 sm:block">
              Dati caricati
            </m.div>
            <m.div style={{ opacity: nodeTodayOpacity }} className="absolute left-[63%] top-[47%] hidden -translate-x-1/2 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700/64 dark:text-emerald-100/72 sm:block">
              Oggi
            </m.div>
            <m.div style={{ opacity: nodeLimitOpacity }} className="absolute right-[9%] top-[13%] hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700/70 dark:text-emerald-100/78 sm:block">
              Ci sta
            </m.div>
          </div>
        </m.div>

        <div className="pointer-events-none absolute inset-x-0 top-[11svh] z-30 flex justify-center px-6 sm:top-[12svh]">
          <m.div style={{ opacity: metricOneOpacity }} className="absolute text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-teal-700/62 dark:text-emerald-200/58">Dati caricati</p>
            <p className="mt-2 text-[clamp(3rem,9vw,7rem)] font-light leading-none text-foreground dark:text-white">100%</p>
            <p className="mt-2 text-[13px] font-medium text-muted-foreground dark:text-white/54">parte da quello che hai</p>
          </m.div>
          <m.div style={{ opacity: metricTwoOpacity }} className="absolute text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-teal-700/62 dark:text-emerald-200/58">Risposta</p>
            <p className="mt-2 text-[clamp(3rem,9vw,7rem)] font-light leading-none text-foreground dark:text-white">Ci sta</p>
            <p className="mt-2 text-[13px] font-medium text-muted-foreground dark:text-white/54">una lettura, non dieci conti</p>
          </m.div>
          <m.div style={{ opacity: metricThreeOpacity }} className="absolute text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-teal-700/62 dark:text-emerald-200/58">Zero magie</p>
            <p className="mt-2 text-[clamp(3.5rem,12vw,8rem)] font-light leading-none text-foreground dark:text-white">0</p>
            <p className="mt-2 text-[13px] font-medium text-muted-foreground dark:text-white/54">dati inventati</p>
          </m.div>
        </div>

        {/* ACT 1 */}
        <m.div
          style={act1Style}
          data-testid="landing-brain-act-1"
          className="pointer-events-none absolute inset-x-0 bottom-[8svh] z-40 flex w-full flex-col items-center px-6 sm:bottom-[9svh]"
        >
          <div className="flex flex-col items-center">
            <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.24em] text-teal-700/76 drop-shadow-[0_0_16px_rgba(20,184,166,0.16)] dark:text-emerald-200/70 dark:drop-shadow-[0_0_16px_rgba(110,231,183,0.26)]">
              {act1.kicker}
            </p>
            <h2 id="landing-brain-hero-title" aria-label={act1.titleLines.join(" ")} className={titleClass}>
              {renderTitleLines(act1.titleLines)}
            </h2>
            <p className="mx-auto mt-5 max-w-[44ch] text-center text-[15px] font-medium leading-relaxed text-muted-foreground dark:text-white/58 sm:text-lg">
              {act1.description}
            </p>
          </div>
        </m.div>

        {/* ACT 2 */}
        <m.div
          style={act2Style}
          data-testid="landing-brain-act-2"
          className="pointer-events-none absolute inset-x-0 bottom-[8svh] z-40 flex w-full flex-col items-center px-6 sm:bottom-[9svh]"
        >
          <div className="relative flex w-full max-w-6xl flex-col items-center">
            <div className="relative z-20 flex flex-col items-center text-center">
              <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.24em] text-teal-700/76 drop-shadow-[0_0_16px_rgba(20,184,166,0.16)] dark:text-emerald-200/70 dark:drop-shadow-[0_0_16px_rgba(110,231,183,0.26)]">
                {act2.kicker}
              </p>
              <h3 aria-label={act2.titleLines.join(" ")} className={titleClass}>
                {renderTitleLines(act2.titleLines)}
              </h3>
              <p className="mx-auto mt-5 max-w-[44ch] text-center text-[15px] font-medium leading-relaxed text-muted-foreground dark:text-white/58 sm:text-lg">
                {act2.description}
              </p>
            </div>
          </div>
        </m.div>

        {/* ACT 3 */}
        <m.div
          style={act3Style}
          data-testid="landing-brain-act-3"
          className="pointer-events-none absolute inset-x-0 bottom-[8svh] z-40 flex w-full flex-col items-center px-6 sm:bottom-[9svh]"
        >
          <div className="relative flex w-full max-w-6xl flex-col items-center">
            <div className="relative z-20 flex flex-col items-center text-center">
              <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.24em] text-teal-700/76 drop-shadow-[0_0_16px_rgba(20,184,166,0.16)] dark:text-emerald-200/70 dark:drop-shadow-[0_0_16px_rgba(110,231,183,0.26)]">
                {act3.kicker}
              </p>
              <h3 aria-label={act3.titleLines.join(" ")} className={titleClass}>
                {renderTitleLines(act3.titleLines)}
              </h3>
              <p className="mx-auto mt-5 max-w-[44ch] text-center text-[15px] font-medium leading-relaxed text-muted-foreground dark:text-white/58 sm:text-lg">
                {act3.description}
              </p>
            </div>
          </div>
        </m.div>
      </div>
    </div>
  )
}
