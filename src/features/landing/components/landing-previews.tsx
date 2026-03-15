"use client"

import { useEffect, useState, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { BrainCircuit, CalendarClock, CheckCircle2, FileSpreadsheet, FlaskConical, ShieldCheck } from "lucide-react"
import { formatCents } from "@/domain/money"
import { KpiCard } from "@/components/patterns/kpi-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SpendingCompositionCard } from "@/features/dashboard/components/charts/spending-composition-card"
import { TransactionRowCard } from "@/features/transactions/components/transaction-row-card"
import {
  DEMO_BRAIN_STATES,
  DEMO_CATEGORY_SUMMARY,
  DEMO_SCENARIOS,
  DEMO_TRANSACTIONS,
  LANDING_STORY_POINTS,
  type LandingDemoStep
} from "../data"

function useCycleIndex(total: number, isActive = true) {
  const prefersReducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!isActive) {
      return
    }

    if (prefersReducedMotion || total <= 1) {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % total)
    }, 1900)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isActive, prefersReducedMotion, total])

  return activeIndex
}

function PreviewFrame({
  eyebrow,
  title,
  description,
  statusLabel,
  footerNote,
  children,
  className
}: {
  eyebrow: string
  title: string
  description: string
  statusLabel: string
  footerNote?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("surface-strong overflow-hidden p-5 sm:p-6", className)}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
            {eyebrow}
          </Badge>
          <Badge variant="outline" className="border-white/35 bg-white/50 dark:border-white/12 dark:bg-white/[0.05]">
            {statusLabel}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">{title}</h3>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">{children}</div>

      {footerNote ? (
        <div className="mt-5 rounded-[1.4rem] border border-primary/12 bg-primary/10 px-4 py-3">
          <p className="text-sm font-semibold leading-relaxed text-foreground">{footerNote}</p>
        </div>
      ) : null}
    </div>
  )
}

function AnimatedMessage({ message }: { message: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={message}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="text-sm font-semibold leading-relaxed text-foreground"
      >
        {message}
      </motion.p>
    </AnimatePresence>
  )
}

function SignalStrip({
  items,
  activeIndex
}: {
  items: readonly string[]
  activeIndex: number
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => {
        const isActive = index === activeIndex

        return (
          <motion.div
            key={item}
            animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0.98, opacity: 0.68 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]",
              isActive
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-white/28 bg-white/55 text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-primary animate-ping-slow" : "bg-muted-foreground/50")} />
            {item}
          </motion.div>
        )
      })}
    </div>
  )
}

export function LandingHeroConsole() {
  const activeIndex = useCycleIndex(LANDING_STORY_POINTS.length)
  const heroSignals = [
    "Nasce per leggere il mese",
    "Protegge il dato",
    "Unisce presente e futuro"
  ] as const
  const heroMessages = [
    "Numa nasce per chi vuole capire il mese senza perdersi in righe, categorie e schermate scollegate.",
    "La privacy non arriva dopo: il punto di partenza e il dispositivo, non il cloud.",
    "Dentro lo stesso prodotto trovi lettura del presente, stime future e quota sostenibile per una nuova spesa fissa."
  ] as const

  return (
    <PreviewFrame
      eyebrow="Perche nasce Numa"
      title="Un'app pensata per dare contesto ai numeri"
      description="L'idea di partenza non e mostrare piu grafici. E aiutarti a capire il mese, proteggere il dato e darti strumenti utili prima di prendere nuove decisioni."
      statusLabel="Origine del prodotto"
      footerNote="Numa parte da qui: capire meglio il presente, stimare il dopo e valutare una nuova quota fissa senza perdere il controllo del dato."
    >
      <SignalStrip items={heroSignals} activeIndex={activeIndex} />

      <div className="rounded-[1.5rem] border border-white/28 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
        <AnimatedMessage message={heroMessages[activeIndex] ?? heroMessages[0]} />
      </div>

      <div className="space-y-3">
        {LANDING_STORY_POINTS.map((point, index) => {
          const isCurrent = index === activeIndex

          return (
            <motion.div
              key={point.title}
              animate={isCurrent ? { opacity: 1, y: 0 } : { opacity: 0.8, y: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "surface-subtle p-4 sm:p-5",
                isCurrent && "ring-1 ring-primary/20 shadow-lg shadow-primary/10"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/10 text-primary">
                  <point.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-base font-bold text-foreground">{point.title}</p>
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">{point.description}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </PreviewFrame>
  )
}

function ImportPreview({ isActive }: { isActive: boolean }) {
  const activeStage = useCycleIndex(3, isActive)
  const stages = [
    "Leggo il file e tengo solo i movimenti utili.",
    "Raggruppo i casi dubbi e isolo i duplicati prima del salvataggio.",
    "Ti faccio confermare il risultato prima che entri nel ledger."
  ] as const

  return (
    <PreviewFrame
      eyebrow="Import CSV"
      title="Il dato entra solo dopo una revisione leggibile"
      description="Il flusso reale di import ti aiuta a controllare quello che conta, senza farti passare da un foglio di errori ingestibile."
      statusLabel="Locale e guidato"
      footerNote="Qui la promessa e semplice: il dato entra pulito, non alla cieca."
    >
      <div className="rounded-[1.5rem] border border-white/28 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/75">File in revisione</p>
          <p className="text-base font-bold text-foreground">estratto-aprile.csv</p>
          <div className="space-y-2 pt-1">
            {[
              "78 movimenti letti",
              "3 gruppi da rivedere",
              "3 duplicati bloccati prima del commit"
            ].map((row) => (
              <div
                key={row}
                className="rounded-[1.2rem] border border-white/25 bg-white/65 px-3 py-2.5 text-sm font-semibold text-foreground dark:border-white/10 dark:bg-white/[0.05]"
              >
                {row}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isCurrent = index === activeStage

          return (
            <motion.div
              key={stage}
              animate={isCurrent ? { opacity: 1, y: 0 } : { opacity: 0.78, y: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "surface-subtle p-4",
                isCurrent && "ring-1 ring-primary/20 shadow-lg shadow-primary/10"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/10 text-primary">
                  {isCurrent ? <CheckCircle2 className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Passo {index + 1}</p>
                  <p className="text-sm font-medium leading-relaxed text-foreground">{stage}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </PreviewFrame>
  )
}

function OverviewPreview({ isActive }: { isActive: boolean }) {
  const activeIndex = useCycleIndex(DEMO_TRANSACTIONS.length, isActive)
  const overviewSignals = [
    "Saldo, categorie e movimenti restano allineati",
    "Il peso del comfort si vede subito",
    "I movimenti utili non sono nascosti sotto il rumore"
  ] as const

  return (
    <PreviewFrame
      eyebrow="Dashboard"
      title="Il mese si legge nello stesso punto"
      description="Qui la coerenza conta piu dell'effetto wow: una sola superficie, gli stessi numeri e la stessa lettura dall'inizio alla fine."
      statusLabel="Stesso periodo, stessa lettura"
      footerNote="Non devi cambiare modulo per capire il contesto: il prodotto resta leggibile mentre scorri."
    >
      <div className="rounded-[1.5rem] border border-white/28 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
        <AnimatedMessage message={overviewSignals[activeIndex] ?? overviewSignals[0]} />
      </div>

      <div className="space-y-3">
        <KpiCard
          compact
          title="Saldo del periodo"
          value={formatCents(184230)}
          icon={ShieldCheck}
          tone="positive"
          comparisonLabel="Aprile 2026"
          description="La fotografia del mese resta leggibile appena entri."
        />
        <KpiCard
          compact
          title="Comfort"
          value="27%"
          icon={BrainCircuit}
          tone="warning"
          comparisonLabel="Peso sul mese"
          description="Numa separa quello che puo essere ridotto da quello che va difeso."
        />
        <KpiCard
          compact
          title="Superfluo"
          value="12%"
          icon={FlaskConical}
          tone="neutral"
          comparisonLabel="Soglia osservata"
          description="I piccoli extra emergono prima che diventino la norma."
        />
      </div>

      <SpendingCompositionCard categoriesSummary={DEMO_CATEGORY_SUMMARY} periodLabel="Aprile 2026" />

      <div className="space-y-2">
        {DEMO_TRANSACTIONS.map((transaction, index) => (
          <TransactionRowCard
            key={transaction.id}
            transaction={transaction}
            highlight={index === activeIndex}
          />
        ))}
      </div>
    </PreviewFrame>
  )
}

function BrainPreview({ isActive }: { isActive: boolean }) {
  const activeState = useCycleIndex(DEMO_BRAIN_STATES.length, isActive)

  return (
    <PreviewFrame
      eyebrow="Brain"
      title="Il Brain lavora sulle stime future"
      description="Legge storico, ritmo recente e periodo dell'anno per stimare il resto del mese e il mese prossimo. Se non e pronto, Numa passa allo storico e lo dichiara."
      statusLabel="Fine mese + mese prossimo"
      footerNote="Il Brain non decide per te: ti da una stima futura con fonte e affidabilita, senza fingere precisione quando i dati non bastano."
    >
      <div className="rounded-[1.5rem] border border-white/28 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
            Fonte Brain
          </Badge>
          <Badge variant="outline" className="border-white/35 bg-white/50 dark:border-white/12 dark:bg-white/[0.05]">
            Fonte Storico quando serve
          </Badge>
        </div>
        <div className="mt-3">
          <AnimatedMessage message={DEMO_BRAIN_STATES[activeState]?.description ?? DEMO_BRAIN_STATES[0].description} />
        </div>
      </div>

      <div className="space-y-3">
        <KpiCard
          compact
          title="Spesa prossimo mese"
          value="€ 1.540"
          icon={BrainCircuit}
          tone="neutral"
          comparisonLabel="Forecast"
          description="Quanto potresti spendere il mese prossimo."
          className={cn(activeState === 0 && "ring-1 ring-primary/20 shadow-lg shadow-primary/10")}
        />
        <KpiCard
          compact
          title="Residuo stimato del mese"
          value="€ 430"
          icon={CalendarClock}
          tone="warning"
          comparisonLabel="Nowcast attivo"
          description="Quanto potresti ancora spendere da qui a fine mese."
          className={cn(activeState === 1 && "ring-1 ring-primary/20 shadow-lg shadow-primary/10")}
        />
        <KpiCard
          compact
          title="Affidabilita della stima"
          value="78%"
          icon={ShieldCheck}
          tone="positive"
          comparisonLabel="Soglia superata"
          description="La stima sale in primo piano solo quando supera il controllo di qualita."
          className={cn(activeState === 2 && "ring-1 ring-primary/20 shadow-lg shadow-primary/10")}
        />
      </div>

      <div className="rounded-[1.5rem] border border-white/28 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Quando il Brain non basta</p>
        <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
          Numa passa allo storico invece di mostrarti una previsione piu precisa di quanto sia davvero. E proprio questo che rende la lettura piu onesta.
        </p>
      </div>
    </PreviewFrame>
  )
}

function ScenarioPreview({ isActive }: { isActive: boolean }) {
  const activeScenario = useCycleIndex(DEMO_SCENARIOS.length, isActive)

  return (
    <PreviewFrame
      eyebrow="Financial Lab"
      title="Quanto puoi permetterti ogni mese prima di aggiungere una nuova spesa fissa"
      description="Se stai valutando rata, abbonamento o altra quota ricorrente, Financial Lab parte dal margine storico e ti mostra la quota mensile aggiuntiva sostenibile."
      statusLabel="Quota sostenibile per nuova spesa fissa"
      footerNote="Serve a questo: capire se una nuova spesa fissa entra davvero nel tuo ritmo prima di impegnarti."
    >
      <div className="space-y-3">
        {DEMO_SCENARIOS.map((scenario, index) => {
          const isCurrent = index === activeScenario

          return (
            <motion.div
              key={scenario.label}
              animate={isCurrent ? { opacity: 1, y: 0 } : { opacity: 0.78, y: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "surface-subtle p-4",
                isCurrent && "ring-1 ring-primary/20 shadow-lg shadow-primary/10"
              )}
            >
              <div className="space-y-3">
                <div className={cn("inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]", scenario.accentClassName)}>
                  {scenario.label}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/75">Quota sostenibile</p>
                  <p className="mt-2 text-3xl font-black tracking-tight tabular-nums text-foreground">{scenario.quota}</p>
                </div>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">{scenario.note}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="rounded-[1.5rem] border border-white/28 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/10 text-primary">
            <FlaskConical className="h-4 w-4" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-foreground">Quota attiva: {DEMO_SCENARIOS[activeScenario]?.label ?? DEMO_SCENARIOS[0].label}</p>
            <AnimatedMessage message={DEMO_SCENARIOS[activeScenario]?.note ?? DEMO_SCENARIOS[0].note} />
          </div>
        </div>
      </div>
    </PreviewFrame>
  )
}

export function LandingStepPreview({
  step,
  isActive
}: {
  step: LandingDemoStep
  isActive: boolean
}) {
  if (step.id === "import") {
    return <ImportPreview isActive={isActive} />
  }

  if (step.id === "overview") {
    return <OverviewPreview isActive={isActive} />
  }

  if (step.id === "insights") {
    return <BrainPreview isActive={isActive} />
  }

  return <ScenarioPreview isActive={isActive} />
}
