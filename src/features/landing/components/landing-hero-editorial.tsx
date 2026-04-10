"use client"

import { useRef } from "react"
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { BrandLogo } from "@/components/ui/brand-logo"
import { cn } from "@/lib/utils"
import { LANDING_HERO_EDITORIAL } from "../content"
import { AppleFluidBackground } from "./motion-primitives"
import { LandingCoverFlow } from "./landing-cover-flow"

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
      <div className="relative z-30 mx-auto flex w-full max-w-[56rem] flex-col items-center text-center">
        
        {/* Gruppo Testuale: Svanisce scrollando giù */}
        <m.div className="flex flex-col items-center text-center" style={{ opacity: yOpacity, y: yTranslate }}>
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
        </m.div>

        {/* Dark Cover Flow Mockups - NON Svanisce on scroll */}
        <div className="w-full">
          <LandingCoverFlow />
        </div>

        {/* Trus Bar / Social Proof Istituzionale Above-The-Fold */}
        <m.div
          className="pointer-events-none mt-16 flex flex-col items-center gap-4 sm:mt-24 lg:mt-32"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.8 }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/30 dark:text-white/30">
            Architettura blindata a zero-conoscenza
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-40 dark:opacity-30 grayscale saturate-0 [filter:contrast(1.2)]">
            <span className="flex items-center gap-2 text-[12.5px] font-medium tracking-tight text-foreground">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Local-First 100%
            </span>
            <span className="flex items-center gap-2 text-[12.5px] font-medium tracking-tight text-foreground">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" /></svg>
              Apple Neural Engine
            </span>
            <span className="flex items-center gap-2 text-[12.5px] font-medium tracking-tight text-foreground">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              Zero Cloud Tracking
            </span>
          </div>
        </m.div>

      </div>
    </section>
  )
}

