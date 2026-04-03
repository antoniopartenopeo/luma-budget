"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useScroll } from "framer-motion"
import { cn } from "@/lib/utils"
import { LANDING_DIFFERENTIATORS, type LandingDifferentItem } from "../data"
import { LANDING_MOTION_EASE, LANDING_MOTION_TIMINGS } from "./landing-motion"

const EDITORIAL_ACCENTS = [
  {
    ambient: "from-cyan-500/15 via-background to-background dark:from-cyan-500/20 dark:via-background/80 dark:to-background",
    glow: "bg-cyan-500/30 dark:bg-cyan-400/25",
    card: "border-cyan-400/25 bg-gradient-to-br from-cyan-500/[0.02] via-white to-cyan-50/50 dark:border-cyan-400/20 dark:from-[rgba(6,182,212,0.12)] dark:via-black/80 dark:to-[rgba(6,182,212,0.08)] dark:backdrop-blur-3xl",
    kicker: "text-cyan-700 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]",
    icon: "border-cyan-400/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
  },
  {
    ambient: "from-emerald-500/15 via-background to-background dark:from-emerald-500/20 dark:via-background/80 dark:to-background",
    glow: "bg-emerald-500/30 dark:bg-emerald-400/25",
    card: "border-emerald-400/25 bg-gradient-to-br from-emerald-500/[0.02] via-white to-emerald-50/50 dark:border-emerald-400/20 dark:from-[rgba(16,185,129,0.12)] dark:via-black/80 dark:to-[rgba(16,185,129,0.08)] dark:backdrop-blur-3xl",
    kicker: "text-emerald-700 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]",
    icon: "border-emerald-400/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
  },
  {
    ambient: "from-indigo-500/15 via-background to-background dark:from-indigo-500/20 dark:via-background/80 dark:to-background",
    glow: "bg-indigo-500/30 dark:bg-indigo-400/25",
    card: "border-indigo-400/25 bg-gradient-to-br from-indigo-500/[0.02] via-white to-indigo-50/50 dark:border-indigo-400/20 dark:from-[rgba(99,102,241,0.12)] dark:via-black/80 dark:to-[rgba(99,102,241,0.08)] dark:backdrop-blur-3xl",
    kicker: "text-indigo-700 dark:text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]",
    icon: "border-indigo-400/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
  }
] as const

const EDITORIAL_NOTES = [
  "I tuoi file non vengono mai inviati o salvati nel cloud.",
  "Nessun rischio di data breach. Nessuna sincronizzazione forzata.",
  "La potenza di calcolo usa il tuo processore, non i nostri server."
] as const

const EDITORIAL_KICKERS = [
  "Local-first nativo",
  "Zero open banking",
  "Intelligenza privata"
] as const

const MARKET_GLIMPSES = [
  ["Sync obbligatorio", "Database centrali", "Dati in vendita"],
  ["Credenziali condivise", "Connessione continua", "Privacy a rischio"],
  ["Dati inviati a terzi", "AI esterne", "Server opachi"]
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
        <div className="absolute right-[-10%] top-[8%] h-[36%] w-[78%] rotate-[12deg] rounded-[2.6rem] border border-black/8 bg-neutral-100/90 p-5 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.5)] blur-[2px] dark:border-white/10 dark:bg-neutral-900/80 sm:h-[40%] sm:w-[74%] sm:p-7 lg:p-9 xl:p-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 lg:text-[13px] xl:text-[14px]">
          Altrove
        </p>
        <p className="mt-4 max-w-[20ch] text-lg font-semibold leading-tight text-neutral-600 dark:text-neutral-300 sm:text-xl lg:text-3xl xl:mt-6 xl:text-4xl">
          {item.marketLabel}
        </p>
      </div>

      <div className="absolute bottom-[4%] left-[-8%] w-[72%] -rotate-[7deg] rounded-[2.2rem] border border-black/8 bg-white/90 p-4 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.6)] blur-[1.5px] dark:border-white/10 dark:bg-neutral-950/80 sm:w-[58%] sm:p-6 lg:p-8 xl:p-9">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 lg:text-[13px] xl:text-[14px]">
          Di solito
        </p>
        <div className="mt-3 flex flex-wrap gap-2 lg:mt-5 lg:gap-3 xl:gap-3.5">
          {MARKET_GLIMPSES[index].map((label) => (
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
          <div className="space-y-4 lg:space-y-6">
            <div className="space-y-2">
              <p className={cn("text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.2em] lg:text-[14px] xl:text-[15px]", accent.kicker)}>
                {EDITORIAL_KICKERS[index]}
              </p>
            </div>

            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-[1rem] border shadow-[0_18px_32px_-24px_rgba(15,23,42,0.45)] sm:h-12 sm:w-12 lg:h-16 lg:w-16 lg:rounded-[1.4rem]",
                accent.icon
              )}
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7" />
            </div>

            <div className="space-y-3 lg:space-y-4 xl:space-y-5">
              <h2
                id="landing-different-title"
                className="max-w-[14ch] break-words text-balance font-black tracking-[-0.04em] leading-[0.92] text-foreground [font-size:clamp(2.2rem,11cqw,5.5rem)] [overflow-wrap:anywhere]"
              >
                {item.title}
              </h2>
              <p className="max-w-[34ch] font-medium leading-relaxed text-foreground/80 [font-size:clamp(1rem,4cqw,1.4rem)]">
                {item.numaLabel}
              </p>
            </div>
          </div>

            <div className="space-y-3 lg:space-y-4">
              <div className="h-px w-16 bg-foreground/12 lg:w-24 xl:w-32" />
              <p className="max-w-[32ch] text-[13px] font-semibold leading-relaxed text-foreground/64 [font-size:clamp(0.85rem,3.2cqw,1.1rem)]">
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
          <div className="relative z-10 mb-8 max-w-2xl text-center sm:mb-12 lg:mb-16 xl:max-w-4xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
              La tua cassaforte locale
            </p>
            <h2 className="mt-5 text-4xl font-black leading-[0.92] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              I tuoi soldi.<br /> Nessun server di mezzo.
            </h2>
            <p className="mx-auto mt-6 max-w-[56ch] text-[15px] font-medium leading-relaxed text-muted-foreground sm:text-lg lg:text-xl xl:text-[1.35rem]">
              Il primo cruscotto budget che gira interamente nel tuo browser. Crea proiezioni e stima il tuo margine senza mai spostare i tuoi dati nel cloud.
            </p>
          </div>

          <div className="relative mx-auto h-[min(82vh,48rem)] w-full max-w-[32rem] sm:h-[min(85vh,54rem)] sm:max-w-[42rem] lg:max-w-[54rem] xl:h-[min(85vh,64rem)] xl:max-w-[64rem] [perspective:1400px]">
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
