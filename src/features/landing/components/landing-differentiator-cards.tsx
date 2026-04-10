"use client"

import { useRef } from "react"
import { m, useInView } from "framer-motion"
import { cn } from "@/lib/utils"
import { useHardwareParallax } from "@/hooks/use-hardware-parallax"
import {
  LANDING_DIFFERENCE_SECTION,
  LANDING_DIFFERENTIATORS,
  type LandingDifferentItem
} from "../content"
import { EDITORIAL_ACCENTS } from "./landing-tokens"

function BentoCard({ item, index, isHero }: { item: LandingDifferentItem, index: number, isHero: boolean }) {
  const accent = EDITORIAL_ACCENTS[index]
  const cardRef = useRef<HTMLDivElement>(null)
  const { rotateX, rotateY, backgroundPosition, handleMouseMove, handleMouseLeave } = useHardwareParallax({ tiltMax: isHero ? 8 : 12 })

  const _handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    handleMouseMove(e, cardRef.current.getBoundingClientRect())
  }

  return (
    <m.div
      ref={cardRef}
      onMouseMove={_handleMouseMove}
      onMouseLeave={handleMouseLeave}
      variants={{
        hidden: { opacity: 0, filter: "blur(16px)", y: 30, scale: 0.95 },
        visible: { 
          opacity: 1, filter: "blur(0px)", y: 0, scale: 1,
          transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
        }
      }}
      whileHover={{ scale: 1.015, transition: { type: "spring", stiffness: 600, damping: 30 } }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={cn(
        "group relative overflow-hidden rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between will-change-transform shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)]",
        isHero ? "lg:col-span-2 lg:row-span-2 min-h-[30rem]" : "col-span-1 min-h-[22rem]",
        accent.card
      )}
    >
      {/* Background & Glass Effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_52%)]" />
      <m.div 
        className="pointer-events-none absolute inset-0 z-[1] opacity-40 dark:opacity-20 mix-blend-overlay transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 60%)",
          backgroundSize: "200% 200%",
          backgroundPosition,
        }}
      />
      <div 
        className="pointer-events-none absolute inset-0 z-20 rounded-[2.5rem] overflow-hidden"
        style={{
          padding: "1.5px",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude"
        }}
      >
         <div 
            className="absolute left-1/2 top-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{ background: `conic-gradient(transparent 75%, ${accent.liquid} 100%)` }}
         />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between [transform-style:preserve-3d]">
        <div className="space-y-4" style={{ transform: "translateZ(20px)" }}>
          <div className="flex items-center justify-between">
             <div className="space-y-1">
                <p className={cn("text-[11px] font-semibold uppercase tracking-[0.16em] opacity-80", accent.kicker)}>{item.kicker}</p>
                <div className="flex gap-2 opacity-50 dark:opacity-40 grayscale uppercase text-[9px] font-bold tracking-widest">
                   {item.glimpses.slice(0, 2).map((g: string) => <span key={g}>{g}</span>)}
                </div>
             </div>
             <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] shadow-xl", accent.icon)}>
                <item.icon className="h-5 w-5" />
             </div>
          </div>
        </div>

        <div className="space-y-3 pt-6" style={{ transform: "translateZ(30px)" }}>
           <h3 className={cn("font-black tracking-tight text-foreground drop-shadow-md", isHero ? "text-4xl sm:text-5xl max-w-[12ch]" : "text-3xl max-w-[12ch]")}>
              {item.title}
           </h3>
           <p className={cn("font-normal leading-relaxed text-foreground/80", isHero ? "text-lg max-w-[28ch]" : "text-sm max-w-[22ch]")}>
              {item.numaLabel}
           </p>
        </div>

        {/* Versus box */}
        <div className={cn("mt-auto pt-6 flex gap-3", isHero ? "flex-row" : "flex-col")} style={{ transform: "translateZ(10px)" }}>
           <div className="flex-1 p-3.5 sm:p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
              <p className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground/60 mb-1.5">{item.marketEyebrow}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{item.marketLabel}</p>
           </div>
           {isHero && (
              <div className="flex-1 p-3.5 sm:p-4 rounded-xl bg-black/[0.06] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 relative overflow-hidden backdrop-blur-md">
                 <div className={cn("absolute -right-10 -bottom-10 h-32 w-32 rounded-full blur-3xl opacity-30", accent.glow)} />
                 <p className="relative z-10 text-[9px] sm:text-[10px] uppercase font-bold text-foreground mb-1.5">{item.glimpseEyebrow}</p>
                 <p className="relative z-10 text-[11px] sm:text-xs font-semibold text-foreground/90 leading-relaxed">{item.numaLabel}</p>
              </div>
           )}
        </div>
      </div>
    </m.div>
  )
}

export function LandingDifferentiatorCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-10%" })

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden bg-background px-4 py-24 sm:px-6 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.03),transparent_40%)]" />
      
      <div className="relative mx-auto w-full max-w-6xl">
        <m.div 
           initial={{ opacity: 0, y: 20 }}
           animate={isInView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="mb-12 flex flex-col items-center text-center sm:mb-16"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
            {LANDING_DIFFERENCE_SECTION.eyebrow}
          </p>
          <h2 className="mx-auto mt-4 max-w-fit text-4xl font-black leading-[0.96] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {LANDING_DIFFERENCE_SECTION.title}
          </h2>
        </m.div>

        <m.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 [perspective:1400px]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={{
            hidden: {},
            visible: { transition: { delayChildren: 0.1, staggerChildren: 0.1 } }
          }}
        >
          {LANDING_DIFFERENTIATORS.map((item, index) => (
            <BentoCard key={item.title} item={item} index={index} isHero={index === 0} />
          ))}
        </m.div>
      </div>
    </div>
  )
}
