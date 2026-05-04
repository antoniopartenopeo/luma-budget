"use client"

import { useRef } from "react"
import { m, useReducedMotion, useScroll, useTransform, useSpring } from "framer-motion"
import { BrainCircuit, Zap, Activity } from "lucide-react"
import { useDeviceHardware } from "@/hooks/use-device-hardware"
import {
  LANDING_DIFFERENCE_SECTION,
  LANDING_DIFFERENTIATORS
} from "../content"

const GridPattern = () => (
  <svg className="absolute inset-0 h-full w-full opacity-[0.04] dark:opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="neural-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M0 40V0H40" fill="none" stroke="currentColor" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#neural-grid)" />
  </svg>
)

export function LandingDifferentiatorCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion() ?? false
  const { safeToAnimate3D } = useDeviceHardware()
  const shouldReduceVisualEffects = prefersReducedMotion || !safeToAnimate3D

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  })

  // Cinematic Spring for the scroll actions
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    restDelta: 0.001
  })

  // Chart path reveal tied to scroll
  const predictionDraw = useTransform(smoothProgress, [0.3, 0.8], [0, 1])
  
  // Opacities for the timeline nodes
  const node1Opacity = useTransform(smoothProgress, [0.1, 0.3], [0, 1])
  const node1Scale = useTransform(smoothProgress, [0.1, 0.3], [0.8, 1])
  const node2Opacity = useTransform(smoothProgress, [0.3, 0.5], [0, 1])
  const node2Scale = useTransform(smoothProgress, [0.3, 0.5], [0.8, 1])
  const node3Opacity = useTransform(smoothProgress, [0.6, 0.8], [0, 1])
  const node3Scale = useTransform(smoothProgress, [0.6, 0.8], [0.8, 1])

  // Parallax shifts for depth
  const chartY = useTransform(smoothProgress, [0, 1], shouldReduceVisualEffects ? [32, -12] : [100, -50])
  const backgroundY = useTransform(smoothProgress, [0, 1], shouldReduceVisualEffects ? [0, 32] : [0, 150])
  const glowFilter = shouldReduceVisualEffects ? undefined : "url(#neon-blur)"

  return (
    <div ref={containerRef} className="relative min-h-[220svh] w-full bg-background selection:bg-cyan-500/20">
      
      {/* Scroll-sticky wrapper */}
      <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center overflow-hidden bg-background pt-24 md:pt-32">
        
        {/* Deep ambient background grid mapped to subtle parallax */}
        <m.div style={{ y: backgroundY }} className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]">
           <GridPattern />
        </m.div>

        {/* Cinematic Title Layer */}
        <div className="relative z-30 flex flex-col items-center text-center px-6 shrink-0">
          <p className="mb-4 md:mb-6 text-[11px] md:text-[13px] font-bold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400 drop-shadow-sm dark:drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
            {LANDING_DIFFERENCE_SECTION.eyebrow}
          </p>
          <h2 className="mx-auto max-w-[16ch] text-balance text-center [font-size:clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.92] tracking-tighter text-foreground drop-shadow-sm dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-white/60">
            {LANDING_DIFFERENCE_SECTION.title}
          </h2>
        </div>

        {/* The Massive Vector Chart Scene */}
        <m.div 
          style={{ y: chartY }}
          className="relative mt-auto mb-20 aspect-[1000/350] w-[calc(100%-2rem)] max-w-[32rem] md:mb-10 md:w-full md:max-w-[1200px] z-20 pointer-events-none"
        >
          
          {/* SVG Baseline and Graphs */}
          <svg viewBox="0 0 1000 350" className="absolute inset-0 h-full w-full drop-shadow-xl overflow-visible md:drop-shadow-2xl">
            <defs>
               <linearGradient id="glow-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="rgba(34,211,238,0.1)" />
                 <stop offset="50%" stopColor="rgba(34,211,238,0.9)" />
                 <stop offset="100%" stopColor="rgba(16,185,129,0.9)" />
               </linearGradient>

               <linearGradient id="fade-cyan" x1="0%" y1="0%" x2="0%" y2="100%">
                 <stop offset="0%" stopColor="rgba(34,211,238,0.2)" />
                 <stop offset="100%" stopColor="rgba(34,211,238,0.0)" />
               </linearGradient>

               <filter id="neon-blur" x="-50%" y="-50%" width="200%" height="200%">
                 <feGaussianBlur stdDeviation="8" result="blur" />
                 <feMerge>
                   <feMergeNode in="blur" />
                   <feMergeNode in="SourceGraphic" />
                 </feMerge>
               </filter>
            </defs>

            {/* Past Solid Timeline (Certainty) */}
            <path
              d="M 0 120 C 150 130, 250 250, 350 230 C 450 210, 500 290, 600 260"
              fill="none"
              stroke="currentColor"
              className="text-slate-300 dark:text-zinc-700"
              strokeWidth="3"
            />
            <path
              d="M 0 120 C 150 130, 250 250, 350 230 C 450 210, 500 290, 600 260 L 600 350 L 0 350 Z"
              fill="currentColor"
              className="text-slate-100 dark:text-zinc-900/40"
              opacity="0.3"
            />

            {/* Future Predictive Timeline (Insight Engine) */}
            <m.path
              d="M 600 260 C 700 220, 750 150, 850 190 C 920 220, 950 120, 1000 90"
              fill="none"
              stroke="url(#glow-cyan)"
              strokeWidth="5"
              strokeDasharray="12 12"
              strokeLinecap="round"
              filter={glowFilter}
              style={{ pathLength: predictionDraw }}
            />
            {/* Soft glow fill under the prediction line */}
            <m.path
              d="M 600 260 C 700 220, 750 150, 850 190 C 920 220, 950 120, 1000 90 L 1000 350 L 600 350 Z"
              fill="url(#fade-cyan)"
              style={{ opacity: predictionDraw }}
            />

            {/* Data Nodes Graphics */}
            <circle cx="200" cy="195" r="4" className="fill-slate-400 dark:fill-zinc-600" />
            <circle cx="350" cy="230" r="5" className="fill-slate-500 dark:fill-zinc-500" />
            <circle cx="480" cy="260" r="4" className="fill-slate-400 dark:fill-zinc-600" />
            
            {/* The "Oggi" Anchor Orb */}
            <circle cx="600" cy="260" r="10" className="fill-cyan-500 dark:fill-cyan-400" filter={glowFilter} />
            <circle cx="600" cy="260" r="4" className="fill-white" />

            {/* The "Target Margin" Anchor Orb */}
            <m.circle 
              cx="1000" cy="90" r="12" 
              className="fill-emerald-400" 
              filter={glowFilter}
              style={{ opacity: predictionDraw, scale: predictionDraw }}
            />
            <m.circle 
              cx="1000" cy="90" r="5" 
              className="fill-white" 
              style={{ opacity: predictionDraw }}
            />
          </svg>

          {/* HTML Overlay for Rich Holographic Panels mapped to exact SVG coordinates */}
          {/* Note: absolute positioning via % works perfectly because the wrapper has the same aspect ratio as the SVG viewBox */}
          
          {/* Node 1: Historical Base */}
          <m.div
            style={{ opacity: node1Opacity, scale: node1Scale }}
            className="absolute left-[35%] top-[65.7%] -translate-x-1/2 -translate-y-full pb-4"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-2xl border border-slate-200/50 bg-slate-50/80 p-3 shadow-xl backdrop-blur-md transition-[background-color,border-color,box-shadow] dark:border-white/10 dark:bg-black/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200/50 dark:bg-white/10 text-slate-600 dark:text-zinc-300">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-400">
                      {LANDING_DIFFERENTIATORS[0].kicker}
                    </p>
                    <p className="max-w-[20ch] text-xs font-semibold leading-tight text-foreground dark:text-white mt-0.5">
                      {LANDING_DIFFERENTIATORS[0].title}
                    </p>
                  </div>
                </div>
              </div>
              {/* Connecting line */}
              <div className="h-6 w-px bg-slate-300 dark:bg-zinc-700" />
            </div>
          </m.div>

          {/* Node 2: Present Orchestration ("Oggi") */}
          {/* SVG cy="260" / 350 = 74.28% */}
          <m.div
            style={{ opacity: node2Opacity, scale: node2Scale }}
            className="absolute left-[60%] top-[74.28%] -translate-x-1/2 translate-y-3 pt-3"
          >
            <div className="relative">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-50/90 dark:border-cyan-400/20 dark:bg-cyan-950/60 p-3 backdrop-blur-md shadow-[0_16px_40px_-12px_rgba(34,211,238,0.2)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/20 text-cyan-700 dark:text-cyan-300">
                    <BrainCircuit className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-600 dark:text-cyan-400">
                      Oggi
                    </p>
                    <p className="max-w-[20ch] text-xs font-semibold leading-tight text-cyan-950 dark:text-white mt-0.5">
                      {LANDING_DIFFERENTIATORS[1].title}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </m.div>

          {/* Node 3: Predictive Future */}
          {/* SVG cx="1000" / 1000 = 100% | cy="90" / 350 = 25.71% */}
          <m.div
            style={{ opacity: node3Opacity, scale: node3Scale }}
            className="absolute left-[92%] top-[25.71%] -translate-x-full -translate-y-full pb-4 sm:left-full sm:-translate-x-1/2"
          >
            <div className="flex flex-col items-center sm:items-center items-end gap-2 pr-6 sm:pr-0">
              <div className="rounded-[1.35rem] border border-emerald-400/20 bg-emerald-50/90 dark:border-emerald-400/20 dark:bg-emerald-950/60 p-4 backdrop-blur-md shadow-[0_20px_50px_-12px_rgba(16,185,129,0.3)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-emerald-400/30 bg-emerald-400/20 text-emerald-700 dark:text-emerald-300">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                      Margine di fine mese
                    </p>
                    <p className="max-w-[22ch] text-[13px] font-semibold leading-tight text-emerald-950 dark:text-emerald-50 mt-1">
                      {LANDING_DIFFERENTIATORS[2].title}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-emerald-800/70 dark:text-emerald-200/60 leading-relaxed font-medium">
                  {LANDING_DIFFERENTIATORS[2].note}
                </div>
              </div>
              {/* Glowing connecting line */}
              <div className="h-8 w-px bg-gradient-to-b from-emerald-400/60 to-transparent mr-6 sm:mr-0" />
            </div>
          </m.div>

        </m.div>
      </div>
    </div>
  )
}
