"use client"

import { useRef } from "react"
import { m } from "framer-motion"
import { useHardwareParallax } from "@/hooks/use-hardware-parallax"
import { LANDING_STORY_POINTS } from "../content"
import { LANDING_EDITORIAL_CARD_TITLE_CLASS } from "./landing-tokens"
import { LandingEditorialCardFrame } from "./landing-editorial-card-frame"

const STORY_ACCENTS = [
  {
    border: "border-cyan-400/20 dark:border-white/10",
    panel: "from-cyan-500/[0.02] via-white to-cyan-50/50 dark:from-white/[0.06] dark:via-black/84 dark:to-zinc-900/62",
    icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100"
  },
  {
    border: "border-slate-400/18 dark:border-white/9",
    panel: "from-slate-500/[0.03] via-white to-slate-50/60 dark:from-white/[0.05] dark:via-black/84 dark:to-zinc-950/68",
    icon: "border-slate-400/25 bg-slate-500/8 text-slate-700 dark:border-white/9 dark:bg-white/[0.045] dark:text-zinc-200"
  },
  {
    border: "border-teal-400/20 dark:border-white/10",
    panel: "from-teal-500/[0.02] via-white to-teal-50/50 dark:from-white/[0.055] dark:via-black/84 dark:to-stone-950/64",
    icon: "border-teal-400/25 bg-teal-500/10 text-teal-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-200"
  }
] as const

function ConsoleChassis() {
  const cardRef = useRef<HTMLDivElement>(null)
  const { rotateX, rotateY, backgroundPosition, handleMouseMove, handleMouseLeave } = useHardwareParallax({ tiltMax: 6 })

  const _handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    handleMouseMove(e, cardRef.current.getBoundingClientRect())
  }

  return (
    <m.div
      ref={cardRef}
      onMouseMove={_handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/50 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.14)] backdrop-blur-3xl dark:border-white/10 dark:bg-zinc-950/40 dark:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)] will-change-transform bg-clip-padding"
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] z-[1]" />
      
      <m.div 
        className="pointer-events-none absolute inset-0 z-[2] opacity-40 dark:opacity-15 mix-blend-overlay transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle at center, rgba(255,255,255,1) 0%, transparent 60%)",
          backgroundSize: "200% 200%",
          backgroundPosition
        }}
      />

      <div className="relative z-10 p-6 sm:p-8 sm:py-8 flex flex-col [transform-style:preserve-3d] min-h-[16rem]">
        {/* Fake Window Controls */}
        <div className="mb-6 flex items-center gap-1.5" style={{ transform: "translateZ(10px)" }}>
          <div className="h-3 w-3 rounded-full bg-red-400 dark:bg-red-500/80 shadow-sm" />
          <div className="h-3 w-3 rounded-full bg-amber-400 dark:bg-amber-500/80 shadow-sm" />
          <div className="h-3 w-3 rounded-full bg-emerald-400 dark:bg-emerald-500/80 shadow-sm" />
        </div>

        {/* Mock Dashboard Area */}
        <div className="flex-1 space-y-6 sm:space-y-8" style={{ transform: "translateZ(30px)" }}>
          {/* Top Section - Key Metric */}
          <div className="space-y-1">
            <h4 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.15em] text-muted-foreground/80 uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              Margine Sostenibile
            </h4>
            <div className="flex items-baseline gap-2 tracking-tighter pt-1">
              <span className="text-5xl sm:text-[4rem] font-black leading-none text-foreground">€ 1.250</span>
              <span className="text-xl sm:text-2xl font-bold text-muted-foreground/60 leading-none">,00</span>
            </div>
            
            {/* Fake Progress Bar */}
            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10 sm:max-w-xs">
              <div className="h-full w-2/3 rounded-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.5)] dark:bg-teal-400 dark:shadow-[0_0_12px_rgba(45,212,191,0.6)]" />
            </div>
          </div>

          {/* Bottom Section - Fake Transaction Rows */}
          <m.div 
            className="space-y-3 relative p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-5%" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
            }}
          >
            {[1, 2, 3].map((i) => (
              <m.div 
                key={i} 
                variants={{
                  hidden: { opacity: 0, filter: "blur(8px)", x: -12 },
                  visible: { opacity: 1, filter: "blur(0px)", x: 0, transition: { type: "spring", stiffness: 450, damping: 25 } }
                }}
                className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-black/5 to-black/10 dark:from-white/5 dark:to-white/10" />
                  <div className="space-y-2 w-28">
                    <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/15" />
                    <div className={`h-1.5 w-${i === 1 ? '16' : i === 2 ? '12' : '20'} rounded-full bg-black/5 dark:bg-white/10`} />
                  </div>
                </div>
                <div className={`h-2.5 w-${i === 1 ? '10' : i === 2 ? '8' : '12'} rounded-full bg-black/10 dark:bg-white/15`} />
              </m.div>
            ))}
          </m.div>
        </div>
      </div>
    </m.div>
  )
}

export function LandingHeroConsole() {
  return (
    <div className="space-y-6 sm:space-y-7 [perspective:1200px]">
      <div className="space-y-4">
        {LANDING_STORY_POINTS.map((point, index) => {
          const accent = STORY_ACCENTS[index]

          return (
            <LandingEditorialCardFrame
              key={point.title}
              borderClassName={accent.border}
              panelClassName={accent.panel}
              leadingIconWrapperClassName={accent.icon}
              leadingText={String(index + 1).padStart(2, "0")}
              leadingTextClassName="text-current"
              decorativeIcon={point.icon}
              decorativeIconPositionClassName="-bottom-[8%] right-[3%]"
              className="shadow-[0_30px_90px_-40px_rgba(15,23,42,0.16)] dark:shadow-[0_30px_90px_-40px_rgba(0,0,0,0.5)]"
              contentClassName="p-8 sm:p-10"
            >
              <div className="relative space-y-3 pr-12 pt-18 sm:pr-20 sm:pt-24 lg:pr-28 lg:pt-28">
                <p className={`${LANDING_EDITORIAL_CARD_TITLE_CLASS} whitespace-nowrap [font-size:clamp(1.15rem,2.8vw,3rem)]`}>
                  {point.title}
                </p>
                <p className="max-w-[56ch] text-[16px] font-normal leading-relaxed text-muted-foreground sm:text-[17px]">
                  {point.description}
                </p>
              </div>
            </LandingEditorialCardFrame>
          )
        })}
      </div>

      <ConsoleChassis />
    </div>
  )
}
