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
  type Variants
} from "framer-motion"
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
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 350, damping: 24 } }
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
  scenario:
    "border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-800 dark:border-emerald-300/12 dark:bg-emerald-300/[0.07] dark:text-emerald-100",
} as const

const METRIC_BAR_CLASS = {
  income: "bg-[linear-gradient(90deg,rgba(34,211,238,0.72),rgba(14,165,233,0.9))]",
  expense: "bg-[linear-gradient(90deg,rgba(148,163,184,0.72),rgba(203,213,225,0.92))]",
  scenario: "bg-[linear-gradient(90deg,rgba(16,185,129,0.7),rgba(45,212,191,0.92))]",
} as const

function ClarityPreview({ data, isActive }: { data: LandingPreviewData; isActive: boolean }) {
  const preview = LANDING_HERO_PREVIEW

  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-5 py-5 sm:px-6 sm:py-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-cyan-300/12 dark:bg-cyan-300/[0.08]">
            <BrainCircuit className="h-3.5 w-3.5 text-cyan-700 dark:text-cyan-200" />
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-200">
              {data.badge}
            </span>
          </div>
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

        <m.div
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ delay: 0.32, type: "spring", damping: 28 }}
        >
          <PreviewGlass tone="neutral" className="rounded-[1.55rem] px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/18 bg-cyan-500/10 text-cyan-700 dark:border-cyan-300/12 dark:bg-cyan-300/[0.08] dark:text-cyan-100">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/42">
                  {data.insightLabel}
                </p>
                <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                  {preview.formula}
                </p>
              </div>
            </div>
          </PreviewGlass>
        </m.div>
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

        <m.div
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
          transition={{ delay: 0.74, type: "spring", damping: 28 }}
          className="rounded-[1.35rem] border border-emerald-400/18 bg-emerald-500/[0.07] px-4 py-3 text-[12px] font-semibold leading-relaxed text-emerald-800 dark:border-emerald-300/12 dark:bg-emerald-300/[0.06] dark:text-emerald-100"
        >
          {data.customContent?.calculationNote}
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
        <div className="space-y-2.5">
          <h3 className="max-w-[17rem] text-2xl font-black tracking-tight text-foreground sm:text-[1.7rem]">
            {data.title}
          </h3>
          <p className="max-w-[18.5rem] text-[15px] font-medium leading-relaxed text-foreground/64">
            {data.description}
          </p>
        </div>
        <m.div 
          animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        >
          <PreviewGlass tone="neutral" className="rounded-[1.45rem] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/42">{data.insightLabel}</p>
                <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                  {data.insightText}
                </p>
              </div>
              <div className="rounded-full border border-slate-400/18 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.84))] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] dark:text-white/78">
                {data.insightBadge}
              </div>
            </div>
          </PreviewGlass>
        </m.div>
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

        <div className="space-y-2.5">
          <h3 className="max-w-[17rem] text-2xl font-black tracking-tight text-foreground sm:text-[1.7rem]">
            {data.title}
          </h3>
          <p className="max-w-[18.5rem] text-[15px] font-medium leading-relaxed text-foreground/64">
            {data.description}
          </p>
        </div>

        <m.div 
           animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
           transition={{ delay: 0.2 }}
           className="rounded-[1.45rem] border border-black/6 bg-white/76 px-4 py-3 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white/[0.04]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/46">Spesa provata</p>
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

        <div className="space-y-2.5">
          <h3 className="max-w-[17rem] text-2xl font-black tracking-tight text-foreground sm:text-[1.7rem]">
            {data.title}
          </h3>
          <p className="max-w-[18.5rem] text-[15px] font-medium leading-relaxed text-foreground/64">
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

        <div className="space-y-2.5">
          <h3 className="max-w-[17rem] text-2xl font-black tracking-tight text-foreground sm:text-[1.7rem]">
            {data.title}
          </h3>
          <p className="max-w-[18.5rem] text-[15px] font-medium leading-relaxed text-foreground/64">
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

export function LandingCoverFlow() {
  const [activeIndex, setActiveIndex] = useState(2)
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const totalCards = LANDING_COVERFLOW_CARDS.length

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
          sliderRef.current.scrollTo({ left: index * cardWidth, behavior: "smooth" })
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

        const isCenter = distance === 0
        const isLeft1 = distance === -1
        const isRight1 = distance === 1
        const isLeft2 = distance === -2
        const isAdjacent = isLeft1 || isRight1

        const xOffset = isCenter ? 0 : isLeft1 ? -250 : isRight1 ? 250 : isLeft2 ? -430 : 430
        const zOffset = isCenter ? 20 : (isLeft1 || isRight1) ? -220 : -500
        const rotateY = isCenter ? 0 : isLeft1 ? 42 : isRight1 ? -42 : isLeft2 ? 68 : -68
        const scale = isCenter ? 1 : (isLeft1 || isRight1) ? 0.84 : 0.68
        const opacityTarget = isCenter ? 1 : (isLeft1 || isRight1) ? 0.28 : 0.04
        const blurTarget = Math.abs(distance) * 7
        
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
            aria-hidden={!isCenter}
            className={cn(
               "absolute flex flex-col rounded-[2.5rem] text-left",
               "h-[28rem] w-full max-w-[20rem] sm:h-[32rem] sm:max-w-[25rem]",
               "[transform-style:preserve-3d] [will-change:transform,opacity,filter]",
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
          >
            <div className="relative h-full w-full rounded-[2.5rem]">
               <div 
                 className={cn(
                   "absolute inset-0 z-0 overflow-hidden rounded-[2.5rem] border backdrop-blur-3xl transition-[background-color,border-color,box-shadow,opacity] duration-1000",
                   isCenter 
                    ? "border-black/[0.045] bg-white/[0.94] shadow-[0_54px_130px_-34px_rgba(15,23,42,0.36)] dark:border-white/12 dark:bg-zinc-950/[0.84] dark:shadow-[0_60px_150px_-34px_rgba(0,0,0,0.82)] pointer-events-none"
                    : "border-black/[0.035] bg-white/[0.54] shadow-[0_34px_84px_-44px_rgba(15,23,42,0.34)] dark:border-white/[0.055] dark:bg-zinc-950/[0.34] dark:shadow-[0_34px_90px_-44px_rgba(0,0,0,0.72)] hover:bg-white/[0.72] dark:hover:bg-zinc-900/[0.52] pointer-events-none",
                   !isCenter && "opacity-[0.72]"
                 )}
               >
                 <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.84),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.36),transparent_28%),linear-gradient(155deg,rgba(226,232,240,0.26),transparent_56%)] dark:bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_28%),linear-gradient(155deg,rgba(255,255,255,0.03),transparent_56%)]" />
                 <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none shadow-[inset_0_2px_6px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.4)]" />
               </div>

               <FloatingPill text={card.title} colorClass={colorClass} />
               
               <div className="relative z-10 w-full h-full pointer-events-none overflow-hidden rounded-[2.5rem]">
                  <PreviewContent data={card.preview} isActive={isCenter} />
               </div>
            </div>
          </m.div>
        )
      })}
      </div>

      <div className="z-20 -mt-6 flex items-center justify-center gap-2 px-4 sm:-mt-4" aria-label="Seleziona anteprima hero">
        {LANDING_COVERFLOW_CARDS.map((card, index) => {
          const isActive = index === activeIndex

          return (
            <button
              key={`selector-${card.id}`}
              type="button"
              onClick={() => activateCard(index)}
              className={cn(
                "h-2.5 rounded-full border transition-[width,background-color,border-color,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                isActive
                  ? "w-7 border-primary/40 bg-primary/70 opacity-100 dark:border-cyan-200/45 dark:bg-cyan-200/80"
                  : "w-2.5 border-black/10 bg-foreground/18 opacity-45 hover:opacity-75 dark:border-white/10 dark:bg-white/28"
              )}
              aria-pressed={isActive}
              aria-label={card.title}
            >
              <span className="sr-only">{card.title}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
