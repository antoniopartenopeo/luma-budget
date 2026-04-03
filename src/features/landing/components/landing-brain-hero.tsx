"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform, useMotionTemplate } from "framer-motion"
import { AppleFluidBackground } from "./motion-primitives"
import {
  LANDING_BRAIN_RANGES,
  LANDING_BLUR_REVEAL,
  LANDING_BLUR_TRANSITION,
  LANDING_NO_BLUR_REVEAL,
  LANDING_NO_BLUR_TRANSITION
} from "./landing-motion"

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

  return (
    <div ref={containerRef} className="relative h-[600vh] w-full">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 z-10 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]">
          <motion.div style={fluidMaskStyle} className="absolute inset-0 h-full w-full">
            <AppleFluidBackground />
          </motion.div>
        </div>

        <motion.div
          style={act1Style}
          data-testid="landing-brain-act-1"
          className="absolute z-30 flex flex-col items-center text-center pointer-events-none px-6"
        >
          <p className="mb-5 text-[12px] font-mono font-bold uppercase tracking-[0.2em] text-primary/85 dark:text-cyan-400">
            Il Brain di Numa
          </p>
          <h2
            id="landing-brain-hero-title"
            className="max-w-[20ch] text-5xl font-black leading-[0.9] tracking-tighter text-foreground dark:text-white sm:text-6xl lg:text-7xl"
          >
            Quando i dati bastano, il mese si vede prima.
          </h2>
          <p className="mt-6 max-w-[44ch] text-[16px] font-normal leading-relaxed text-foreground/62 dark:text-zinc-400 sm:text-lg">
            Il Brain osserva ricorrenze, ritmo di spesa e storico recente per stimare il margine con prudenza chirurgica.
          </p>
        </motion.div>

        <motion.div
          style={act2Style}
          data-testid="landing-brain-act-2"
          className="absolute z-30 flex flex-col items-center text-center pointer-events-none px-6"
        >
          <p className="mb-5 text-[12px] font-mono font-bold uppercase tracking-[0.2em] text-primary/85 dark:text-cyan-400">
            Stima, non spettacolo
          </p>
          <h3 className="max-w-[20ch] text-5xl font-black leading-[0.9] tracking-tighter text-foreground dark:text-white sm:text-6xl lg:text-7xl">
            Una previsione utile e leggibile.
          </h3>
          <p className="mt-6 max-w-[44ch] text-[16px] font-normal leading-relaxed text-foreground/62 dark:text-zinc-400 sm:text-lg">
            Se il contesto non è abbastanza solido, Numa lo segnala. La stima serve a decidere stanotte, non a impressionare.
          </p>
        </motion.div>

        <motion.div
          style={act3Style}
          data-testid="landing-brain-act-3"
          className="absolute z-30 flex flex-col items-center text-center pointer-events-none px-6"
        >
          <p className="mb-5 text-[12px] font-mono font-bold uppercase tracking-[0.2em] text-primary/85 dark:text-cyan-400">
            Per scegliere meglio
          </p>
          <h3 className="max-w-[16ch] text-5xl font-black leading-[0.9] tracking-tighter text-foreground dark:text-white sm:text-6xl lg:text-7xl">
            Margine.<br />Affidabilità.<br />Impatto.
          </h3>
          <p className="mt-6 max-w-[44ch] text-[16px] font-normal leading-relaxed text-foreground/62 dark:text-zinc-400 sm:text-lg">
            Così capisci se una nuova rata o un abbonamento entrano davvero nel quadro termico del mese.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
