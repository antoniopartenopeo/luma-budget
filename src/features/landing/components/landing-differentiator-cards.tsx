"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useScroll, useMotionValue, useSpring, useTransform, useMotionTemplate, useInView } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  LANDING_DIFFERENCE_SECTION,
  LANDING_DIFFERENTIATORS,
  type LandingDifferentItem
} from "../content"
import { LANDING_MOTION_EASE, LANDING_MOTION_TIMINGS } from "./landing-motion"

const EDITORIAL_ACCENTS = [
  {
    ambient: "from-cyan-500/15 via-background to-background dark:from-white/[0.05] dark:via-background/88 dark:to-background",
    glow: "bg-cyan-500/30 dark:bg-white/12",
    liquid: "rgba(34,211,238,0.8)",
    card: "border-transparent bg-gradient-to-br from-cyan-500/[0.02] via-white to-cyan-50/50 dark:from-white/[0.07] dark:via-black/84 dark:to-zinc-900/[0.56] dark:backdrop-blur-3xl",
    kicker: "text-cyan-700 dark:text-white/62 dark:drop-shadow-none drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]",
    icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100"
  },
  {
    ambient: "from-teal-500/14 via-background to-background dark:from-white/[0.045] dark:via-background/88 dark:to-background",
    glow: "bg-teal-500/26 dark:bg-white/11",
    liquid: "rgba(45,212,191,0.8)",
    card: "border-transparent bg-gradient-to-br from-teal-500/[0.02] via-white to-teal-50/50 dark:from-white/[0.06] dark:via-black/84 dark:to-zinc-950/[0.58] dark:backdrop-blur-3xl",
    kicker: "text-teal-700 dark:text-white/58 dark:drop-shadow-none drop-shadow-[0_0_8px_rgba(45,212,191,0.22)]",
    icon: "border-teal-400/25 bg-teal-500/10 text-teal-700 dark:border-white/9 dark:bg-white/[0.045] dark:text-zinc-200"
  },
  {
    ambient: "from-slate-500/12 via-background to-background dark:from-white/[0.04] dark:via-background/88 dark:to-background",
    glow: "bg-slate-500/22 dark:bg-white/10",
    liquid: "rgba(255,255,255,0.6)",
    card: "border-transparent bg-gradient-to-br from-slate-500/[0.03] via-white to-slate-50/60 dark:from-white/[0.055] dark:via-black/84 dark:to-stone-950/[0.52] dark:backdrop-blur-3xl",
    kicker: "text-slate-700 dark:text-white/56 dark:drop-shadow-none drop-shadow-[0_0_8px_rgba(148,163,184,0.18)]",
    icon: "border-slate-400/25 bg-slate-500/8 text-slate-700 dark:border-white/9 dark:bg-white/[0.04] dark:text-stone-200"
  }
] as const

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
    <motion.h2
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      className={cn("flex flex-wrap items-center justify-center gap-x-[0.25em]", className)}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-4 -mb-4 px-1 -mx-1">
          <motion.span variants={item} className="inline-block will-change-transform">
            {word}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  )
}

function MarketGhostLayer({
  item,
}: {
  item: LandingDifferentItem
}) {
  return (
    <motion.div
      key={`market-${item.title}`}
      initial={{ opacity: 0, scale: 0.96, y: 32 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -24 }}
      transition={LANDING_MOTION_TIMINGS.medium}
      className="absolute inset-0"
      aria-hidden="true"
    >
        <div className="absolute right-[-10%] top-[8%] h-[36%] w-[78%] rotate-[12deg] rounded-[2.6rem] border border-black/8 bg-neutral-100/90 p-5 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.5)] blur-[2px] dark:border-white/10 dark:bg-neutral-900/80 sm:h-[40%] sm:w-[74%] sm:p-7 lg:p-9 xl:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500 lg:text-[12px] xl:text-[13px]">
          {item.marketEyebrow}
        </p>
        <p className="mt-4 max-w-[20ch] text-lg font-semibold leading-tight text-neutral-600 dark:text-neutral-300 sm:text-xl lg:text-3xl xl:mt-6 xl:text-4xl">
          {item.marketLabel}
        </p>
      </div>

      <div className="absolute bottom-[4%] left-[-8%] w-[72%] -rotate-[7deg] rounded-[2.2rem] border border-black/8 bg-white/90 p-4 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.6)] blur-[1.5px] dark:border-white/10 dark:bg-neutral-950/80 sm:w-[58%] sm:p-6 lg:p-8 xl:p-9">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500 lg:text-[12px] xl:text-[13px]">
          {item.glimpseEyebrow}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 lg:mt-5 lg:gap-3 xl:gap-3.5">
          {item.glimpses.map((label) => (
            <span
              key={label}
              className="rounded-full border border-black/6 bg-black/[0.04] px-2.5 py-1 text-[11px] font-semibold text-neutral-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-neutral-300 lg:px-4 lg:py-2 lg:text-[13px] xl:px-4.5 xl:py-2.5 xl:text-[14px]"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function NumaEditorialCard({
  item,
  index
}: {
  item: LandingDifferentItem
  index: number
}) {
  const accent = EDITORIAL_ACCENTS[index]

  const cardRef = useRef<HTMLDivElement>(null)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 }
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig)

  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [100, 0]), springConfig)
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [100, 0]), springConfig)
  const backgroundPosition = useMotionTemplate`${glareX}% ${glareY}%`

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top
    const xPct = clientX / width - 0.5
    const yPct = clientY / height - 0.5
    mouseX.set(xPct)
    mouseY.set(yPct)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      key={`numa-${item.title}`}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
      {/* LAYER 1: BASE VETRO (Flattened content) */}
      <div
        className={cn(
          "absolute inset-0 overflow-hidden rounded-[2.7rem] shadow-[0_44px_120px_-50px_rgba(15,23,42,0.55)]",
          accent.card
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_52%)]" />
        <motion.div 
          className="pointer-events-none absolute inset-0 z-50 opacity-40 dark:opacity-20 mix-blend-overlay transition-opacity duration-500"
          style={{
            background: "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 60%)",
            backgroundSize: "200% 200%",
            backgroundPosition
          }}
        />
      </div>

      {/* LAYER 2: LIQUID EDGE (Isolato con Mask) */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[2.7rem] [isolation:isolate] [transform:translateZ(0)]">
         <motion.div 
            className="absolute left-1/2 top-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{ background: `conic-gradient(transparent 75%, ${accent.liquid} 100%)` }}
         />
         <div className="absolute inset-[1px] rounded-[calc(2.7rem-1px)] bg-black [mix-blend-mode:destination-out]" />
      </div>

      {/* LAYER 3: 3D INTERNAL Z-DEPTH (Preserve-3D) */}
      <div className="@container/landing-card relative flex h-full min-h-0 flex-col justify-between p-6 sm:p-7 lg:p-8 [transform-style:preserve-3d]">
        <motion.div className="flex flex-col gap-4" style={{ translateZ: "40px", transformStyle: "preserve-3d" }}>
          <div className="space-y-4 lg:space-y-6 [transform-style:preserve-3d]">
            <motion.div style={{ translateZ: "20px" }} className="space-y-2">
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.16em] sm:text-[12px] lg:text-[13px] xl:text-[14px]", accent.kicker)}>
                {item.kicker}
              </p>
            </motion.div>

            <motion.div
              style={{ translateZ: "30px" }}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-[1rem] border shadow-[0_18px_32px_-24px_rgba(15,23,42,0.45)] sm:h-12 sm:w-12 lg:h-16 lg:w-16 lg:rounded-[1.4rem]",
                accent.icon
              )}
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7" />
            </motion.div>

            <motion.div style={{ translateZ: "50px", transformStyle: "preserve-3d" }} className="space-y-3 lg:space-y-4 xl:space-y-5">
              <h2
                id={`landing-different-title-${index}`}
                className="max-w-[14ch] break-words text-balance font-black tracking-[-0.04em] leading-[0.92] text-foreground [font-size:clamp(2.2rem,11cqw,5.5rem)] [overflow-wrap:anywhere]"
              >
                {item.title}
              </h2>
              <p className="max-w-[34ch] font-normal leading-relaxed text-foreground/78 [font-size:clamp(1rem,4cqw,1.28rem)]">
                {item.numaLabel}
              </p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div style={{ translateZ: "20px" }} className="space-y-3 lg:space-y-4">
          <div className="h-px w-16 bg-foreground/12 lg:w-24 xl:w-32" />
          <p className="max-w-[32ch] text-[13px] font-normal leading-relaxed text-foreground/64 [font-size:clamp(0.85rem,3.2cqw,1.02rem)]">
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
        </motion.div>
      </div>
    </motion.div>
  )
}

export function LandingDifferentiatorCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

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
      <div className="sticky top-0 flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-b",
            accent.ambient
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),transparent_38%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),transparent_40%)]" />
        <motion.div
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
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
