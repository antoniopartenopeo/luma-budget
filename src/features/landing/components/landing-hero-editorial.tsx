"use client"

import { useRef, useState, useEffect } from "react"
import { m, useReducedMotion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { BrandLogo } from "@/components/ui/brand-logo"
import { cn } from "@/lib/utils"
import { LANDING_HERO_EDITORIAL } from "../content"
import { AppleFluidBackground } from "./motion-primitives"

// Nuovo componente "Dynamic Island" per ciclare le feature senza ingombrare la UI
function DynamicFeatureCapsule({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LANDING_HERO_EDITORIAL.panels.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [])

  const currentPanel = LANDING_HERO_EDITORIAL.panels[currentIndex]
  const Icon = currentPanel.icon

  return (
    <div className="relative mt-12 flex justify-center sm:mt-16">
      <m.div
        layout
        transition={
          prefersReducedMotion ? undefined : { type: "spring", stiffness: 300, damping: 28, mass: 1 }
        }
        className="flex items-center gap-3 overflow-hidden rounded-full bg-black/4 border border-black/8 px-4 py-2.5 shadow-[inset_0_1px_4px_rgba(255,255,255,0.4)] backdrop-blur-xl dark:bg-white-[0.03] dark:border-white/[0.08] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),_0_8px_32px_-12px_rgba(0,0,0,0.5)] sm:px-5 sm:py-3"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <m.div
            key={`icon-${currentIndex}`}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: -20 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="flex-shrink-0 text-foreground/80 dark:text-white/80"
          >
            <Icon strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5" />
          </m.div>
        </AnimatePresence>

        <AnimatePresence mode="popLayout" initial={false}>
          <m.p
            key={`text-${currentIndex}`}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)", x: -8 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)", x: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="whitespace-nowrap text-xs font-semibold leading-none tracking-wide text-foreground/90 dark:text-white/90 sm:text-sm"
          >
            {currentPanel.title}
          </m.p>
        </AnimatePresence>
      </m.div>
    </div>
  )
}

export function LandingHeroEditorial() {
  const sectionRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  })

  const yOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const yTranslate = useTransform(scrollYProgress, [0, 1], [0, 60])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] w-full flex-col items-center overflow-visible px-4 pt-[18vh] sm:px-6 sm:pt-[20vh] lg:px-8 lg:pt-[22vh]"
      aria-labelledby="landing-hero-title"
      data-testid="landing-hero-editorial"
    >
      {/* Background Sfumato che copre l'intero viewport dall'alto (Y=0) */}
      <div className="pointer-events-none absolute inset-0 z-0 [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]">
        <AppleFluidBackground className="scale-[1.08] sm:scale-[1.04]" />
      </div>

      {/* Layer gradient per migliorare il contrasto con i testi scuri/chiari */}
      <div className="pointer-events-none absolute inset-0 z-[1] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_32%)]" />

      {/* Luce zenitale per dare un forte effetto "Apple" / "Vercel" centrato */}
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[5%] z-[2] -translate-x-1/2 h-[30rem] w-[50rem] rounded-[100%] bg-white/40 blur-[120px] dark:bg-cyan-500/10 sm:h-[40rem] sm:w-[70rem]"
        style={{ opacity: yOpacity }}
      />

      {/* Core Layout: Centrato, minimale, estremo */}
      <m.div 
        className="relative z-30 mx-auto flex w-full max-w-[56rem] flex-col items-center text-center"
        style={{ opacity: yOpacity, y: yTranslate }}
      >
        <h1 id="landing-hero-title" className="sr-only">
          {LANDING_HERO_EDITORIAL.srTitle}
        </h1>

        {/* Smart Logo: solo il mark sopra il testo */}
        <m.div 
          className="pointer-events-none mb-6 sm:mb-8"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <BrandLogo
            variant="smart"
            width={160}
            className="h-auto w-[5rem] opacity-80 mix-blend-multiply dark:opacity-90 dark:mix-blend-screen sm:w-[6.5rem] lg:w-[8rem]"
          />
        </m.div>

        {/* Tipografia Massiccia */}
        <m.p 
          className="max-w-[14ch] text-[clamp(2.75rem,8vw,6.5rem)] font-black leading-[0.95] tracking-tight text-foreground/95 [text-wrap:balance]"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          {LANDING_HERO_EDITORIAL.headline}
        </m.p>

        <m.p 
          className="mt-6 max-w-[22rem] text-[1.05rem] font-medium leading-[1.5] tracking-[-0.01em] text-foreground/60 sm:max-w-[34rem] sm:text-[1.25rem] lg:max-w-[40rem] lg:text-[1.35rem]"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          {LANDING_HERO_EDITORIAL.supportingCopy}
        </m.p>

        {/* Dynamic Capsule per scorrere tra le feature senza impattare sul layout */}
        <m.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        >
          <DynamicFeatureCapsule prefersReducedMotion={prefersReducedMotion} />
        </m.div>
      </m.div>
    </section>
  )
}

