"use client"

import { useEffect, useRef, useState } from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue
} from "framer-motion"
import { LANDING_DIFFERENTIATORS, type LandingDifferentItem } from "../data"

/* ─────────────────────────────────────────────
 * DifferentiatorPair
 * Two stacked cards in 3D perspective.
 * Market card starts in front (oblique), Numa behind.
 * Scroll swaps them with a cinematic deck rotation.
 * ───────────────────────────────────────────── */
function DifferentiatorPair({
  item,
  index,
  total,
  progress,
}: {
  item: LandingDifferentItem
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const seg = 1 / total
  const start = index * seg
  const end = start + seg
  const swapBegin = start + seg * 0.2
  const swapEnd = start + seg * 0.8

  // ── Market card (in front → rotates away in 3D) ──
  const mRotateY = useTransform(progress, [start, swapBegin, swapEnd], [-6, -6, -25])
  const mRotateX = useTransform(progress, [start, swapBegin, swapEnd], [2, 2, 8])
  const mRotateZ = useTransform(progress, [start, swapBegin, swapEnd], [-1, -1, -4])
  const mScale = useTransform(progress, [start, swapBegin, swapEnd], [1, 1, 0.85])
  const mOpacity = useTransform(progress, [swapBegin, swapEnd], [1, 0])
  const mX = useTransform(progress, [start, swapBegin, swapEnd], ["0%", "0%", "-12%"])

  // ── Numa card (behind → comes forward) ──
  const nRotateY = useTransform(progress, [swapBegin, swapEnd, end], [8, 0, 0])
  const nRotateX = useTransform(progress, [swapBegin, swapEnd, end], [3, 0, 0])
  const nRotateZ = useTransform(progress, [swapBegin, swapEnd, end], [1.5, 0, 0])
  const nScale = useTransform(progress, [swapBegin, swapEnd, end], [0.88, 1, 1])
  const nOpacity = useTransform(progress, [swapBegin, swapEnd], [0.4, 1])
  const nX = useTransform(progress, [swapBegin, swapEnd, end], ["6%", "0%", "0%"])

  // ── Pair crossfade ──
  const pairOpacity = useTransform(
    progress,
    index === 0
      ? [0, end - seg * 0.08, end]
      : index === total - 1
        ? [start - seg * 0.08, start, 1]
        : [start - seg * 0.08, start, end - seg * 0.08, end],
    index === 0
      ? [1, 1, 0]
      : index === total - 1
        ? [0, 1, 1]
        : [0, 1, 1, 0]
  )

  // Per-differentiator accent colors for the Numa card
  const numaAccents = [
    "from-violet-500/12 to-indigo-500/8 border-violet-400/25 dark:from-violet-500/20 dark:to-indigo-500/12 dark:border-violet-400/20",
    "from-emerald-500/12 to-teal-500/8 border-emerald-400/25 dark:from-emerald-500/20 dark:to-teal-500/12 dark:border-emerald-400/20",
    "from-amber-500/10 to-orange-500/8 border-amber-400/25 dark:from-amber-500/18 dark:to-orange-500/10 dark:border-amber-400/20"
  ]
  const numaTextAccents = [
    "text-violet-600 dark:text-violet-400",
    "text-emerald-600 dark:text-emerald-400",
    "text-amber-600 dark:text-amber-400"
  ]
  const numaIconAccents = [
    "border-violet-400/20 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    "border-emerald-400/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    "border-amber-400/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
  ]
  const pairStyle = { opacity: pairOpacity }
  const numaCardStyle = {
    rotateY: nRotateY,
    rotateX: nRotateX,
    rotateZ: nRotateZ,
    scale: nScale,
    opacity: nOpacity,
    x: nX,
  }
  const marketCardStyle = {
    rotateY: mRotateY,
    rotateX: mRotateX,
    rotateZ: mRotateZ,
    scale: mScale,
    opacity: mOpacity,
    x: mX,
  }

  return (
    <motion.div style={pairStyle} className="absolute inset-0" aria-hidden={index > 0}>
      {/* ── Numa card (z-10, behind) ── */}
      <motion.div
        style={numaCardStyle}
        className={`absolute inset-0 z-10 flex flex-col justify-between rounded-[1.5rem] sm:rounded-[2rem] border bg-gradient-to-br p-6 sm:p-8 lg:p-10 shadow-2xl ${numaAccents[index]}`}
      >
        <div className="space-y-4 sm:space-y-5">
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${numaTextAccents[index]}`}>
            ✓ Con Numa
          </p>
          <div className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border ${numaIconAccents[index]}`}>
            <item.icon className="h-5 w-5" />
          </div>
          <h3 className="max-w-[20ch] text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground">
            {item.title}
          </h3>
        </div>
        <p className="text-sm sm:text-base lg:text-lg font-semibold leading-relaxed text-foreground/80">
          {item.numaLabel}
        </p>
      </motion.div>

      {/* ── Market card (z-20, in front) ── */}
      <motion.div
        style={marketCardStyle}
        className="absolute inset-0 z-20 flex flex-col justify-between rounded-[1.5rem] sm:rounded-[2rem] border border-neutral-200/60 bg-gradient-to-br from-neutral-100 to-stone-50 p-6 sm:p-8 lg:p-10 shadow-2xl dark:border-neutral-700/40 dark:from-neutral-800 dark:to-neutral-900"
      >
        <div className="space-y-4 sm:space-y-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            • Il mercato
          </p>
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-100 text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500">
            <item.icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-neutral-500 dark:text-neutral-400">
          {item.marketLabel}
        </p>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
 * LandingDifferentiatorCards
 * Full-width, 16:9 scroll-pinned card deck.
 * ───────────────────────────────────────────── */
export function LandingDifferentiatorCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const smooth = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 28,
    mass: 1,
  })
  const deckPerspectiveStyle = {
    perspective: "1200px",
    perspectiveOrigin: "50% 50%",
  }

  useEffect(() => {
    return smooth.on("change", (v) => {
      const total = LANDING_DIFFERENTIATORS.length
      const idx = Math.min(Math.floor(v * total), total - 1)
      setActiveIndex((prev) => (prev === idx ? prev : idx))
    })
  }, [smooth])

  /* ── Reduced motion fallback ── */
  if (prefersReducedMotion) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 px-4">
        <div className="text-center">
          <h2 id="landing-different-title" className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            La differenza con Numa
          </h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Tre scelte di design che separano Numa da tutto il resto.
          </p>
        </div>
        {LANDING_DIFFERENTIATORS.map((item) => (
          <div key={item.title} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">{item.title}</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-muted-foreground/10 bg-muted/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">• Il mercato</p>
                <p className="text-sm font-medium text-muted-foreground">{item.marketLabel}</p>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">✓ Con Numa</p>
                <p className="text-sm font-semibold text-foreground">{item.numaLabel}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  /* ── Animated scroll-driven card deck ── */
  return (
    <div ref={containerRef} className="relative h-[450vh] w-full">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">

        {/* ── Header with step counter ── */}
        <div className="absolute top-12 sm:top-16 z-40 flex flex-col items-center text-center px-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary tabular-nums">
            {String(activeIndex + 1).padStart(2, "0")} / {String(LANDING_DIFFERENTIATORS.length).padStart(2, "0")}
          </p>
          <h2
            id="landing-different-title"
            className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl"
          >
            La differenza con Numa
          </h2>
          <p className="mt-2 max-w-md text-sm font-medium text-muted-foreground">
            Tre scelte di design che separano Numa da tutto il resto.
          </p>
        </div>

        {/* ── Card deck viewport (full-width, 16:9, 3D perspective) ── */}
        <div
          className="relative mx-4 sm:mx-8 lg:mx-16 mt-8 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] lg:w-[calc(100%-8rem)] max-w-6xl aspect-video"
          style={deckPerspectiveStyle}
        >
          {LANDING_DIFFERENTIATORS.map((item, i) => (
            <DifferentiatorPair
              key={item.title}
              item={item}
              index={i}
              total={LANDING_DIFFERENTIATORS.length}
              progress={smooth}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
