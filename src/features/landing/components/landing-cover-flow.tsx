"use client"

import React, { startTransition, useState, useEffect, useRef } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowDownUp,
  BrainCircuit,
  CreditCard,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react"
import { AnimatePresence, m, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion"
import { cn } from "@/lib/utils"
import { LANDING_COVERFLOW_CARDS } from "../content"
import type { LandingCoverFlowCard, LandingPreviewData } from "../content"

const ICON_MAP: Record<string, LucideIcon> = {
  sources: WalletCards,
  transactions: ArrowDownUp,
  clarity: BrainCircuit,
  input: ShieldCheck,
  subscriptions: Sparkles
}

// ----------------------------------------------------------------------
// CYPHER EFFECT: Scrambled Text for Neural Data Nodes
// ----------------------------------------------------------------------
function ScrambledText({ text, isActive }: { text?: string; isActive: boolean }) {
  const [displayValue, setDisplayValue] = useState(isActive ? text : "")

  useEffect(() => {
    if (!isActive || !text) {
      setDisplayValue(text || "")
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

  return <span>{displayValue}</span>
}

// ----------------------------------------------------------------------
// COMMON ANIMATION VARIANTS FOR STAGGERING
// ----------------------------------------------------------------------
const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 }
  }
}
const listItemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 350, damping: 24 } }
}

// ----------------------------------------------------------------------
// PREVIEW COMPONENTS
// ----------------------------------------------------------------------

function FloatingPill({ text, colorClass = "text-white/90" }: { text: string, colorClass?: string }) {
  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center whitespace-nowrap rounded-full border border-black/[0.06] bg-white px-5 py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.08),_0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-[0_8px_30px_rgba(0,0,0,0.8),_inset_0_1px_1px_rgba(255,255,255,0.1)] transition-colors duration-500">
      <span className={cn("text-[8px] sm:text-[9px] font-black tracking-[0.2em] uppercase", colorClass)}>
        {text}
      </span>
    </div>
  )
}

function ClarityPreview({ data, isActive }: { data: LandingPreviewData; isActive: boolean }) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-5 py-6">
      <div className="space-y-5">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-cyan-300/12 dark:bg-cyan-300/[0.08]">
          <BrainCircuit className="h-3.5 w-3.5 text-cyan-700 dark:text-cyan-200" />
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-200">
            {data.badge}
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
            {data.title}
          </span>
          <div className="space-y-2">
            <p className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl font-mono">
              <ScrambledText text={data.customContent?.mainValue} isActive={isActive} />
            </p>
            <p className="max-w-[18rem] text-sm font-medium leading-relaxed text-foreground/62">
              {data.description}
            </p>
          </div>
        </div>

        <m.div 
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ delay: 0.4 }}
          className="rounded-[1.5rem] border border-black/6 bg-white/62 px-4 py-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-white/[0.04]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/42">
                {data.insightLabel}
              </p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                {data.insightText}
              </p>
            </div>
            <div className="rounded-full border border-emerald-400/22 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-300/14 dark:bg-emerald-300/[0.08] dark:text-emerald-100">
              {data.insightBadge}
            </div>
          </div>
        </m.div>
      </div>

      <div className="space-y-3">
        <m.div 
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 rounded-[1.8rem] border border-black/6 bg-white/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-white/10 dark:bg-white/[0.04]"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-foreground/58">
            <span>{data.customContent?.textParams?.[0]}</span>
            <span>{data.customContent?.textParams?.[1]}</span>
          </div>
          <div className="h-2 rounded-full bg-black/5 dark:bg-white/8">
            <m.div 
              initial={{ width: "0%" }}
              animate={isActive ? { width: "72%" } : { width: "0%" }}
              transition={{ delay: 0.7, type: "spring", damping: 30 }}
              className="h-full rounded-full bg-cyan-500 dark:bg-cyan-400" 
            />
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-foreground/58">
            <span>{data.customContent?.textParams?.[2]}</span>
            <span>{data.customContent?.textParams?.[3]}</span>
          </div>
          <div className="h-2 rounded-full bg-black/5 dark:bg-white/8">
            <m.div 
              initial={{ width: "0%" }}
              animate={isActive ? { width: "46%" } : { width: "0%" }}
              transition={{ delay: 0.8, type: "spring", damping: 30 }}
              className="h-full rounded-full bg-slate-400 dark:bg-white/32" 
            />
          </div>
        </m.div>
      </div>
    </div>
  )
}

function TransactionsPreview({ data, isActive }: { data: LandingPreviewData; isActive: boolean }) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-4 py-6">
      <div className="space-y-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-400/18 bg-slate-500/[0.08] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/10 dark:bg-white/[0.05]">
          <ArrowDownUp className="h-3.5 w-3.5 text-slate-700 dark:text-white/72" />
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-700 dark:text-white/72">
            {data.badge}
          </span>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-300">
            {data.title}
          </span>
          <p className="max-w-[18rem] text-sm font-medium leading-relaxed text-foreground/62">
            {data.description}
          </p>
        </div>
        <m.div 
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          className="rounded-[1.45rem] border border-black/6 bg-white/66 px-4 py-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-white/[0.04]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/42">{data.insightLabel}</p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                {data.insightText}
              </p>
            </div>
            <div className="rounded-full border border-slate-400/18 bg-slate-500/[0.08] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/78">
              {data.insightBadge}
            </div>
          </div>
        </m.div>
      </div>

      {isActive && (
        <m.div className="space-y-3" variants={listContainerVariants} initial="hidden" animate="visible">
          {data.items?.map((item) => (
            <m.div
              key={item.label}
              variants={listItemVariants}
              className="flex items-center justify-between rounded-[1.35rem] border border-black/6 bg-white/76 px-4 py-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white/[0.04]"
            >
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

function InputPreview({ data, isActive }: { data: LandingPreviewData; isActive: boolean }) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-4 py-6">
      <div className="space-y-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/18 bg-emerald-500/[0.08] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-emerald-300/12 dark:bg-emerald-300/[0.08]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-100" />
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-100">
            {data.badge}
          </span>
        </div>

        <m.div 
           animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
           transition={{ delay: 0.2 }}
           className="rounded-[1.45rem] border border-black/6 bg-white/76 px-4 py-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white/[0.04]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/46">{data.title}</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground/78">{data.customContent?.textParams?.[0]}</p>
            <span className="rounded-full border border-black/6 bg-black/3 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-foreground/52 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/62">
              {data.insightBadge}
            </span>
          </div>
        </m.div>

        <m.div 
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ delay: 0.4 }}
          className="rounded-[1.45rem] border border-emerald-400/22 bg-emerald-500/8 px-4 py-3 dark:border-emerald-300/12 dark:bg-emerald-300/[0.06]"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-100">
            {data.insightLabel}
          </p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
            {data.insightText}
          </p>
        </m.div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <m.div 
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ delay: 0.5 }}
            className="rounded-[1.2rem] border border-black/6 bg-white/72 px-4 py-3 text-sm font-black tracking-tight text-foreground dark:border-white/10 dark:bg-white/[0.04]"
          >
            {data.customContent?.textParams?.[1]}
          </m.div>
          <m.div 
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ delay: 0.6 }}
            className="rounded-[1.2rem] border border-black/6 bg-white/72 px-4 py-3 text-sm font-semibold text-foreground/64 dark:border-white/10 dark:bg-white/[0.04]"
          >
            {data.customContent?.textParams?.[2]}
          </m.div>
        </div>

        <m.div 
          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ delay: 0.7 }}
          className="mt-auto flex items-center justify-between rounded-[1.4rem] border border-emerald-400/24 bg-emerald-500/8 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-300/12 dark:bg-emerald-300/[0.06] dark:text-emerald-100"
        >
          <span>{data.customContent?.textParams?.[3]}</span>
          <span className="font-mono">
             <ScrambledText text={data.customContent?.textParams?.[4]} isActive={isActive} />
          </span>
        </m.div>
      </div>
    </div>
  )
}

function SubscriptionsPreview({ data, isActive }: { data: LandingPreviewData; isActive: boolean }) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-4 py-6">
      <div className="space-y-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-400/18 bg-violet-500/[0.08] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-violet-300/12 dark:bg-violet-300/[0.08]">
          <Sparkles className="h-3.5 w-3.5 text-violet-700 dark:text-violet-100" />
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-700 dark:text-violet-100">
            {data.badge}
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">
            {data.title}
          </span>
          <p className="max-w-[18rem] text-sm font-medium leading-relaxed text-foreground/62">
            {data.description}
          </p>
        </div>

        <m.div 
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          className="rounded-[1.45rem] border border-black/6 bg-white/66 px-4 py-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-white/[0.04]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/42">{data.insightLabel}</p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                {data.insightText}
              </p>
            </div>
            <div className="rounded-full border border-violet-400/18 bg-violet-500/[0.08] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-violet-700 dark:border-violet-300/12 dark:bg-violet-300/[0.08] dark:text-violet-100">
              {data.insightBadge}
            </div>
          </div>
        </m.div>
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
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-400/18 bg-orange-500/[0.08] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-orange-300/12 dark:bg-orange-300/[0.08]">
          <WalletCards className="h-3.5 w-3.5 text-orange-700 dark:text-orange-100" />
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-700 dark:text-orange-100">
            {data.badge}
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
            {data.title}
          </span>
          <p className="max-w-[18rem] text-sm font-medium leading-relaxed text-foreground/62">
            {data.description}
          </p>
        </div>

        <m.div 
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          className="rounded-[1.45rem] border border-black/6 bg-white/66 px-4 py-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-white/[0.04]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/42">{data.insightLabel}</p>
              <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                {data.insightText}
              </p>
            </div>
            <div className="rounded-full border border-orange-400/18 bg-orange-500/[0.08] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-orange-700 dark:border-orange-300/12 dark:bg-orange-300/[0.08] dark:text-orange-100">
              {data.insightBadge}
            </div>
          </div>
        </m.div>
      </div>

      {isActive && (
        <m.div className="space-y-3" variants={listContainerVariants} initial="hidden" animate="visible">
          {data.items?.map((item) => (
            <m.div
              key={item.label}
              variants={listItemVariants}
              className="flex items-center gap-3 rounded-[1.35rem] border border-black/6 bg-white/72 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-black/4 text-foreground/56 dark:bg-white/[0.06] dark:text-white/68">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/46">{item.note}</p>
              </div>
            </m.div>
          ))}
        </m.div>
      )}
    </div>
  )
}

function getGlowColor(theme: LandingCoverFlowCard["theme"]) {
  switch (theme) {
    case "emerald":
      return "#10b981" // emerald-500
    case "cyan":
      return "#06b6d4" // cyan-500
    case "violet":
      return "#8b5cf6" // violet-500
    case "orange":
      return "#f97316" // orange-500
    case "slate":
    default:
      return "#64748b" // slate-500
  }
}

export function LandingCoverFlow() {
  const [activeIndex, setActiveIndex] = useState(2)
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const totalCards = LANDING_COVERFLOW_CARDS.length
  
  // Parallax Tilt-Shift via Framer Motion Springs
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const isHoveredRaw = useMotionValue(0)

  const springConfig = { damping: 40, stiffness: 300, mass: 0.5 }
  const xSpring = useSpring(mouseX, springConfig)
  const ySpring = useSpring(mouseY, springConfig)
  const hoverSpring = useSpring(isHoveredRaw, springConfig)

  const parallaxRotateX = useTransform(ySpring, [-0.5, 0.5], [6, -6])
  const parallaxRotateY = useTransform(xSpring, [-0.5, 0.5], [-8, 8])

  // Radial Glare Tracker
  const glareX = useTransform(xSpring, [-0.5, 0.5], ["-20%", "120%"])
  const glareY = useTransform(ySpring, [-0.5, 0.5], ["-20%", "120%"])
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.4) 0%, transparent 60%)`

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
        sliderRef.current.scrollTo({ left: index * cardWidth, behavior: "smooth" })
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
    const cardWidth = slider.children[1]?.clientWidth || 304 // approx 19rem
    const index = Math.round(slider.scrollLeft / cardWidth)
    
    if (index !== activeIndex && index >= 0 && index < totalCards) {
      startTransition(() => {
        setActiveIndex(index)
      })
    }
  }

  const handleCardKeyDown = (index: number, event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault()
    }
  }
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    isHoveredRaw.set(1)
    const rect = e.currentTarget.getBoundingClientRect()
    // coordinate normalizzate tra -0.5 e 0.5 in base al centro container
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    isHoveredRaw.set(0)
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <div 
      className="relative mt-8 flex w-full flex-col items-center gap-6 overflow-visible sm:mt-16"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative flex h-[32rem] w-full items-center justify-center overflow-visible [perspective:2400px] sm:h-[36rem]">
      
      {/* THE INVISIBLE NATIVE SNAP SCROLLER */}
      <div 
        ref={sliderRef}
        onScroll={handleScroll}
        className="absolute inset-x-0 inset-y-0 z-[40] flex overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-x"
        tabIndex={0}
      >
        {/* Left Spacer */}
        <div className="w-[calc(50%-9.5rem)] shrink-0 sm:w-[calc(50%-11rem)] pointer-events-none" />
        
        {LANDING_COVERFLOW_CARDS.map((_, i) => (
          <div 
            key={i} 
            role="button"
            tabIndex={0}
            className="h-full w-[19rem] shrink-0 snap-center sm:w-[22rem] cursor-grab active:cursor-grabbing outline-none"
            onClick={() => activateCard(i)}
            onKeyDown={(e) => handleCardKeyDown(i, e)}
            onFocus={() => setFocusIndex(i)}
            onBlur={() => setFocusIndex(null)}
            data-index={i}
            aria-label={`Visualizza scheda ${i + 1}`}
          />
        ))}

        {/* Right Spacer */}
        <div className="w-[calc(50%-9.5rem)] shrink-0 sm:w-[calc(50%-11rem)] pointer-events-none" />
      </div>
      
      {LANDING_COVERFLOW_CARDS.map((card, index) => {
        let distance = index - activeIndex
        if (distance > totalCards / 2) distance -= totalCards
        if (distance < -totalCards / 2) distance += totalCards

        const isCenter = distance === 0
        const isLeft1 = distance === -1
        const isRight1 = distance === 1
        const isLeft2 = distance === -2
        const isAdjacent = isLeft1 || isRight1

        const xOffset = isCenter ? 0 : isLeft1 ? -220 : isRight1 ? 220 : isLeft2 ? -380 : 380
        const zOffset = isCenter ? 0 : (isLeft1 || isRight1) ? -200 : -450
        const rotateY = isCenter ? 0 : isLeft1 ? 40 : isRight1 ? -40 : isLeft2 ? 65 : -65
        const scale = isCenter ? 1 : (isLeft1 || isRight1) ? 0.88 : 0.72
        const opacityTarget = isCenter ? 1 : (isLeft1 || isRight1) ? 0.35 : 0.05
        
        // Depth-Of-Field calculation - Blur out distance
        const blurTarget = Math.abs(distance) * 5 // 0, 5px, 10px ...
        
        let PreviewContent = ClarityPreview
        if (card.id === "sources") PreviewContent = SourcesPreview
        if (card.id === "transactions") PreviewContent = TransactionsPreview
        if (card.id === "input") PreviewContent = InputPreview
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
            aria-hidden="true"
            className={cn(
               "absolute flex flex-col rounded-[2.5rem] text-left",
               "w-full max-w-[19rem] sm:max-w-[22rem] h-[26rem] sm:h-[30rem]",
               (!isCenter && !isAdjacent) && "max-sm:pointer-events-none max-sm:opacity-0",
               isCenter 
                ? "z-30 cursor-grab active:cursor-grabbing border-black/10 dark:border-white/10"
                : isAdjacent
                  ? "z-20 cursor-pointer border-black/5 dark:border-white/5"
                  : "z-10 cursor-pointer pointer-events-none sm:pointer-events-auto",
               focusIndex === index && "ring-2 ring-primary/30 outline-none"
            )}
            initial={false}
            animate={{
              x: xOffset,
              z: zOffset,
              rotateY: rotateY,
              scale: scale,
              opacity: opacityTarget,
              filter: `blur(${blurTarget}px)` // Cinematic Depth Of Field
            }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 20,
              mass: 1.8
            }}
            // Here we overlay the Parallax 3D Tracker ONLY on the active element wrapper!
            style={{ 
              transformStyle: "preserve-3d", 
              willChange: "transform, opacity, filter"
            }}
          >
            <m.div 
               className="relative w-full h-full rounded-[2.5rem]"
               style={{ 
                 rotateX: parallaxRotateX,
                 rotateY: parallaxRotateY,
                 transformStyle: "preserve-3d"
               }}
            >
               <div 
                 className={cn(
                   "absolute inset-0 z-0 overflow-hidden rounded-[2.5rem] border backdrop-blur-3xl transition-[background-color,border-color,box-shadow,opacity] duration-1000",
                   isCenter 
                    ? "bg-white/[0.93] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] dark:bg-zinc-950/80 dark:shadow-[0_40px_90px_-20px_rgba(0,0,0,0.7)] border-black/5 dark:border-white/10 pointer-events-none"
                    : "bg-white/60 shadow-2xl dark:bg-zinc-950/40 border-black/5 dark:border-white/5 hover:bg-white/80 dark:hover:bg-zinc-900/60 pointer-events-none",
                   !isCenter && "opacity-80"
                 )}
               >
                 {/* -----------------------------------------------------
                     The Reactive 3D Glare (Mouse Spotlight) 
                     ----------------------------------------------------- */}
                 <m.div 
                   className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay transition-opacity duration-1000"
                   style={{ 
                     background: glareBackground,
                     opacity: isCenter ? hoverSpring : 0
                   }}
                 />
                 
                 <AnimatePresence>
                   {isCenter && (
                     <m.div
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       transition={{ duration: 0.5 }}
                       className="absolute inset-0 pointer-events-none"
                     >
                       <div className="absolute inset-x-0 -bottom-32 h-64 blur-[90px] transition-colors duration-1000"
                            style={{
                              backgroundColor: getGlowColor(card.theme),
                              opacity: 0.15
                            }} 
                       />
                     </m.div>
                   )}
                 </AnimatePresence>

                 <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none shadow-[inset_0_2px_6px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.4)]" />
               </div>

               <FloatingPill text={card.title} colorClass={colorClass} />
               
               <div className="relative z-10 w-full h-full pointer-events-none overflow-hidden rounded-[2.5rem]">
                  <PreviewContent data={card.preview} isActive={isCenter} />
               </div>
            </m.div>
          </m.div>
        )
      })}
      </div>

      {/* Global Bottom interaction hint */}
      <m.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="pointer-events-none flex justify-center -mt-8 sm:-mt-6 z-20"
      >
        <div className="rounded-full border border-black/6 bg-white/62 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/52 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05] dark:text-white/58 shadow-sm">
          Scorri o clicca ai lati
        </div>
      </m.div>

      <div className="flex flex-wrap items-center justify-center gap-2 px-4" aria-label="Seleziona anteprima hero">
        {LANDING_COVERFLOW_CARDS.map((card, index) => {
          const Icon = ICON_MAP[card.id] || BrainCircuit
          const isActive = index === activeIndex

          return (
            <button
              key={`selector-${card.id}`}
              type="button"
              onClick={() => activateCard(index)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
                isActive
                  ? "border-primary/24 bg-primary/10 text-foreground shadow-[0_16px_30px_-22px_rgba(14,165,168,0.42)] dark:border-white/12 dark:bg-white/[0.06] dark:text-white"
                  : "border-black/6 bg-white/55 text-foreground/58 hover:border-black/10 hover:text-foreground dark:border-white/10 dark:bg-white/[0.04] dark:text-white/58 dark:hover:text-white/84"
              )}
              aria-pressed={isActive}
            >
              <Icon className="h-3.5 w-3.5" />
              {card.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}
