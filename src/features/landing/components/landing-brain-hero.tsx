"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform, useMotionTemplate } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { AppleFluidBackground } from "./motion-primitives"

const FLUID_EXPANSION_RANGE = [0, 0.4, 0.8]
const ACT_1_RANGE = [0, 0.05, 0.22, 0.28]
const ACT_2_RANGE = [0.32, 0.38, 0.55, 0.62]
const ACT_3_RANGE = [0.68, 0.78, 0.95, 1]
const ACT_3_Y_RANGE = [0.68, 0.78]
const NO_BLUR = "blur(0px)"
const BLUR_IN_OUT = [NO_BLUR, NO_BLUR, NO_BLUR, NO_BLUR]
const BLUR_TRANSITION = ["blur(12px)", NO_BLUR, NO_BLUR, "blur(12px)"]
const BLUR_REVEAL = ["blur(12px)", NO_BLUR]
const NO_BLUR_REVEAL = [NO_BLUR, NO_BLUR]

export function LandingBrainHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion() ?? false

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const coreRadius = useTransform(
    scrollYProgress,
    FLUID_EXPANSION_RANGE,
    ["2%", "15%", "30%"]
  )
  const fadeEdge = useTransform(
    scrollYProgress,
    FLUID_EXPANSION_RANGE,
    ["40%", "70%", "100%"]
  )
  const maskImageStyle = useMotionTemplate`radial-gradient(circle at 50% 50%, black ${coreRadius}, transparent ${fadeEdge})`

  const act1Opacity = useTransform(
    scrollYProgress,
    ACT_1_RANGE,
    [0, 1, 1, 0]
  )
  const act1Blur = useTransform(
    scrollYProgress,
    ACT_1_RANGE,
    prefersReducedMotion ? BLUR_IN_OUT : BLUR_TRANSITION
  )

  const act2Opacity = useTransform(
    scrollYProgress,
    ACT_2_RANGE,
    [0, 1, 1, 0]
  )
  const act2Y = useTransform(
    scrollYProgress,
    ACT_2_RANGE,
    [20, 0, 0, -20]
  )
  const act2Blur = useTransform(
    scrollYProgress,
    ACT_2_RANGE,
    prefersReducedMotion ? BLUR_IN_OUT : BLUR_TRANSITION
  )

  const act3Opacity = useTransform(
    scrollYProgress,
    ACT_3_RANGE,
    [0, 1, 1, 0]
  )
  const act3Y = useTransform(
    scrollYProgress,
    ACT_3_Y_RANGE,
    [20, 0]
  )
  const act3Blur = useTransform(
    scrollYProgress,
    ACT_3_Y_RANGE,
    prefersReducedMotion ? NO_BLUR_REVEAL : BLUR_REVEAL
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
            Numa Predictive Engine
          </Badge>
          <h2
            id="landing-brain-hero-title"
            className="text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl drop-shadow-xl"
          >
            Guarda oltre.
          </h2>
        </motion.div>

        <motion.div
          style={act2Style}
          data-testid="landing-brain-act-2"
          className="absolute z-30 flex flex-col items-center text-center pointer-events-none px-6"
        >
          <h3 className="text-3xl font-bold tracking-tight text-foreground/90 sm:text-5xl lg:text-6xl drop-shadow-xl max-w-3xl">
            Processa le tue abitudini.<br />
            <span className="text-muted-foreground">Proietta il tuo potenziale.</span>
          </h3>
        </motion.div>

        <motion.div
          style={act3Style}
          data-testid="landing-brain-act-3"
          className="absolute z-30 flex flex-col items-center text-center pointer-events-none px-6"
        >
          <h3 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-7xl drop-shadow-2xl">
            Il tuo mese,
            <br />
            svelato prima di viverlo.
          </h3>
        </motion.div>
      </div>
    </div>
  )
}
