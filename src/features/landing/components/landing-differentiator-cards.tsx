"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, m, useScroll, useInView } from "framer-motion"
import { useHardwareParallax } from "@/hooks/use-hardware-parallax"
import { cn } from "@/lib/utils"
import {
  LANDING_DIFFERENCE_SECTION,
  LANDING_DIFFERENTIATORS,
  type LandingDifferentItem
} from "../content"
import { LANDING_MOTION_EASE, LANDING_MOTION_TIMINGS } from "./landing-motion"
import { EDITORIAL_ACCENTS } from "./landing-tokens"



function MaskedRevealTitle({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px -20% 0px" })
  
  const words = text.split(" ")

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  }

  const item = {
    hidden: { y: "130%", filter: "blur(12px)", opacity: 0 },
    show: {
      y: "0%",
      filter: "blur(0px)",
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  return (
    <m.h2
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      className={cn("flex flex-wrap items-center justify-center gap-x-[0.25em]", className)}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-4 -mb-4 px-1 -mx-1">
          <m.span variants={item} className="inline-block will-change-transform">
            {word}
          </m.span>
        </span>
      ))}
    </m.h2>
  )
}

function MarketGhostLayer({
  item,
}: {
  item: LandingDifferentItem
}) {
  return (
    <m.div
      key={`market-${item.title}`}
      initial={{ opacity: 0, scale: 0.96, y: 32 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -24 }}
      transition={LANDING_MOTION_TIMINGS.medium}
      className="absolute inset-0"
      aria-hidden="true"
    >
      <div className="absolute right-[-4%] top-[-2%] h-[38%] w-[72%] rotate-[6deg] scale-[0.9] rounded-[2.4rem] border border-black/5 bg-neutral-200/50 p-5 shadow-2xl backdrop-blur-md blur-[3px] dark:border-white/5 dark:bg-neutral-800/40 sm:h-[42%] sm:w-[68%] sm:p-7 sm:right-[0%] sm:top-[2%] lg:p-9 xl:p-10 transition-all duration-700 ease-out">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 lg:text-[11px] xl:text-[12px]">
          {item.marketEyebrow}
        </p>
        <p className="mt-3 max-w-[22ch] text-lg font-medium leading-[1.2] text-neutral-500 dark:text-neutral-400 sm:text-xl lg:text-2xl xl:mt-5 xl:text-3xl">
          {item.marketLabel}
        </p>
      </div>

      <div className="absolute bottom-[2%] left-[-4%] w-[68%] -rotate-[4deg] scale-[0.95] rounded-[2rem] border border-black/5 bg-white/60 p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] backdrop-blur-xl blur-[1px] dark:border-white/5 dark:bg-neutral-900/50 sm:w-[60%] sm:p-6 lg:p-8 xl:p-9 sm:bottom-[6%] sm:left-[2%] transition-all duration-700 ease-out">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 lg:text-[11px] xl:text-[12px]">
          {item.glimpseEyebrow}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 lg:mt-6 lg:gap-3">
          {item.glimpses.map((label) => (
            <span
              key={label}
              className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-neutral-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300 lg:px-4 lg:py-2 lg:text-[12px]"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </m.div>
  )
}

function NumaEditorialCard({
  item,
  index,
  parallaxState
}: {
  item: LandingDifferentItem
  index: number
  parallaxState: {
    rotateX: any
    rotateY: any
    backgroundPosition: any
    isHovered: boolean
  }
}) {
  const accent = EDITORIAL_ACCENTS[index]

  const { rotateX, rotateY, backgroundPosition, isHovered } = parallaxState

  return (
    <m.div
      key={`numa-${item.title}`}
      initial={{ opacity: 0, y: 36, rotate: -10, scale: 0.94 }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: -7,
        scale: 1,
        transition: LANDING_MOTION_TIMINGS.slow
      }}
      exit={{
        opacity: 0,
        y: -24,
        rotate: -3,
        scale: 1.03,
        transition: LANDING_MOTION_TIMINGS.fast
      }}
      className="absolute inset-x-[6%] top-[11%] bottom-[13%] will-change-transform sm:inset-x-[9%] sm:top-[10%] sm:bottom-[12%] lg:inset-x-[8%] lg:top-[9%] lg:bottom-[10%]"
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
    >
      {/*... LAYER 1 ...*/}
      <div
        className={cn(
          "absolute inset-0 overflow-hidden rounded-[2.7rem] shadow-[0_44px_120px_-50px_rgba(15,23,42,0.55)]",
          accent.card
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_52%)]" />
        <m.div 
          className="pointer-events-none absolute inset-0 z-50 opacity-40 dark:opacity-20 mix-blend-overlay transition-opacity duration-500"
          style={{
            background: "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 60%)",
            backgroundSize: "200% 200%",
            backgroundPosition,
            transform: "translateZ(-30px)"
          }}
        />
      </div>

      {/* LAYER 2: LIQUID EDGE */}
      <div 
        className="pointer-events-none absolute inset-0 z-20 rounded-[2.7rem] overflow-hidden"
        style={{
          padding: "1.5px",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          transform: "translateZ(0px)"
        }}
      >
         <m.div 
            className="absolute left-1/2 top-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{ background: `conic-gradient(transparent 75%, ${accent.liquid} 100%)` }}
         />
      </div>

      {/* LAYER 3: EXTREME 3D INTERNAL Z-DEPTH */}
      <div className="@container/landing-card relative flex h-full min-h-0 flex-col justify-between p-6 sm:p-7 lg:p-8 [transform-style:preserve-3d]">
        <m.div className="flex flex-col gap-4" style={{ transformStyle: "preserve-3d" }} animate={{ z: isHovered ? 100 : 20 }} transition={LANDING_MOTION_TIMINGS.medium}>
          <div className="space-y-4 lg:space-y-6 [transform-style:preserve-3d]">
            <m.div animate={{ z: isHovered ? 40 : 10 }} transition={LANDING_MOTION_TIMINGS.medium} className="space-y-2">
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.16em] drop-shadow-lg sm:text-[12px] lg:text-[13px] xl:text-[14px]", accent.kicker)}>
                {item.kicker}
              </p>
            </m.div>

            <m.div
              animate={{ z: isHovered ? 80 : 15 }} transition={LANDING_MOTION_TIMINGS.medium}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-[1rem] border shadow-[0_25px_50px_-12px_rgba(15,23,42,0.65)] sm:h-12 sm:w-12 lg:h-16 lg:w-16 lg:rounded-[1.4rem]",
                accent.icon
              )}
            >
              <item.icon className="h-4 w-4 drop-shadow-xl sm:h-5 sm:w-5 lg:h-7 lg:w-7" />
            </m.div>

            <m.div animate={{ z: isHovered ? 160 : 20 }} transition={LANDING_MOTION_TIMINGS.medium} style={{ transformStyle: "preserve-3d" }} className="space-y-3 lg:space-y-4 xl:space-y-5">
              <h2
                id={`landing-different-title-${index}`}
                className="max-w-[14ch] break-words text-balance font-black tracking-[-0.04em] leading-[0.92] text-foreground drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_35px_35px_rgba(0,0,0,0.9)] [font-size:clamp(2.2rem,11cqw,5.5rem)] [overflow-wrap:anywhere]"
              >
                {item.title}
              </h2>
              <p className="max-w-[34ch] font-normal leading-relaxed text-foreground/78 drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)] [font-size:clamp(1rem,4cqw,1.28rem)]">
                {item.numaLabel}
              </p>
            </m.div>
          </div>
        </m.div>

        <m.div animate={{ z: isHovered ? 60 : 10 }} transition={LANDING_MOTION_TIMINGS.medium} className="space-y-3 lg:space-y-4">
          <div className="h-px w-16 bg-foreground/30 drop-shadow-md lg:w-24 xl:w-32" />
          <p className="max-w-[32ch] text-[13px] font-normal leading-relaxed text-foreground/80 drop-shadow-md [font-size:clamp(0.85rem,3.2cqw,1.02rem)]">
            {item.note}
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            {LANDING_DIFFERENTIATORS.map((entry, dotIndex) => (
              <span
                key={entry.title}
                className={cn(
                  "h-1.5 rounded-full transition-[width,background-color] duration-300",
                  dotIndex === index ? "w-10 bg-foreground/78" : "w-4 bg-foreground/12"
                )}
              />
            ))}
          </div>
        </m.div>
      </div>
    </m.div>
  )
}

export function LandingDifferentiatorCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  
  const parallaxState = useHardwareParallax({ tiltMax: 15 })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  useEffect(() => {
    return scrollYProgress.on("change", (value) => {
      const total = LANDING_DIFFERENTIATORS.length
      const clamped = Math.max(0, Math.min(value, 0.9999))
      const nextIndex = Math.min(Math.floor(clamped * total), total - 1)
      setActiveIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex))
    })
  }, [scrollYProgress])

  const activeItem = LANDING_DIFFERENTIATORS[activeIndex]
  const accent = EDITORIAL_ACCENTS[activeIndex]

  return (
    <div ref={containerRef} className="relative h-[300vh] w-full">
      <div 
        className="sticky top-0 flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6"
        onMouseEnter={parallaxState.handleMouseEnter}
        onMouseLeave={parallaxState.handleMouseLeave}
        onMouseMove={(e) => parallaxState.handleMouseMove(e, e.currentTarget.getBoundingClientRect())}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-b",
            accent.ambient
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),transparent_38%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),transparent_40%)]" />
        <m.div
          className={cn("pointer-events-none absolute left-1/2 top-[14%] h-64 w-64 -translate-x-1/2 rounded-full blur-3xl sm:h-80 sm:w-80", accent.glow)}
          animate={{ opacity: [0.4, 0.7, 0.45], scale: [0.96, 1.08, 0.98] }}
          transition={{ duration: 8, repeat: Infinity, ease: LANDING_MOTION_EASE }}
          aria-hidden="true"
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center">
          <div className="relative z-10 mb-8 flex w-full flex-col items-center text-center sm:mb-12 lg:mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-500 dark:text-foreground/58 dark:drop-shadow-none drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] sm:text-[12px]">
              {LANDING_DIFFERENCE_SECTION.eyebrow}
            </p>
            <MaskedRevealTitle
              text={LANDING_DIFFERENCE_SECTION.title}
              className="mx-auto mt-5 max-w-fit text-center text-3xl font-black leading-[0.96] tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl xl:whitespace-nowrap"
            />
          </div>

          <div className="relative mx-auto h-[min(82vh,48rem)] w-full max-w-[32rem] sm:h-[min(85vh,54rem)] sm:max-w-[42rem] lg:max-w-[54rem] xl:h-[min(85vh,64rem)] xl:max-w-[64rem] [perspective:1400px]">
            <AnimatePresence mode="wait">
              <MarketGhostLayer
                key={`ghost-${activeItem.title}`}
                item={activeItem}
              />
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <NumaEditorialCard
                key={`editorial-${activeItem.title}`}
                item={activeItem}
                index={activeIndex}
                parallaxState={parallaxState}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
