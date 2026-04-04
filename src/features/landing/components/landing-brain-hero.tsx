"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform, useMotionTemplate } from "framer-motion"
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
          <motion.div style={fluidMaskStyle} className="absolute inset-0 h-full w-full">
            <AppleFluidBackground />
          </motion.div>
        </div>

        <motion.div
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
          </div>
        </motion.div>

        <motion.div
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
          </div>
        </motion.div>

        <motion.div
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
          </div>
        </motion.div>
      </div>
    </div>
  )
}
