"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform, useMotionTemplate } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { AppleFluidBackground } from "./motion-primitives"

export function LandingBrainHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const smooth = useSpring(scrollYProgress, {
    stiffness: 12,
    damping: 25,
    mass: 1.5,
    restDelta: 0.0005,
  })

  // ── Fluid Expansion Control ──
  // Use useMotionTemplate to generate a valid cross-browser CSS mask-image gradient.
  // black = visible fluid, transparent = hidden fluid.
  // We keep the "solid" core very small even at max expansion (35%), 
  // so the fading gradient has a massive runway (from 35% to 100%) to blend flawlessly with the background.
  const coreRadius = useTransform(smooth, [0, 0.4, 0.8], ["2%", "15%", "30%"])
  const fadeEdge = useTransform(smooth, [0, 0.4, 0.8], ["40%", "70%", "100%"])
  const maskImageStyle = useMotionTemplate`radial-gradient(circle at 50% 50%, black ${coreRadius}, transparent ${fadeEdge})`

  // ── Act 1: The Hook ──
  const act1Opacity = useTransform(smooth, [0, 0.05, 0.22, 0.28], [0, 1, 1, 0])
  const act1Blur = useTransform(smooth, [0, 0.05, 0.22, 0.28], ["blur(12px)", "blur(0px)", "blur(0px)", "blur(12px)"])

  // ── Act 2: The Explanation ──
  const act2Opacity = useTransform(smooth, [0.32, 0.38, 0.55, 0.62], [0, 1, 1, 0])
  const act2Y = useTransform(smooth, [0.32, 0.38, 0.55, 0.62], [20, 0, 0, -20])
  const act2Blur = useTransform(smooth, [0.32, 0.38, 0.55, 0.62], ["blur(12px)", "blur(0px)", "blur(0px)", "blur(12px)"])

  // ── Act 3: The Promise ──
  const act3Opacity = useTransform(smooth, [0.68, 0.78, 0.95, 1.0], [0, 1, 1, 0])
  const act3Y = useTransform(smooth, [0.68, 0.78], [20, 0])
  const act3Blur = useTransform(smooth, [0.68, 0.78], ["blur(12px)", "blur(0px)"])
  const fluidMaskStyle = {
    WebkitMaskImage: maskImageStyle,
    maskImage: maskImageStyle,
  }
  const act1Style = { opacity: act1Opacity, filter: act1Blur }
  const act2Style = { opacity: act2Opacity, y: act2Y, filter: act2Blur }
  const act3Style = { opacity: act3Opacity, y: act3Y, filter: act3Blur }

  if (prefersReducedMotion) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/10 text-primary backdrop-blur-md">
          Numa Predictive Engine
        </Badge>
        <h2 id="landing-brain-hero-title" className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Guarda oltre.
        </h2>
        <p className="mt-8 max-w-lg text-lg font-medium text-muted-foreground">
          Processa le tue abitudini. Proietta il tuo potenziale. <br/>
          Il tuo mese, svelato prima di viverlo.
        </p>
      </section>
    )
  }

  return (
    <div ref={containerRef} className="relative h-[600vh] w-full">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-background">

        {/* ── Background Fluid Mesh with Animated Mask ── 
            Strict inset-0 sizing to guarantee the intricate 3D ribbons stay centered, 
            matching the exact high-fidelity rendering of the top Hero page.
            The parent div applies a permanent vertical fade so the fluid NEVER forms a sharp cut 
            when the section ends, perfectly integrating with the rest of the page.
        */}
        <div className="absolute inset-0 z-10 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]">
          <motion.div
            style={fluidMaskStyle}
            className="absolute inset-0 w-full h-full"
          >
            {/* The Ultimate Master Primitive: 
                Guarantees 100% exact rendering (colors, scale, integration) anywhere in the app 
            */}
            <AppleFluidBackground />
          </motion.div>
        </div>

        {/* ── Act I: Guarda Oltre ── */}
        <motion.div
          style={act1Style}
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

        {/* ── Act II: The Processing Phase ── */}
        <motion.div
          style={act2Style}
          className="absolute z-30 flex flex-col items-center text-center pointer-events-none px-6"
        >
          <h3 className="text-3xl font-bold tracking-tight text-foreground/90 sm:text-5xl lg:text-6xl drop-shadow-xl max-w-3xl">
            Processa le tue abitudini.<br />
            <span className="text-muted-foreground">Proietta il tuo potenziale.</span>
          </h3>
        </motion.div>

        {/* ── Act III: The Promise ── */}
        <motion.div
          style={act3Style}
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
