"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform, useMotionTemplate } from "framer-motion"
import { cn } from "@/lib/utils"
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
    "flex w-full max-w-5xl flex-col items-center rounded-[2.2rem] border border-black/6 bg-white/52 px-7 py-8 text-center shadow-[0_28px_80px_-42px_rgba(15,23,42,0.26)] backdrop-blur-2xl dark:border-white/10 dark:bg-black/24 sm:px-10 sm:py-10"

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
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/85 dark:text-cyan-400 sm:text-[12px]">
              Il Brain di Numa
            </p>
            <h2
              id="landing-brain-hero-title"
              className={cn(LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS, "mx-auto max-w-[16ch] dark:text-white")}
            >
              Quando i dati{" "}
              <br />
              {" "}bastano, il{" "}
              <br />
              {" "}
              mese si vede prima.
            </h2>
            <p className="mx-auto mt-5 max-w-[40ch] text-[15px] font-normal leading-relaxed text-foreground/64 dark:text-zinc-400 sm:text-lg">
              Il Brain legge ricorrenze, ritmo di spesa e storico recente per stimare il margine con prudenza.
            </p>
          </div>
        </motion.div>

        <motion.div
          style={act2Style}
          data-testid="landing-brain-act-2"
          className="absolute inset-x-0 z-30 flex w-full flex-col items-center text-center pointer-events-none px-6"
        >
          <div className={stageSurfaceClassName}>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/85 dark:text-cyan-400 sm:text-[12px]">
              Stima prudente
            </p>
            <h3 className={cn(LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS, "mx-auto max-w-[15ch] font-extrabold dark:text-white")}>
              Una previsione{" "}
              <br />
              {" "}utile e{" "}
              <br />
              {" "}
              leggibile.
            </h3>
            <p className="mx-auto mt-5 max-w-[40ch] text-[15px] font-normal leading-relaxed text-foreground/64 dark:text-zinc-400 sm:text-lg">
              Se il contesto è debole, Numa lo dice. Una buona stima aiuta a decidere, non a fare scena.
            </p>
          </div>
        </motion.div>

        <motion.div
          style={act3Style}
          data-testid="landing-brain-act-3"
          className="absolute inset-x-0 z-30 flex w-full flex-col items-center text-center pointer-events-none px-6"
        >
          <div className={stageSurfaceClassName}>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/85 dark:text-cyan-400 sm:text-[12px]">
              Per scegliere meglio
            </p>
            <h3 className={cn(LANDING_EDITORIAL_CARD_HERO_TITLE_CLASS, "mx-auto max-w-[16ch] font-extrabold dark:text-white")}>
              Margine.<br />Affidabilità.<br />Impatto.
            </h3>
            <p className="mx-auto mt-5 max-w-[40ch] text-[15px] font-normal leading-relaxed text-foreground/64 dark:text-zinc-400 sm:text-lg">
              Così valuti una nuova rata o un abbonamento con un quadro più leggibile del mese.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
