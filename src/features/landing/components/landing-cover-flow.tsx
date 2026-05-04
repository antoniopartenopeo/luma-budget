"use client"

import React, { startTransition, useState, useEffect, useRef } from "react"
import {
  ArrowDownUp,
  BrainCircuit,
  CreditCard,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react"
import {
  m,
  useReducedMotion,
  type Variants
} from "framer-motion"
import { useDeviceHardware } from "@/hooks/use-device-hardware"
import { cn } from "@/lib/utils"
import { LANDING_COVERFLOW_CARDS } from "../content"
import type { LandingPreviewData } from "../content"
import { LANDING_HERO_PREVIEW } from "../preview-model"

// ----------------------------------------------------------------------
// CYPHER EFFECT: Scrambled Text for Neural Data Nodes
// ----------------------------------------------------------------------
function ScrambledText({ text, isActive }: { text?: string; isActive: boolean }) {
  const [displayValue, setDisplayValue] = useState(text ?? "")

  useEffect(() => {
    if (!isActive || !text) {
      return
    }
    let iterations = 0
    const chars = "XYZ#01&€OX"
    const interval = setInterval(() => {
      setDisplayValue(
        text
          .split("")
          .map((letter, index) => {
            if (index < iterations) return letter
            if (letter === " " || letter === "." || letter === ",") return letter
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join("")
      )
      if (iterations >= text.length) clearInterval(interval)
      iterations += 1 / 1.5 // Speed of decryption
    }, 25)

    return () => clearInterval(interval)
  }, [isActive, text])

  return <span>{isActive ? displayValue : text ?? ""}</span>
}

// ----------------------------------------------------------------------
// COMMON ANIMATION VARIANTS FOR STAGGERING
// ----------------------------------------------------------------------
const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 }
  }
}
const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 24 } }
}

const HERO_PREVIEW_RAIL_ITEMS = [
  { label: "Importa", Icon: WalletCards },
  { label: "Capisci", Icon: ArrowDownUp },
  { label: "Resta", Icon: BrainCircuit },
  { label: "Quota", Icon: ShieldCheck },
  { label: "Costi", Icon: CreditCard },
] as const

type CardVisualState = {
  isCenter: boolean
  isAdjacent: boolean
  visualState: "center" | "adjacent" | "distant"
  xOffset: number
  zOffset: number
  rotateY: number
  scale: number
  opacity: number
  blur: number
}

function getCardVisualState(distance: number, shouldReduceVisualEffects: boolean): CardVisualState {
  const isCenter = distance === 0
  const isAdjacent = Math.abs(distance) === 1
  const isLeft = distance < 0
  const isNear = Math.abs(distance) === 1
  const sideMultiplier = isLeft ? -1 : 1
  const xOffset = isCenter
    ? 0
    : sideMultiplier * (isNear
      ? shouldReduceVisualEffects ? 240 : 330
      : shouldReduceVisualEffects ? 380 : 560)

  return {
    isCenter,
    isAdjacent,
    visualState: isCenter ? "center" : isAdjacent ? "adjacent" : "distant",
    xOffset,
    zOffset: shouldReduceVisualEffects ? 0 : isCenter ? 28 : isAdjacent ? -130 : -320,
    rotateY: shouldReduceVisualEffects ? 0 : isCenter ? 0 : sideMultiplier * (isAdjacent ? -28 : -48),
    scale: isCenter ? 1 : isAdjacent ? shouldReduceVisualEffects ? 0.84 : 0.78 : shouldReduceVisualEffects ? 0.7 : 0.62,
    opacity: isCenter ? 1 : isAdjacent ? 0.58 : 0.14,
    blur: shouldReduceVisualEffects || isCenter ? 0 : isAdjacent ? 1.25 : 2.75,
  }
}

function HeroPreviewRail({
  cards,
  activeIndex,
  onSelect,
}: {
  cards: typeof LANDING_COVERFLOW_CARDS
  activeIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <div className="order-first z-30 flex w-full justify-center px-3 sm:order-none sm:-mt-2 sm:px-4">
      <div
        className="grid w-full max-w-[32rem] grid-cols-5 gap-1 rounded-[1.05rem] border border-black/[0.06] bg-white/70 p-1 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.62)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/68 dark:shadow-[0_18px_44px_-34px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.07)]"
        aria-label="Seleziona anteprima hero"
      >
        {cards.map((card, index) => (
          <HeroPreviewRailItem
            key={`rail-${card.id}`}
            card={card}
            index={index}
            isActive={index === activeIndex}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

function HeroPreviewRailItem({
  card,
  index,
  isActive,
  onSelect,
}: {
  card: (typeof LANDING_COVERFLOW_CARDS)[number]
  index: number
  isActive: boolean
  onSelect: (index: number) => void
}) {
  const railItem = HERO_PREVIEW_RAIL_ITEMS[index] ?? HERO_PREVIEW_RAIL_ITEMS[0]
  const Icon = railItem.Icon

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className={cn(
        "group relative min-w-0 rounded-[0.8rem] px-1.5 py-2 text-center outline-none transition-[background-color,border-color,box-shadow,color,opacity] duration-200 focus-visible:ring-2 focus-visible:ring-primary/35 sm:px-2 sm:py-2.5",
        isActive
          ? "border border-primary/18 bg-foreground/[0.055] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-cyan-200/16 dark:bg-white/[0.075] dark:text-white"
          : "border border-transparent text-foreground/48 hover:bg-foreground/[0.035] hover:text-foreground/76 dark:text-white/44 dark:hover:bg-white/[0.05] dark:hover:text-white/76"
      )}
      aria-pressed={isActive}
      aria-label={`${railItem.label}: ${card.title}`}
    >
      <span className="flex min-w-0 flex-col items-center gap-1.5">
        <Icon
          className={cn(
            "h-3.5 w-3.5 transition-colors duration-200 sm:h-4 sm:w-4",
            isActive ? "text-primary dark:text-cyan-200" : "text-current"
          )}
          aria-hidden="true"
        />
        <span className="truncate text-[10px] font-black uppercase tracking-[0.12em] sm:text-[11px]">
          {railItem.label}
        </span>
      </span>
    </button>
  )
}

type PreviewTone = "neutral" | "cyan" | "emerald" | "violet" | "orange"

const PREVIEW_GLASS_TONES: Record<PreviewTone, { panel: string; veil: string }> = {
  neutral: {
    panel:
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(244,247,251,0.74))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]",
    veil:
      "bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.72),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.34),transparent_44%)] dark:bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.07),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_44%)]"
  },
  cyan: {
    panel:
      "bg-[linear-gradient(180deg,rgba(236,254,255,0.95),rgba(244,250,252,0.78))] dark:bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(255,255,255,0.03))]",
    veil:
      "bg-[radial-gradient(circle_at_16%_18%,rgba(103,232,249,0.34),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.28),transparent_44%)] dark:bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_44%)]"
  },
  emerald: {
    panel:
      "bg-[linear-gradient(180deg,rgba(236,253,245,0.94),rgba(245,250,247,0.8))] dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(255,255,255,0.03))]",
    veil:
      "bg-[radial-gradient(circle_at_16%_18%,rgba(110,231,183,0.28),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.24),transparent_42%)] dark:bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.07),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_42%)]"
  },
  violet: {
    panel:
      "bg-[linear-gradient(180deg,rgba(245,243,255,0.95),rgba(248,246,252,0.8))] dark:bg-[linear-gradient(180deg,rgba(139,92,246,0.08),rgba(255,255,255,0.03))]",
    veil:
      "bg-[radial-gradient(circle_at_16%_18%,rgba(196,181,253,0.3),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.26),transparent_44%)] dark:bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_44%)]"
  },
  orange: {
    panel:
      "bg-[linear-gradient(180deg,rgba(255,247,237,0.95),rgba(251,246,241,0.82))] dark:bg-[linear-gradient(180deg,rgba(249,115,22,0.08),rgba(255,255,255,0.03))]",
    veil:
      "bg-[radial-gradient(circle_at_16%_18%,rgba(253,186,116,0.3),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.24),transparent_42%)] dark:bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_42%)]"
  }
}

function PreviewGlass({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode
  tone?: PreviewTone
  className?: string
}) {
  const toneStyle = PREVIEW_GLASS_TONES[tone]

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-black/6 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.22)] dark:border-white/10 dark:shadow-[0_18px_34px_-28px_rgba(0,0,0,0.45)]",
        toneStyle.panel,
        className
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0", toneStyle.veil)} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ----------------------------------------------------------------------
// PREVIEW COMPONENTS
// ----------------------------------------------------------------------

function FloatingPill({ text, colorClass = "text-white/90" }: { text: string, colorClass?: string }) {
  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center whitespace-nowrap rounded-full border border-black/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(242,245,249,0.9))] px-5 py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.08),_0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(39,39,42,0.92),rgba(24,24,27,0.86))] dark:shadow-[0_8px_30px_rgba(0,0,0,0.8),_inset_0_1px_1px_rgba(255,255,255,0.1)] transition-colors duration-500">
      <span className={cn("text-[8px] sm:text-[9px] font-black tracking-[0.2em] uppercase", colorClass)}>
        {text}
      </span>
    </div>
  )
}

const METRIC_TONE_CLASS = {
  income:
    "border-cyan-400/18 bg-cyan-500/[0.08] text-cyan-800 dark:border-white/10 dark:bg-white/[0.055] dark:text-cyan-100",
  expense:
    "border-slate-400/18 bg-slate-500/[0.07] text-slate-700 dark:border-white/10 dark:bg-white/[0.045] dark:text-white/72",
  margin:
    "border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-800 dark:border-emerald-300/12 dark:bg-emerald-300/[0.07] dark:text-emerald-100",
} as const

const METRIC_BAR_CLASS = {
  income: "bg-[linear-gradient(90deg,rgba(34,211,238,0.72),rgba(14,165,233,0.9))]",
  expense: "bg-[linear-gradient(90deg,rgba(148,163,184,0.72),rgba(203,213,225,0.92))]",
  margin: "bg-[linear-gradient(90deg,rgba(16,185,129,0.7),rgba(45,212,191,0.92))]",
} as const

function ClarityPreview({ data, isActive }: { data: LandingPreviewData; isActive: boolean }) {
  const preview = LANDING_HERO_PREVIEW

  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-5 py-5 sm:px-6 sm:py-5">
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <span className="rounded-full border border-black/6 bg-white/44 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-foreground/44 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/48">
            Esempio
          </span>
        </div>

        <div className="space-y-2.5">
          <h3 className="max-w-[17rem] text-2xl font-black tracking-tight text-foreground sm:text-[1.7rem]">
            {data.title}
          </h3>
          <div className="space-y-2.5">
            <p
              aria-label={preview.marginAmount.accessibleLabel}
              className="flex items-end gap-2 text-foreground"
            >
              <span className="pb-1 text-2xl font-black tracking-tight text-foreground/70 sm:text-3xl">
                {preview.marginAmount.prefix}
              </span>
              <span className="font-mono text-6xl font-black leading-none tracking-tighter sm:text-[4.35rem]">
                {preview.marginAmount.value}
              </span>
            </p>
            <p className="max-w-[21rem] text-sm font-medium leading-relaxed text-foreground/62 sm:text-[15px]">
              {data.description}
            </p>
          </div>
        </div>


      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2.5">
          {preview.metrics.map((metric, index) => (
            <m.div
              key={metric.label}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ delay: 0.44 + index * 0.08, type: "spring", damping: 28 }}
              className={cn(
                "rounded-[1.2rem] border px-3 py-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.22)] backdrop-blur-xl",
                METRIC_TONE_CLASS[metric.tone]
              )}
            >
              <p className="text-[9px] font-black uppercase tracking-[0.16em] opacity-62">
                {metric.label}
              </p>
              <p className="mt-1 text-[12px] font-black tracking-tight sm:text-[13px]">
                {metric.value}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/6 dark:bg-white/10">
                <m.div
                  className={cn("h-full rounded-full", METRIC_BAR_CLASS[metric.tone])}
                  initial={{ width: "0%" }}
                  animate={isActive ? { width: `${metric.widthPct}%` } : { width: "0%" }}
                  transition={{ delay: 0.62 + index * 0.08, type: "spring", damping: 30 }}
                />
              </div>
            </m.div>
          ))}
        </div>


      </div>
    </div>
  )
}

function TransactionsPreview({ data, isActive }: { data: LandingPreviewData; isActive: boolean }) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-4 py-6">
      <div className="space-y-4">

        <div className="space-y-2.5">
          <h3 className="max-w-[17rem] text-2xl font-black tracking-tight text-foreground sm:text-[1.7rem]">
            {data.title}
          </h3>
          <p className="max-w-[18.5rem] text-[15px] font-medium leading-relaxed text-foreground/64">
            {data.description}
          </p>
        </div>

      </div>

      {isActive && (
        <m.div className="space-y-3" variants={listContainerVariants} initial="hidden" animate="visible">
          {data.items?.map((item) => (
            <m.div
              key={item.label}
              variants={listItemVariants}
              className="relative overflow-hidden flex items-center justify-between rounded-[1.35rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(244,247,251,0.78))] px-4 py-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(255,255,255,0.6),transparent_34%)] dark:bg-[radial-gradient(circle_at_14%_20%,rgba(255,255,255,0.06),transparent_34%)]" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/48">{item.note}</p>
              </div>
              <p className="text-sm font-black tracking-tight text-foreground">{item.value}</p>
            </m.div>
          ))}
        </m.div>
      )}
    </div>
  )
}

function QuotaPreview({ data, isActive }: { data: LandingPreviewData; isActive: boolean }) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-4 py-6">
      <div className="space-y-4">


        <div className="space-y-2.5">
          <h3 className="max-w-[17rem] text-2xl font-black tracking-tight text-foreground sm:text-[1.7rem]">
            {data.title}
          </h3>
          <p className="max-w-[18.5rem] text-[15px] font-medium leading-relaxed text-foreground/64">
            {data.description}
          </p>
        </div>        <m.div 
           animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
           transition={{ delay: 0.2 }}
           className="rounded-[1.45rem] border border-black/6 bg-white/76 px-4 py-5 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white/[0.04]"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/46">{data.customContent?.textParams?.[0]}</p>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/[0.1] dark:text-emerald-300">
              {data.insightBadge}
            </span>
          </div>
          <div className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-[2rem]">
             {data.customContent?.textParams?.[1]}
          </div>
        </m.div>
      </div>
    </div>
  )
}

function SubscriptionsPreview({ data, isActive }: { data: LandingPreviewData; isActive: boolean }) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-4 py-6">
      <div className="space-y-4">


        <div className="space-y-2.5">
          <h3 className="max-w-[17rem] text-2xl font-black tracking-tight text-foreground sm:text-[1.7rem]">
            {data.title}
          </h3>
          <p className="max-w-[18.5rem] text-[15px] font-medium leading-relaxed text-foreground/64">
            {data.description}
          </p>
        </div>


      </div>

      {isActive && (
        <m.div className="space-y-3" variants={listContainerVariants} initial="hidden" animate="visible">
          {data.items?.map((item) => (
            <m.div
              key={item.label}
              variants={listItemVariants}
              className="flex items-center justify-between rounded-[1.35rem] border border-black/6 bg-white/74 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/46">{item.note}</p>
              </div>
              <p className="text-sm font-black tracking-tight text-foreground font-mono">
                {item.value}
              </p>
            </m.div>
          ))}
        </m.div>
      )}
    </div>
  )
}

function SourcesPreview({ data, isActive }: { data: LandingPreviewData; isActive: boolean }) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-4 py-6">
      <div className="space-y-4">


        <div className="space-y-2.5">
          <h3 className="max-w-[17rem] text-2xl font-black tracking-tight text-foreground sm:text-[1.7rem]">
            {data.title}
          </h3>
          <p className="max-w-[18.5rem] text-[15px] font-medium leading-relaxed text-foreground/64">
            {data.description}
          </p>
        </div>


      </div>

      {isActive && (
        <m.div className="space-y-3" variants={listContainerVariants} initial="hidden" animate="visible">
          {data.items?.map((item) => (
            <m.div
              key={item.label}
              variants={listItemVariants}
              className="flex items-center justify-between rounded-[1.35rem] border border-black/6 bg-white/72 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/46">{item.note}</p>
              </div>
              <p className="text-sm font-black tracking-tight text-foreground font-mono">
                {item.value}
              </p>
            </m.div>
          ))}
        </m.div>
      )}
    </div>
  )
}

export function LandingCoverFlow() {
  const [activeIndex, setActiveIndex] = useState(2)
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const totalCards = LANDING_COVERFLOW_CARDS.length
  const prefersReducedMotion = useReducedMotion() ?? false
  const { safeToAnimate3D } = useDeviceHardware()
  const shouldReduceVisualEffects = prefersReducedMotion || !safeToAnimate3D

  const sliderRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScroll = useRef(false)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  const activateCard = (index: number) => {
    isProgrammaticScroll.current = true
    startTransition(() => {
      setActiveIndex(index)
    })
    
    if (sliderRef.current) {
      const children = sliderRef.current.children
      if (children.length > 1) {
        const cardWidth = children[1].clientWidth
        if (typeof sliderRef.current.scrollTo === "function") {
          sliderRef.current.scrollTo({
            left: index * cardWidth,
            behavior: shouldReduceVisualEffects ? "auto" : "smooth"
          })
        } else {
          sliderRef.current.scrollLeft = index * cardWidth
        }
      }
    }

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      isProgrammaticScroll.current = false
    }, 600)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScroll.current) return
    
    const slider = e.currentTarget
    if (!slider.children.length) return
    const cardWidth = slider.children[1]?.clientWidth || 320
    const index = Math.round(slider.scrollLeft / cardWidth)
    
    if (index !== activeIndex && index >= 0 && index < totalCards) {
      startTransition(() => {
        setActiveIndex(index)
      })
    }
  }

  const handleCardKeyDown = (index: number, event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      activateCard(Math.min(totalCards - 1, index + 1))
      return
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault()
      activateCard(Math.max(0, index - 1))
      return
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      activateCard(index)
    }
  }

  return (
    <div
      className="relative mt-0 flex w-full flex-col items-center gap-5 overflow-visible sm:mt-1"
      data-testid="landing-cover-flow"
    >
      <div className="relative flex h-[33rem] w-full items-center justify-center overflow-visible [perspective:2600px] sm:h-[35rem]">
        <div className="pointer-events-none absolute inset-x-[4%] top-[18%] h-[68%] bg-[linear-gradient(90deg,transparent,rgba(14,165,233,0.10)_28%,rgba(255,255,255,0.20)_50%,rgba(20,184,166,0.10)_72%,transparent)] blur-3xl dark:bg-[linear-gradient(90deg,transparent,rgba(14,165,233,0.10)_30%,rgba(255,255,255,0.045)_50%,rgba(45,212,191,0.09)_70%,transparent)]" />
        <div className="pointer-events-none absolute inset-x-[18%] bottom-[8%] h-24 bg-[linear-gradient(90deg,transparent,rgba(14,165,233,0.12),transparent)] blur-[72px] dark:bg-[linear-gradient(90deg,transparent,rgba(14,165,233,0.10),transparent)]" />

        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="absolute inset-x-0 inset-y-0 z-[40] flex overflow-x-auto snap-x snap-mandatory touch-pan-x overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          tabIndex={0}
        >
          <div className="w-[calc(50%-10rem)] shrink-0 pointer-events-none sm:w-[calc(50%-12.5rem)]" />

          {LANDING_COVERFLOW_CARDS.map((card, i) => (
            <button
              key={card.id}
              type="button"
              className="h-full w-[20rem] shrink-0 snap-center cursor-grab outline-none active:cursor-grabbing sm:w-[25rem]"
              onClick={() => activateCard(i)}
              onKeyDown={(e) => handleCardKeyDown(i, e)}
              onFocus={() => setFocusIndex(i)}
              onBlur={() => setFocusIndex(null)}
              data-index={i}
              aria-label={`${card.title}. ${card.summary}`}
            />
          ))}

          <div className="w-[calc(50%-10rem)] shrink-0 pointer-events-none sm:w-[calc(50%-12.5rem)]" />
        </div>
      
      {LANDING_COVERFLOW_CARDS.map((card, index) => {
        let distance = index - activeIndex
        if (distance > totalCards / 2) distance -= totalCards
        if (distance < -totalCards / 2) distance += totalCards

        const cardVisualState = getCardVisualState(distance, shouldReduceVisualEffects)
        const { isCenter, isAdjacent } = cardVisualState
        const cardAnimate = shouldReduceVisualEffects
          ? {
              x: cardVisualState.xOffset,
              z: cardVisualState.zOffset,
              rotateY: cardVisualState.rotateY,
              scale: cardVisualState.scale,
              opacity: cardVisualState.opacity,
            }
          : {
              x: cardVisualState.xOffset,
              z: cardVisualState.zOffset,
              rotateY: cardVisualState.rotateY,
              scale: cardVisualState.scale,
              opacity: cardVisualState.opacity,
              filter: `blur(${cardVisualState.blur}px)`,
            }
        
        let PreviewContent = ClarityPreview
        if (card.id === "sources") PreviewContent = SourcesPreview
        if (card.id === "transactions") PreviewContent = TransactionsPreview
        if (card.id === "quota") PreviewContent = QuotaPreview
        if (card.id === "subscriptions") PreviewContent = SubscriptionsPreview
        
        const colorClass = 
          card.theme === "orange" ? "text-orange-700 dark:text-orange-400" :
          card.theme === "slate" ? "text-slate-700 dark:text-slate-400" :
          card.theme === "cyan" ? "text-cyan-700 dark:text-cyan-400" :
          card.theme === "emerald" ? "text-emerald-700 dark:text-emerald-400" :
          "text-violet-700 dark:text-violet-400"

        return (
          <m.div
            key={card.id}
            aria-hidden={!isCenter}
            className={cn(
               "absolute flex flex-col rounded-[2.5rem] text-left",
               "h-[28rem] w-full max-w-[20rem] sm:h-[32rem] sm:max-w-[25rem]",
               shouldReduceVisualEffects
                ? "[will-change:transform,opacity]"
                : "[transform-style:preserve-3d] [will-change:transform,opacity,filter]",
               (!isCenter && !isAdjacent) && "max-sm:pointer-events-none max-sm:opacity-0",
               isCenter 
                ? "z-30 cursor-grab active:cursor-grabbing border-black/10 dark:border-white/10"
                : isAdjacent
                  ? "z-20 cursor-pointer border-black/5 dark:border-white/5"
                  : "z-10 cursor-pointer pointer-events-none sm:pointer-events-auto",
               focusIndex === index && "ring-2 ring-primary/30 outline-none"
            )}
            data-visual-state={cardVisualState.visualState}
            data-reduced-visual-effects={shouldReduceVisualEffects ? "true" : "false"}
            initial={false}
            animate={cardAnimate}
            transition={{
              type: "spring",
              stiffness: shouldReduceVisualEffects ? 115 : 70,
              damping: shouldReduceVisualEffects ? 24 : 21,
              mass: shouldReduceVisualEffects ? 1 : 1.45
            }}
          >
            <div className="relative h-full w-full rounded-[2.5rem]">
               <div 
                 className={cn(
                   "absolute inset-0 z-0 overflow-hidden rounded-[2.5rem] border transition-[background-color,border-color,box-shadow,opacity] duration-700",
                   shouldReduceVisualEffects ? "backdrop-blur-none" : "backdrop-blur-2xl",
                   isCenter 
                    ? "border-primary/18 bg-white/[0.96] shadow-[0_54px_130px_-34px_rgba(15,23,42,0.40),0_0_0_1px_rgba(14,165,233,0.08)] dark:border-cyan-200/18 dark:bg-zinc-950/[0.88] dark:shadow-[0_60px_150px_-34px_rgba(0,0,0,0.86),0_0_48px_-22px_rgba(34,211,238,0.5)] pointer-events-none"
                    : "border-black/[0.04] bg-white/[0.68] shadow-[0_34px_84px_-44px_rgba(15,23,42,0.36)] dark:border-white/[0.07] dark:bg-zinc-950/[0.48] dark:shadow-[0_34px_90px_-44px_rgba(0,0,0,0.76)] hover:bg-white/[0.76] dark:hover:bg-zinc-900/[0.58] pointer-events-none",
                   !isCenter && "opacity-[0.82]"
                 )}
               >
                 <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.84),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.36),transparent_28%),linear-gradient(155deg,rgba(226,232,240,0.26),transparent_56%)] dark:bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_28%),linear-gradient(155deg,rgba(255,255,255,0.03),transparent_56%)]" />
                 <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none shadow-[inset_0_2px_6px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.4)]" />
               </div>

               {isCenter && (
                 <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[2.5rem]">
                   <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(14,165,233,0.5),rgba(16,185,129,0.32),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(103,232,249,0.5),rgba(45,212,191,0.32),transparent)]" />
                   <div className="absolute -right-16 top-8 h-40 w-40 rounded-full bg-cyan-300/[0.08] blur-3xl dark:bg-cyan-200/[0.06]" />
                 </div>
               )}

               <FloatingPill text={card.title} colorClass={colorClass} />
               
               <div className="relative z-10 w-full h-full pointer-events-none overflow-hidden rounded-[2.5rem]">
                  <PreviewContent data={card.preview} isActive={isCenter || isAdjacent} />
               </div>
            </div>
          </m.div>
        )
      })}
      </div>

      <HeroPreviewRail
        cards={LANDING_COVERFLOW_CARDS}
        activeIndex={activeIndex}
        onSelect={activateCard}
      />
    </div>
  )
}
