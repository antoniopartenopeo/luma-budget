"use client"

import { useEffect, useState, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  CalendarClock,
  CheckCircle2,
  FileSpreadsheet,
  FlaskConical,
  ShieldCheck
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatSignedCents } from "@/domain/money/currency"
import {
  DEMO_BRAIN_METRICS,
  DEMO_BRAIN_STATES,
  DEMO_IMPORT_SIGNALS,
  DEMO_OVERVIEW_BREAKDOWN,
  DEMO_OVERVIEW_METRICS,
  DEMO_OVERVIEW_MOVEMENTS,
  DEMO_SCENARIOS,
  LANDING_STORY_POINTS,
  type LandingDemoStep
} from "../data"

function useCycleIndex(total: number, isActive = true) {
  const prefersReducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!isActive || prefersReducedMotion || total <= 1) {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % total)
    }, 2400)

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
  children
}: {
  eyebrow: string
  title: string
  description: string
  statusLabel: string
  footerNote?: string
  children: ReactNode
}) {
  return (
    <div className="surface-strong overflow-hidden p-5 sm:p-6">
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

      <div className="mt-5 space-y-4">{children}</div>

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

function SimpleMetric({
  label,
  value,
  note,
  isActive
}: {
  label: string
  value: string
  note: string
  isActive?: boolean
}) {
  return (
    <motion.div
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.82, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-[1.35rem] border border-white/28 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]",
        isActive && "ring-1 ring-primary/20 shadow-lg shadow-primary/10"
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/72">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-foreground">{value}</p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{note}</p>
    </motion.div>
  )
}

function BreakdownRow({
  label,
  value,
  share,
  isActive
}: {
  label: string
  value: string
  share: number
  isActive?: boolean
}) {
  return (
    <motion.div
      animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.8, x: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className={cn("text-sm font-black tracking-tight", isActive ? "text-primary" : "text-foreground")}>{value}</p>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/55 dark:bg-white/[0.05]">
        <motion.div
          className={cn("h-full rounded-full", isActive ? "bg-primary" : "bg-foreground/18")}
          animate={{ width: `${share}%` }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  )
}

function MovementRow({
  label,
  category,
  amountCents,
  isActive
}: {
  label: string
  category: string
  amountCents: number
  isActive?: boolean
}) {
  return (
    <motion.div
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.8, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-[1.25rem] border px-3.5 py-3",
        isActive
          ? "border-primary/20 bg-primary/10 shadow-lg shadow-primary/10"
          : "border-white/24 bg-white/55 dark:border-white/10 dark:bg-white/[0.04]"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{label}</p>
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/72">{category}</p>
        </div>
        <p className="shrink-0 text-sm font-black tracking-tight text-foreground">{formatSignedCents(amountCents)}</p>
      </div>
    </motion.div>
  )
}

export function LandingHeroConsole() {
  return (
    <div className="surface-strong overflow-hidden p-6 sm:p-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
            Perche nasce Numa
          </Badge>
          <Badge variant="outline" className="border-white/35 bg-white/50 dark:border-white/12 dark:bg-white/[0.05]">
            Non e un tracker qualunque
          </Badge>
        </div>

        <div className="space-y-2">
          <h3 className="max-w-[18ch] text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Non nasce per farti inseguire categorie.
          </h3>
          <p className="max-w-3xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
            Nasce per rispondere a tre domande semplici: come sta andando il mese, cosa potrebbe restarti e se una nuova spesa fissa entra davvero nel tuo ritmo.
          </p>
        </div>

        <div className="space-y-3">
          {LANDING_STORY_POINTS.map((point) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="surface-subtle p-4 sm:p-5"
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
          ))}
        </div>

        <div className="rounded-[1.5rem] border border-primary/14 bg-primary/10 px-4 py-4">
          <p className="text-sm font-semibold leading-relaxed text-foreground">
            Prima capisci il presente. Poi guardi la stima. Solo dopo decidi se aggiungere una nuova spesa fissa.
          </p>
        </div>
      </div>
    </div>
  )
}

function ImportPreview({ isActive }: { isActive: boolean }) {
  const activeStage = useCycleIndex(DEMO_IMPORT_SIGNALS.length, isActive)

  return (
    <PreviewFrame
      eyebrow="Import"
      title="Il dato entra solo dopo un controllo leggibile"
      description="La revisione non e un dettaglio tecnico: e il primo modo in cui Numa ti evita confusione."
      statusLabel="Controllo locale"
      footerNote="L'import non entra alla cieca: prima si pulisce, poi si conferma."
    >
      <div className="rounded-[1.5rem] border border-white/28 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/72">File in revisione</p>
            <p className="mt-1 text-base font-black text-foreground">estratto-aprile.csv</p>
          </div>
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
            Prima revisioni, poi salvi
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        {DEMO_IMPORT_SIGNALS.map((signal, index) => {
          const isCurrent = index === activeStage

          return (
            <motion.div
              key={signal.label}
              animate={isCurrent ? { opacity: 1, y: 0 } : { opacity: 0.8, y: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "rounded-[1.3rem] border px-4 py-3",
                isCurrent
                  ? "border-primary/20 bg-primary/10 shadow-lg shadow-primary/10"
                  : "border-white/24 bg-white/55 dark:border-white/10 dark:bg-white/[0.04]"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/10 text-primary">
                  {isCurrent ? <CheckCircle2 className="h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">{signal.label}</p>
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">{signal.detail}</p>
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
  const activeMetric = useCycleIndex(DEMO_OVERVIEW_METRICS.length, isActive)
  const activeMovement = activeMetric % DEMO_OVERVIEW_MOVEMENTS.length

  return (
    <PreviewFrame
      eyebrow="Mese in corso"
      title="Qui il mese non si spezza in dieci schermate"
      description="La pagina non ti chiede di interpretare il prodotto. Ti fa leggere subito cosa sta succedendo."
      statusLabel="Una lettura sola"
      footerNote="Il punto non e mostrarti piu dati. E farti capire il mese prima."
    >
      <div className="rounded-[1.6rem] border border-white/28 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/72">Aprile 2026</p>
            <h4 className="mt-1 text-xl font-black tracking-tight text-foreground">Mese in lettura</h4>
          </div>
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
            Dati gia allineati
          </Badge>
        </div>

        <div className="mt-4 grid gap-3">
          {DEMO_OVERVIEW_METRICS.map((metric, index) => (
            <SimpleMetric
              key={metric.label}
              label={metric.label}
              value={metric.value}
              note={metric.note}
              isActive={index === activeMetric}
            />
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {DEMO_OVERVIEW_BREAKDOWN.map((row, index) => (
            <BreakdownRow
              key={row.label}
              label={row.label}
              value={row.value}
              share={row.share}
              isActive={index === activeMetric}
            />
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {DEMO_OVERVIEW_MOVEMENTS.map((movement, index) => (
            <MovementRow
              key={movement.label}
              label={movement.label}
              category={movement.category}
              amountCents={movement.amountCents}
              isActive={index === activeMovement}
            />
          ))}
        </div>
      </div>
    </PreviewFrame>
  )
}

function BrainPreview({ isActive }: { isActive: boolean }) {
  const activeState = useCycleIndex(DEMO_BRAIN_STATES.length, isActive)

  return (
    <PreviewFrame
      eyebrow="Brain"
      title="Il Brain lavora solo su stime future precise"
      description="Non e un'etichetta generica: serve a leggere fine mese e mese successivo, e dichiara quando deve tornare allo storico."
      statusLabel="Fine mese + mese prossimo"
      footerNote="Se la stima non e pronta, Numa non finge sicurezza: mostra lo storico e lo dice."
    >
      <div className="rounded-[1.5rem] border border-white/28 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
            Fonte Brain quando pronto
          </Badge>
          <Badge variant="outline" className="border-white/35 bg-white/50 dark:border-white/12 dark:bg-white/[0.05]">
            Storico quando serve
          </Badge>
        </div>

        <div className="mt-3">
          <AnimatedMessage message={DEMO_BRAIN_STATES[activeState]?.description ?? DEMO_BRAIN_STATES[0].description} />
        </div>
      </div>

      <div className="grid gap-3">
        {DEMO_BRAIN_METRICS.map((metric, index) => (
          <SimpleMetric
            key={metric.label}
            label={metric.label}
            value={metric.value}
            note={metric.note}
            isActive={index === activeState}
          />
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-white/28 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/10 text-primary">
            <CalendarClock className="h-4 w-4" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-foreground">Promessa chiara</p>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
              Il Brain non decide per te e non finge precisione assoluta. Ti mostra una stima futura solo quando ha basi sufficienti.
            </p>
          </div>
        </div>
      </div>
    </PreviewFrame>
  )
}

function ScenarioPreview({ isActive }: { isActive: boolean }) {
  const activeScenario = useCycleIndex(DEMO_SCENARIOS.length, isActive)
  const scenario = DEMO_SCENARIOS[activeScenario] ?? DEMO_SCENARIOS[0]

  return (
    <PreviewFrame
      eyebrow="Financial Lab"
      title="Prima di aggiungere una nuova spesa, ti dice se ci stai dentro"
      description="Financial Lab non vende ottimismo: restituisce una quota mensile aggiuntiva sostenibile per rata, abbonamento o altra spesa fissa."
      statusLabel="Quota sostenibile"
      footerNote="Qui la domanda e concreta: quanto puoi permetterti ogni mese senza esporti troppo."
    >
      <div className="flex flex-wrap gap-2">
        {DEMO_SCENARIOS.map((item, index) => {
          const isCurrent = index === activeScenario

          return (
            <motion.div
              key={item.label}
              animate={isCurrent ? { opacity: 1, scale: 1 } : { opacity: 0.72, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]",
                isCurrent ? item.accentClassName : "border-white/24 bg-white/55 text-muted-foreground dark:border-white/10 dark:bg-white/[0.04]"
              )}
            >
              {item.label}
            </motion.div>
          )
        })}
      </div>

      <div className="rounded-[1.6rem] border border-white/28 bg-white/60 p-5 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/10 text-primary">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/72">Quota mensile aggiuntiva sostenibile</p>
            <p className="text-4xl font-black tracking-tight text-foreground">{formatSignedCents(scenario.quotaCents)}</p>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">{scenario.note}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-primary/14 bg-primary/10 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-[1rem] border border-primary/18 bg-white/70 text-primary dark:bg-white/[0.08]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-foreground">{scenario.label}</p>
            <AnimatedMessage message={scenario.example} />
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
