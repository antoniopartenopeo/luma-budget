"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useScroll } from "framer-motion"
import { cn } from "@/lib/utils"
import { LANDING_DIFFERENTIATORS, type LandingDifferentItem } from "../data"
import { LANDING_MOTION_EASE, LANDING_MOTION_TIMINGS } from "./landing-motion"

const EDITORIAL_ACCENTS = [
  {
    ambient: "from-violet-500/10 via-background to-background dark:from-violet-500/16 dark:via-background dark:to-background",
    glow: "bg-violet-500/18",
    card: "border-violet-400/20 bg-gradient-to-br from-[#faf5ff] via-white to-[#eef2ff] dark:from-[#171021] dark:via-[#0b0b12] dark:to-[#121833]",
    kicker: "text-violet-600 dark:text-violet-400",
    icon: "border-violet-400/20 bg-violet-500/10 text-violet-600 dark:text-violet-400"
  },
  {
    ambient: "from-emerald-500/10 via-background to-background dark:from-emerald-500/16 dark:via-background dark:to-background",
    glow: "bg-emerald-500/16",
    card: "border-emerald-400/20 bg-gradient-to-br from-[#ecfdf5] via-white to-[#effcf8] dark:from-[#0d1916] dark:via-[#0b0f0e] dark:to-[#10201b]",
    kicker: "text-emerald-600 dark:text-emerald-400",
    icon: "border-emerald-400/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  },
  {
    ambient: "from-amber-500/10 via-background to-background dark:from-amber-500/16 dark:via-background dark:to-background",
    glow: "bg-amber-500/18",
    card: "border-amber-400/20 bg-gradient-to-br from-[#fff7ed] via-white to-[#fef3c7] dark:from-[#1b140d] dark:via-[#0b0b0d] dark:to-[#24160f]",
    kicker: "text-amber-600 dark:text-amber-400",
    icon: "border-amber-400/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
  }
] as const

const EDITORIAL_NOTES = [
  "Privacy locale all'inizio, non come postilla nascosta.",
  "Parte dai movimenti che hai gia, non da un rito da seguire.",
  "Stime chiare per il mese e una quota sostenibile prima di impegnarti."
] as const

const EDITORIAL_KICKERS = [
  "Locale per davvero",
  "Si adatta a te",
  "Numeri che servono"
] as const

const MARKET_GLIMPSES = [
  ["Cloud sync obbligatorio", "Account collegati", "Dati ospitati altrove"],
  ["Metodo rigido", "Budget da compilare", "Rituali da seguire"],
  ["AI generica", "Promesse vaghe", "Simulazioni poco chiare"]
] as const

function MarketGhostLayer({
  item,
  index
}: {
  item: LandingDifferentItem
  index: number
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
        <div className="absolute right-[-8%] top-[7%] h-[38%] w-[74%] rotate-[14deg] rounded-[2.4rem] border border-black/8 bg-neutral-100/82 p-5 shadow-[0_40px_90px_-44px_rgba(15,23,42,0.45)] blur-[1.8px] dark:border-white/8 dark:bg-neutral-900/55 sm:h-[42%] sm:w-[70%] sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
          Altrove
        </p>
        <p className="mt-4 max-w-[18ch] text-lg font-medium leading-tight text-neutral-500 dark:text-neutral-400 sm:text-xl">
          {item.marketLabel}
        </p>
      </div>

      <div className="absolute bottom-[4%] left-[-6%] w-[68%] -rotate-[9deg] rounded-[2rem] border border-black/8 bg-white/80 p-4 shadow-[0_30px_90px_-48px_rgba(15,23,42,0.5)] blur-[1.2px] dark:border-white/8 dark:bg-neutral-950/50 sm:w-[56%] sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
          Di solito
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {MARKET_GLIMPSES[index].map((label) => (
            <span
              key={label}
              className="rounded-full border border-black/6 bg-black/[0.03] px-2.5 py-1 text-[11px] font-semibold text-neutral-500 dark:border-white/8 dark:bg-white/[0.04] dark:text-neutral-400"
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

  return (
    <motion.div
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
    >
      <div
        className={cn(
          "@container/landing-card relative flex h-full flex-col justify-between overflow-hidden rounded-[2.7rem] border p-6 shadow-[0_44px_120px_-50px_rgba(15,23,42,0.55)] sm:p-7 lg:p-8",
          accent.card
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_52%)]" />

        <div className="relative flex h-full min-h-0 flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.16em]", accent.kicker)}>
                {EDITORIAL_KICKERS[index]}
              </p>
            </div>

            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-[1rem] border shadow-[0_18px_32px_-24px_rgba(15,23,42,0.45)] sm:h-11 sm:w-11",
                accent.icon
              )}
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            <div className="space-y-2.5">
              <h2
                id="landing-different-title"
                className="max-w-[12.5ch] break-words text-balance font-extrabold tracking-[-0.05em] leading-[0.9] text-foreground [font-size:clamp(1.9rem,12cqw,3.3rem)] [overflow-wrap:anywhere]"
              >
                {item.title}
              </h2>
              <p className="max-w-[31ch] text-sm font-normal leading-relaxed text-foreground/76 [font-size:clamp(0.9rem,4cqw,1rem)]">
                {item.numaLabel}
              </p>
            </div>
          </div>

            <div className="space-y-2.5">
              <div className="h-px w-16 bg-foreground/12" />
              <p className="max-w-[32ch] text-[13px] font-medium leading-relaxed text-foreground/64 [font-size:clamp(0.78rem,3.15cqw,0.92rem)]">
                {EDITORIAL_NOTES[index]}
              </p>

            <div className="flex items-center gap-2 pt-0.5">
              {LANDING_DIFFERENTIATORS.map((entry, dotIndex) => (
                <span
                  key={entry.title}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    dotIndex === index ? "w-10 bg-foreground/78" : "w-4 bg-foreground/12"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
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
    <div ref={containerRef} className="relative h-[340vh] w-full">
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
          <div className="relative z-10 mb-8 max-w-2xl text-center sm:mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Differenza
            </p>
            <h2 className="mt-4 text-3xl font-extrabold leading-[0.95] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Tre scelte che cambiano il quadro.
            </h2>
            <p className="mx-auto mt-4 max-w-[52ch] text-[15px] font-normal leading-relaxed text-muted-foreground sm:text-base">
              Numa non parte da cloud, metodi rigidi o promesse generiche. Parte da una lettura piu calma, privata e utile del mese.
            </p>
          </div>

          <div className="relative mx-auto h-[min(74vh,43rem)] w-full max-w-[28rem] sm:h-[min(78vh,45rem)] sm:max-w-[33rem] lg:max-w-[37rem] [perspective:1400px]">
            <AnimatePresence mode="wait">
              <MarketGhostLayer
                key={`ghost-${activeItem.title}`}
                item={activeItem}
                index={activeIndex}
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
