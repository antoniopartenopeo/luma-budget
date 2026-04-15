"use client"

import { useEffect, useState } from "react"
import {
  ArrowDownUp,
  BrainCircuit,
  Check,
  Sparkles,
  TrendingUp
} from "lucide-react"
import { m, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import { cn } from "@/lib/utils"
import {
  LANDING_DIFFERENCE_SECTION,
  LANDING_DIFFERENTIATORS
} from "../content"

const DEMO_TRANSACTIONS = [
  { id: "salary", label: "Stipendio", meta: "entrata stabile", amount: "+ € 2.300", kind: "positive" },
  { id: "rent", label: "Affitto", meta: "ricorrenza", amount: "- € 690", kind: "neutral" },
  { id: "groceries", label: "Supermercato", meta: "variabile", amount: "- € 84", kind: "neutral" },
  { id: "gym", label: "Palestra", meta: "ricorrenza", amount: "- € 29", kind: "neutral" },
  { id: "weekend", label: "Weekend fuori", meta: "scenario", amount: "- € 180", kind: "scenario" }
] as const

const INSIGHT_STAGES = [
  {
    id: "early",
    label: "base minima",
    confidence: 24,
    summary: "Troppi frammenti. Il Brain vede segnali isolati ma non il mese intero."
  },
  {
    id: "emerging",
    label: "ritmo in emersione",
    confidence: 47,
    summary: "Le prime ricorrenze emergono. Il grafico inizia a prendere una forma leggibile."
  },
  {
    id: "readable",
    label: "mese leggibile",
    confidence: 72,
    summary: "Entrate e pesi fissi si consolidano. Il Brain puo stimare il margine con piu precisione."
  },
  {
    id: "mature",
    label: "brain maturo",
    confidence: 91,
    summary: "Ora il sistema sblocca insight e ti dice quanto spazio decisionale ti resta davvero."
  }
] as const

const UNLOCKS = [
  { label: "Ricorrenze riconosciute", threshold: 2 },
  { label: "Peso del mese leggibile", threshold: 3 },
  { label: "Scenario decisionale disponibile", threshold: 4 }
] as const

function TransactionFeedDemo({ step }: { step: number }) {
  const visibleTransactions = DEMO_TRANSACTIONS.slice(0, step + 2)

  return (
    <div className="rounded-[1.65rem] border border-black/8 bg-black/[0.05] p-4 dark:border-white/10 dark:bg-black/22">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground/46 dark:text-white/48">
            Feed transazioni
          </p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-foreground dark:text-white">
            Il Brain si nutre di segnali progressivi
          </p>
        </div>
        <div className="rounded-full border border-black/6 bg-white/[0.05] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-foreground/62 dark:border-white/8 dark:bg-white/[0.04] dark:text-white/66">
          {visibleTransactions.length} input
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {visibleTransactions.map((transaction, index) => (
          <div
            key={transaction.id}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[1rem] border border-black/6 bg-white/[0.04] px-3 py-3 dark:border-white/8 dark:bg-white/[0.03]"
            style={{ opacity: 0.8 + index * 0.04 }}
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-[0.9rem] border ${
              transaction.kind === "positive"
                ? "border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-700 dark:border-emerald-300/12 dark:bg-emerald-300/[0.08] dark:text-emerald-100"
                : transaction.kind === "scenario"
                  ? "border-cyan-400/18 bg-cyan-500/[0.08] text-cyan-700 dark:border-cyan-300/12 dark:bg-cyan-300/[0.08] dark:text-cyan-100"
                  : "border-black/6 bg-black/[0.03] text-foreground/52 dark:border-white/8 dark:bg-white/[0.03] dark:text-white/58"
            }`}>
              {transaction.kind === "scenario" ? <Sparkles className="h-4 w-4" /> : <ArrowDownUp className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight text-foreground dark:text-white">
                {transaction.label}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-foreground/46 dark:text-white/48">
                {transaction.meta}
              </p>
            </div>
            <div className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
              transaction.kind === "positive"
                ? "border border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-700 dark:border-emerald-300/12 dark:bg-emerald-300/[0.08] dark:text-emerald-100"
                : transaction.kind === "scenario"
                  ? "border border-cyan-400/18 bg-cyan-500/[0.08] text-cyan-700 dark:border-cyan-300/12 dark:bg-cyan-300/[0.08] dark:text-cyan-100"
                  : "border border-black/6 bg-white/[0.05] text-foreground/64 dark:border-white/8 dark:bg-white/[0.04] dark:text-white/66"
            }`}>
              {transaction.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BrainMaturityMeter({ step }: { step: number }) {
  const stage = INSIGHT_STAGES[step]

  return (
    <div className="rounded-[1.65rem] border border-cyan-400/14 bg-cyan-500/[0.06] p-4 dark:border-cyan-300/12 dark:bg-cyan-300/[0.08]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700/78 dark:text-cyan-100/72">
            Brain maturity
          </p>
          <p className="mt-1 text-lg font-black tracking-tight text-foreground dark:text-white">
            {stage.label}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-cyan-400/18 bg-cyan-500/[0.08] text-cyan-700 dark:border-cyan-300/12 dark:bg-cyan-300/[0.08] dark:text-cyan-100">
          <BrainCircuit className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700/78 dark:text-cyan-100/72">
            Fiducia
          </p>
          <p className="mt-1 text-3xl font-black tracking-tight text-foreground dark:text-white">
            {stage.confidence}%
          </p>
        </div>
        <div className="rounded-full border border-black/6 bg-white/[0.06] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-foreground/68 dark:border-white/8 dark:bg-white/[0.04] dark:text-white/66">
          insight growth
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/6 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-cyan-500 shadow-[0_0_18px_rgba(34,211,238,0.35)] dark:bg-cyan-300"
          style={{ width: `${stage.confidence}%` }}
        />
      </div>

      <p className="mt-4 text-sm font-medium leading-relaxed text-foreground/72 dark:text-white/72">
        {stage.summary}
      </p>
    </div>
  )
}

function InsightChartDemo({ step }: { step: number }) {
  const stage = INSIGHT_STAGES[step]
  const unlockedScenario = step >= 3

  return (
    <div className="rounded-[1.65rem] border border-black/8 bg-black/[0.05] p-4 dark:border-white/10 dark:bg-black/22">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground/46 dark:text-white/48">
            Insight chart
          </p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-foreground dark:text-white">
            Il grafico si forma con il contesto
          </p>
        </div>
        <div className="rounded-full border border-black/6 bg-white/[0.05] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-foreground/62 dark:border-white/8 dark:bg-white/[0.04] dark:text-white/66">
          {stage.label}
        </div>
      </div>

      <div className="mt-4 rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4 dark:bg-white/[0.02]">
        <div className="relative h-44">
          <div className="absolute inset-0">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="absolute inset-x-0 border-t border-black/5 dark:border-white/6" style={{ top: `${row * 33}%` }} />
            ))}
          </div>

          <svg viewBox="0 0 360 160" className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <linearGradient id="insight-line" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(34,211,238,0.38)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0.95)" />
              </linearGradient>
              <linearGradient id="insight-fill" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(34,211,238,0.22)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0.02)" />
              </linearGradient>
            </defs>

            <path
              d={step === 0
                ? "M20 120 C80 118, 110 122, 160 112 S250 108, 340 104"
                : step === 1
                  ? "M20 122 C70 120, 110 110, 160 96 S250 88, 340 80"
                  : step === 2
                    ? "M20 124 C72 118, 112 98, 160 82 S248 74, 340 64"
                    : "M20 126 C70 116, 112 96, 160 78 S248 62, 340 48"}
              fill="none"
              stroke="url(#insight-line)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            <path
              d={step === 0
                ? "M20 120 C80 118, 110 122, 160 112 S250 108, 340 104 L340 160 L20 160 Z"
                : step === 1
                  ? "M20 122 C70 120, 110 110, 160 96 S250 88, 340 80 L340 160 L20 160 Z"
                  : step === 2
                    ? "M20 124 C72 118, 112 98, 160 82 S248 74, 340 64 L340 160 L20 160 Z"
                    : "M20 126 C70 116, 112 96, 160 78 S248 62, 340 48 L340 160 L20 160 Z"}
              fill="url(#insight-fill)"
            />

            {step >= 1 ? <circle cx="110" cy="104" r="5" fill="rgba(34,211,238,0.9)" /> : null}
            {step >= 2 ? <circle cx="196" cy="74" r="5" fill="rgba(34,211,238,0.9)" /> : null}
            {step >= 3 ? <circle cx="304" cy="54" r="6" fill="rgba(16,185,129,0.95)" /> : null}
          </svg>

          {step >= 1 ? (
            <div className="absolute left-[28%] top-[54%] rounded-full border border-black/6 bg-white/72 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-foreground/66 dark:border-white/8 dark:bg-white/[0.06] dark:text-white/68">
              ricorrenza
            </div>
          ) : null}

          {step >= 2 ? (
            <div className="absolute left-[48%] top-[22%] rounded-full border border-cyan-400/18 bg-cyan-500/[0.08] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-700 dark:border-cyan-300/12 dark:bg-cyan-300/[0.08] dark:text-cyan-100">
              margine leggibile
            </div>
          ) : null}

          {unlockedScenario ? (
            <div className="absolute right-[3%] top-[8%] rounded-full border border-emerald-400/18 bg-emerald-500/[0.08] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-300/12 dark:bg-emerald-300/[0.08] dark:text-emerald-100">
              scenario sostenibile
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function UnlocksPanel({ step }: { step: number }) {
  return (
    <div className="rounded-[1.65rem] border border-black/8 bg-black/[0.05] p-4 dark:border-white/10 dark:bg-black/22">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground/46 dark:text-white/48">
            Insight unlocks
          </p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-foreground dark:text-white">
            Cosa il Brain sa fare adesso
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-700 dark:border-emerald-300/12 dark:bg-emerald-300/[0.08] dark:text-emerald-100">
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {UNLOCKS.map((unlock) => {
          const unlocked = step >= unlock.threshold

          return (
            <div
              key={unlock.label}
              className={cn(
                "flex items-center justify-between rounded-[1rem] border px-3 py-3 transition-[opacity,border-color,background-color] duration-300",
                unlocked
                  ? "border-emerald-400/18 bg-emerald-500/[0.08]"
                  : "border-black/6 bg-white/[0.03] opacity-62 dark:border-white/8 dark:bg-white/[0.02]"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[0.85rem] border",
                  unlocked
                    ? "border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-700 dark:border-emerald-300/12 dark:bg-emerald-300/[0.08] dark:text-emerald-100"
                    : "border-black/6 bg-black/[0.03] text-foreground/52 dark:border-white/8 dark:bg-white/[0.03] dark:text-white/58"
                )}>
                  {unlocked ? <Check className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                </div>
                <span className="text-sm font-semibold tracking-tight text-foreground dark:text-white">
                  {unlock.label}
                </span>
              </div>
              <span className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]",
                unlocked
                  ? "border border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-700 dark:border-emerald-300/12 dark:bg-emerald-300/[0.08] dark:text-emerald-100"
                  : "border border-black/6 bg-white/[0.05] text-foreground/64 dark:border-white/8 dark:bg-white/[0.04] dark:text-white/66"
              )}>
                {unlocked ? "unlocked" : "pending"}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InsightSupportCard({
  title,
  copy,
  eyebrow,
  detail,
  index
}: {
  title: string
  copy: string
  eyebrow: string
  detail: string
  index: number
}) {
  const accent = index === 1
    ? "border-slate-400/18 bg-white/[0.05] dark:border-white/8 dark:bg-white/[0.03]"
    : "border-violet-400/16 bg-violet-500/[0.07] dark:border-violet-300/12 dark:bg-violet-300/[0.08]"

  return (
    <div className={cn("rounded-[2rem] border p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.26)]", accent)}>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground/46 dark:text-white/48">
        {eyebrow}
      </p>
      <h3 className="mt-3 max-w-[12ch] text-3xl font-black tracking-tight text-foreground dark:text-white">
        {title}
      </h3>
      <p className="mt-3 max-w-[24ch] text-sm leading-relaxed text-foreground/74 dark:text-white/74">
        {copy}
      </p>

      <div className="mt-8 rounded-[1.35rem] border border-black/6 bg-black/[0.04] p-4 dark:border-white/8 dark:bg-black/18">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground/46 dark:text-white/48">
          Demo
        </p>
        <p className="mt-2 text-sm font-semibold tracking-tight text-foreground dark:text-white">
          {detail}
        </p>
      </div>
    </div>
  )
}

export function LandingDifferentiatorCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-10%" })
  const prefersReducedMotion = useReducedMotion() ?? false
  const [step, setStep] = useState(prefersReducedMotion ? 3 : 0)
  const heroItem = LANDING_DIFFERENTIATORS[0]

  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    const interval = window.setInterval(() => {
      setStep((current) => (current >= 3 ? 0 : current + 1))
    }, 2400)

    return () => window.clearInterval(interval)
  }, [prefersReducedMotion])

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
          <h2 className="mx-auto mt-4 max-w-[14ch] text-4xl font-black leading-[0.96] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {LANDING_DIFFERENCE_SECTION.title}
          </h2>
          <p className="mx-auto mt-5 max-w-[44rem] text-[15px] leading-relaxed text-muted-foreground sm:text-[17px]">
            L&apos;intelligenza non arriva tutta insieme. Si costruisce mentre il Brain assorbe transazioni, riconosce ricorrenze e sblocca insight piu utili.
          </p>
        </m.div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="overflow-hidden rounded-[2.6rem] border border-black/8 bg-white/[0.04] p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.26)] dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
            <div className="mb-6 max-w-[42rem]">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-600/78 dark:text-cyan-100/72">
                {heroItem.kicker}
              </p>
              <h3 className="mt-3 max-w-[12ch] text-3xl font-black tracking-tight text-foreground dark:text-white sm:text-4xl">
                {heroItem.title}
              </h3>
              <p className="mt-3 max-w-[36rem] text-[15px] leading-relaxed text-foreground/74 dark:text-white/74">
                {heroItem.numaLabel}
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
              <TransactionFeedDemo step={step} />
              <div className="space-y-4">
                <BrainMaturityMeter step={step} />
                <InsightChartDemo step={step} />
              </div>
            </div>

            <div className="mt-4">
              <UnlocksPanel step={step} />
            </div>
          </div>

          <div className="grid gap-6">
            <InsightSupportCard
              index={1}
              eyebrow={LANDING_DIFFERENTIATORS[1].kicker}
              title={LANDING_DIFFERENTIATORS[1].title}
              copy={LANDING_DIFFERENTIATORS[1].numaLabel}
              detail="Ricorrenze e cadenze non sono piu righe isolate: diventano pattern con peso reale."
            />
            <InsightSupportCard
              index={2}
              eyebrow={LANDING_DIFFERENTIATORS[2].kicker}
              title={LANDING_DIFFERENTIATORS[2].title}
              copy={LANDING_DIFFERENTIATORS[2].numaLabel}
              detail="Quando la base e sufficiente, il Brain restituisce una risposta decisionale e non solo un dato."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
