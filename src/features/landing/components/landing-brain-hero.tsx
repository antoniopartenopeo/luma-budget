"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform, useMotionTemplate } from "framer-motion"
import { Badge } from "@/components/ui/badge"
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
          <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/10 text-primary backdrop-blur-md scale-110">
            Il Brain di Numa
          </Badge>
          <h2
            id="landing-brain-hero-title"
            className="max-w-[11ch] text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl drop-shadow-xl"
          >
            Vede il mese prima che finisca.
          </h2>
          <p className="mt-5 max-w-[40ch] text-sm font-medium leading-relaxed text-foreground/72 sm:text-base">
            Non inventa scenari. Legge i movimenti, riconosce il ritmo e prova a mostrarti dove stai andando.
          </p>
        </motion.div>

        <motion.div
          style={act2Style}
          data-testid="landing-brain-act-2"
          className="absolute z-30 flex flex-col items-center text-center pointer-events-none px-6"
        >
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-primary/82">
            Quando i dati bastano
          </p>
          <h3 className="max-w-[14ch] text-3xl font-black tracking-tight text-foreground/92 sm:text-5xl lg:text-6xl drop-shadow-xl">
            Stima fine mese e mese dopo.
          </h3>
          <p className="mt-5 max-w-[38ch] text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
            Se il quadro non e ancora abbastanza stabile, te lo dice chiaramente. Non forza una risposta.
          </p>
        </motion.div>

        <motion.div
          style={act3Style}
          data-testid="landing-brain-act-3"
          className="absolute z-30 flex flex-col items-center text-center pointer-events-none px-6"
        >
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-primary/82">
            Quello che ti restituisce
          </p>
          <h3 className="max-w-[12ch] text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-7xl drop-shadow-2xl">
            Un importo.
            <br />
            Un&apos;affidabilita.
            <br />
            Un orizzonte chiaro.
          </h3>
          <p className="mt-5 max-w-[34ch] text-sm font-medium leading-relaxed text-foreground/68 sm:text-base">
            Cosi puoi decidere prima, invece di rincorrere il mese dopo.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
