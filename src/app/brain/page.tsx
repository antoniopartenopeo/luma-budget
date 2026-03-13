"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    Brain,
    CalendarClock,
    Crosshair,
    Gauge,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
} from "lucide-react"
import { motion } from "framer-motion"
import {
    BRAIN_MATURITY_SAMPLE_TARGET,
    BrainEvolutionResult,
    BrainTrainingProgress,
    NEURAL_BRAIN_VECTOR_SIZE,
    NeuralBrainSnapshot,
    computeBrainInputSignature,
    evolveBrainFromHistory,
    getBrainSnapshot,
    initializeBrain,
    resetBrain,
} from "@/brain"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { useCategories } from "@/features/categories/api/use-categories"
import { useCurrency } from "@/features/settings/api/use-currency"
import {
    adaptBrainAdaptivePolicy,
    type BrainAdaptivePolicy,
    DEFAULT_BRAIN_ADAPTIVE_POLICY,
    loadBrainAdaptivePolicy,
    saveBrainAdaptivePolicy,
} from "@/features/insights/brain-auto-tune"
import { resolveAdaptiveNowcastConfidenceThreshold } from "@/features/insights/brain-adaptive-thresholds"
import { formatCents } from "@/domain/money"
import { PageHeader } from "@/components/ui/page-header"
import { MacroSection, macroItemVariants } from "@/components/patterns/macro-section"
import { KpiCard } from "@/components/patterns/kpi-card"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import type { EChartsOption } from "echarts"
import { getCurrentPeriod } from "@/lib/date-ranges"

import { NeuralFieldBackground } from "./_components/neural-field-background"
import { BrainHeroSection } from "./_components/brain-hero-section"
import { SignalMatrix } from "./_components/signal-matrix"
import {
    EventTone,
    EvolutionPoint,
    StageState,
    SyncReason,
    TimelineEvent,
    TrainingState,
} from "./types"

const STABILITY_LOSS_TARGET = 0.12
const POLL_INTERVAL_MS = 5000

function formatUpdatedAt(value: string | null): string {
    if (!value) return "-"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value

    return new Intl.DateTimeFormat("it-IT", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsed)
}

function formatClock(value: string): string {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return "-"
    return new Intl.DateTimeFormat("it-IT", {
        timeStyle: "medium",
    }).format(parsed)
}

function clampPercent(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)))
}

function formatRatioAsPercent(value: number): string {
    return `${(value * 100).toFixed(1)}%`
}

function isSameAdaptivePolicy(a: BrainAdaptivePolicy, b: BrainAdaptivePolicy): boolean {
    return a.version === b.version
        && a.minNowcastConfidence === b.minNowcastConfidence
        && a.outlierMinConfidence === b.outlierMinConfidence
        && a.primaryBlendThreshold === b.primaryBlendThreshold
        && a.overshootDeltaCents === b.overshootDeltaCents
        && a.rollingQuality === b.rollingQuality
        && a.steps === b.steps
        && a.updatedAt === b.updatedAt
}

function signatureOf(snapshot: NeuralBrainSnapshot | null): string {
    if (!snapshot) return "not-initialized"
    return [
        snapshot.version,
        snapshot.featureSchemaVersion,
        snapshot.trainedSamples,
        snapshot.lossEma,
        snapshot.updatedAt,
        snapshot.dataFingerprint,
    ].join(":")
}

function resolveStage(snapshot: NeuralBrainSnapshot | null): StageState {
    if (!snapshot) {
        return {
            id: "dormant",
            label: "Spento",
            summary: "Il Core è spento. Avvialo quando vuoi iniziare a fargli leggere i tuoi dati.",
            badgeVariant: "outline",
        }
    }

    const trained = snapshot.trainedSamples
    if (trained === 0) {
        return {
            id: "newborn",
            label: "Nuovo",
            summary: "Il Core è appena nato e non ha ancora imparato nulla dai tuoi movimenti.",
            badgeVariant: "secondary",
        }
    }

    if (trained < 36) {
        return {
            id: "imprinting",
            label: "In apprendimento",
            summary: "Il Core sta riconoscendo le prime abitudini a partire dai tuoi movimenti passati.",
            badgeVariant: "secondary",
        }
    }

    return {
        id: "adapting",
        label: "Attivo",
        summary: "Il Core ha una base solida e continua ad aggiornarsi quando arrivano nuovi dati.",
        badgeVariant: "secondary",
    }
}

function formatEvolutionReason(result: BrainEvolutionResult): { title: string; detail: string; tone: EventTone } {
    if (result.reason === "trained") {
        return {
            title: "Apprendimento completato",
            detail: `Il Core ha completato ${result.epochsRun} cicli su ${result.sampleCount} campioni. Stabilità attuale ${result.averageLoss.toFixed(4)}.`,
            tone: "positive",
        }
    }

    if (result.reason === "no-new-data") {
        return {
            title: "Nessun dato nuovo",
            detail: "Dall'ultima analisi non sono arrivati nuovi dati utili, quindi il Core resta invariato.",
            tone: "neutral",
        }
    }

    if (result.reason === "insufficient-data") {
        return {
            title: "Dati insufficienti",
            detail: `Per imparare meglio servono più dati: mesi validi ${result.monthsAnalyzed}, campioni ${result.sampleCount}.`,
            tone: "warning",
        }
    }

    return {
        title: "Core non avviato",
        detail: "Avvia il Core per iniziare a costruire analisi e previsioni.",
        tone: "warning",
    }
}

export default function BrainPage() {
    const { data: transactions = [], isLoading: isTransactionsLoading } = useTransactions()
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories({ includeArchived: true })
    const { currency, locale } = useCurrency()

    const [snapshot, setSnapshot] = useState<NeuralBrainSnapshot | null>(null)
    const [evolution, setEvolution] = useState<BrainEvolutionResult | null>(null)
    const [adaptivePolicy, setAdaptivePolicy] = useState<BrainAdaptivePolicy>(() => ({ ...DEFAULT_BRAIN_ADAPTIVE_POLICY }))
    const [timeline, setTimeline] = useState<TimelineEvent[]>([])
    const [evolutionHistory, setEvolutionHistory] = useState<EvolutionPoint[]>([])
    const [training, setTraining] = useState<TrainingState>({
        isTraining: false,
        epoch: 0,
        totalEpochs: 0,
        progress: 0,
        currentLoss: 0,
        sampleCount: 0,
        lastCompletedAt: null,
    })

    const eventCounterRef = useRef(0)
    const snapshotSignatureRef = useRef("boot")
    const trainingLockRef = useRef(false)
    const lastAutoSignatureRef = useRef("")
    const lastAdaptivePolicySignatureRef = useRef("")

    const pushEvent = useCallback((title: string, detail: string, tone: EventTone = "neutral") => {
        const nextId = `event-${eventCounterRef.current}`
        eventCounterRef.current += 1
        const event: TimelineEvent = {
            id: nextId,
            title,
            detail,
            at: new Date().toISOString(),
            tone,
        }
        setTimeline((prev) => [event, ...prev].slice(0, 12))
    }, [])

    const syncSnapshot = useCallback((reason: SyncReason) => {
        const next = getBrainSnapshot()
        const nextSignature = signatureOf(next)
        const hasChanged = nextSignature !== snapshotSignatureRef.current

        setSnapshot(next)
        setAdaptivePolicy((prev) => {
            const loaded = loadBrainAdaptivePolicy()
            return isSameAdaptivePolicy(prev, loaded) ? prev : loaded
        })

        if (!hasChanged && reason === "poll") return

        snapshotSignatureRef.current = nextSignature

        if (reason === "boot") {
            pushEvent("Core collegato", next ? "Stato letto dal dispositivo." : "Il Core non è ancora stato avviato.", "neutral")
            return
        }

        if (reason === "storage") {
            pushEvent("Aggiornamento rilevato", "Lo stato del Core è cambiato in un'altra scheda aperta.", "warning")
            return
        }

        if (hasChanged) {
            pushEvent("Stato aggiornato", "Il Core ha ricevuto un aggiornamento.", "neutral")
        }
    }, [pushEvent])

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            syncSnapshot("boot")
        })
        const interval = window.setInterval(() => {
            syncSnapshot("poll")
        }, POLL_INTERVAL_MS)
        const onStorage = () => {
            syncSnapshot("storage")
        }

        window.addEventListener("storage", onStorage)
        return () => {
            window.cancelAnimationFrame(frame)
            window.clearInterval(interval)
            window.removeEventListener("storage", onStorage)
        }
    }, [syncSnapshot])

    const isInitialized = snapshot !== null
    const isDataLoading = isTransactionsLoading || isCategoriesLoading
    const inputSignature = useMemo(
        () => computeBrainInputSignature(transactions, categories, getCurrentPeriod()),
        [categories, transactions]
    )

    const runEvolution = useCallback(async () => {
        if (trainingLockRef.current) return
        if (!isInitialized) {
            pushEvent("Core non attivo", "Avvia il Core prima di lanciare una nuova analisi.", "warning")
            return
        }
        if (isDataLoading) {
            pushEvent("Dati in caricamento", "Sto ancora leggendo transazioni e categorie.", "warning")
            return
        }

        trainingLockRef.current = true
        const baselineLoss = getBrainSnapshot()?.lossEma ?? 0
        setTraining((prev) => ({
            ...prev,
            isTraining: true,
            epoch: 0,
            totalEpochs: 0,
            progress: 0,
            currentLoss: baselineLoss,
            sampleCount: 0,
        }))

        pushEvent(
            "Analisi avviata",
            `Analisi avviata con ${transactions.length} transazioni e ${categories.length} categorie.`,
            "neutral"
        )

        try {
            const result = await evolveBrainFromHistory(transactions, categories, {
                onProgress: (progress: BrainTrainingProgress) => {
                    setTraining((prev) => ({
                        ...prev,
                        isTraining: true,
                        epoch: progress.epoch,
                        totalEpochs: progress.totalEpochs,
                        progress: clampPercent((progress.epoch / progress.totalEpochs) * 100),
                        currentLoss: progress.averageLoss,
                        sampleCount: progress.sampleCount,
                    }))

                    pushEvent(
                        `Ciclo ${progress.epoch}/${progress.totalEpochs}`,
                        `Campioni letti ${progress.sampleCount} · stabilità ${progress.averageLoss.toFixed(4)}`,
                        "neutral"
                    )
                },
            })

            setEvolution(result)
            if (result.snapshot) {
                setSnapshot(result.snapshot)
                snapshotSignatureRef.current = signatureOf(result.snapshot)
            }
            if (lastAdaptivePolicySignatureRef.current !== inputSignature) {
                lastAdaptivePolicySignatureRef.current = inputSignature
                setAdaptivePolicy((currentPolicy) => {
                    const nextPolicy = adaptBrainAdaptivePolicy(currentPolicy, result)
                    saveBrainAdaptivePolicy(nextPolicy)
                    return nextPolicy
                })
            }

            setTraining((prev) => ({
                ...prev,
                isTraining: false,
                epoch: result.epochsRun,
                totalEpochs: result.epochsRun,
                progress: result.didTrain ? 100 : prev.progress,
                currentLoss: result.averageLoss,
                sampleCount: result.sampleCount,
                lastCompletedAt: new Date().toISOString(),
            }))

            const summary = formatEvolutionReason(result)
            pushEvent(summary.title, summary.detail, summary.tone)
        } catch (error) {
            setTraining((prev) => ({ ...prev, isTraining: false }))
            const detail = error instanceof Error ? error.message : "Errore sconosciuto"
            pushEvent("Analisi interrotta", detail, "critical")
        } finally {
            trainingLockRef.current = false
        }
    }, [
        categories,
        inputSignature,
        isDataLoading,
        isInitialized,
        pushEvent,
        transactions,
    ])

    useEffect(() => {
        if (!isInitialized || isDataLoading) return
        if (lastAutoSignatureRef.current === inputSignature) return
        lastAutoSignatureRef.current = inputSignature
        void runEvolution()
    }, [inputSignature, isInitialized, isDataLoading, runEvolution])

    const stage = useMemo(() => resolveStage(snapshot), [snapshot])

    const experienceProgress = useMemo(() => {
        const trainedSamples = snapshot?.trainedSamples ?? 0
        return clampPercent((trainedSamples / BRAIN_MATURITY_SAMPLE_TARGET) * 100)
    }, [snapshot?.trainedSamples])

    const liveLoss = training.isTraining ? training.currentLoss : (snapshot?.lossEma ?? 0)

    const stabilityProgress = useMemo(() => {
        const normalizedLoss = Math.min(liveLoss / STABILITY_LOSS_TARGET, 1)
        return clampPercent((1 - normalizedLoss) * 100)
    }, [liveLoss])

    const evolutionProgress = useMemo(() => {
        if (!snapshot) return 0
        const learned = clampPercent(experienceProgress * 0.72 + stabilityProgress * 0.28)
        return training.isTraining ? Math.max(learned, training.progress) : learned
    }, [experienceProgress, snapshot, stabilityProgress, training.isTraining, training.progress])

    useEffect(() => {
        const nextPoint: EvolutionPoint = {
            at: Date.now(),
            readiness: evolutionProgress,
            experience: experienceProgress,
            stability: stabilityProgress,
        }
        setEvolutionHistory((prev) => {
            const last = prev[prev.length - 1]
            if (
                last &&
                last.readiness === nextPoint.readiness &&
                last.experience === nextPoint.experience &&
                last.stability === nextPoint.stability
            ) {
                return prev
            }
            const next = [...prev, nextPoint]
            if (next.length > 36) next.shift()
            return next
        })
    }, [evolutionProgress, experienceProgress, stabilityProgress])

    const evolutionChartSeries = useMemo(() => {
        const points = evolutionHistory.length > 0
            ? evolutionHistory
            : [{ at: 0, readiness: evolutionProgress, experience: experienceProgress, stability: stabilityProgress }]

        const timeFormatter = new Intl.DateTimeFormat("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })

        return {
            labels: points.map((point) => point.at === 0 ? "Adesso" : timeFormatter.format(point.at)),
            readiness: points.map((point) => point.readiness),
            experience: points.map((point) => point.experience),
            stability: points.map((point) => point.stability),
        }
    }, [evolutionHistory, evolutionProgress, experienceProgress, stabilityProgress])

    const evolutionChartOption = useMemo<EChartsOption>(() => {
        return {
            backgroundColor: "transparent",
            animationDuration: 650,
            animationDurationUpdate: 480,
            tooltip: {
                trigger: "axis",
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderWidth: 1,
                textStyle: { color: "#f8fafc", fontSize: 12 },
                formatter: (params: unknown) => {
                    const points = params as Array<{ axisValue: string; seriesName: string; value: number }>
                    const axisValue = points[0]?.axisValue ?? ""
                    const rows = points
                        .map((point) => `<div style="display:flex;justify-content:space-between;gap:16px;"><span>${point.seriesName}</span><strong>${Math.round(point.value)}%</strong></div>`)
                        .join("")
                    return `<div style="display:flex;flex-direction:column;gap:6px;"><div style="font-weight:700;font-size:11px;color:#94a3b8;">${axisValue}</div>${rows}</div>`
                },
            },
            legend: {
                top: 0,
                itemWidth: 10,
                itemHeight: 10,
                textStyle: {
                    color: "#94a3b8",
                    fontSize: 11,
                    fontWeight: 700,
                },
                data: ["Prontezza", "Esperienza", "Stabilità"],
            },
            grid: {
                left: "4%",
                right: "4%",
                bottom: "10%",
                top: "18%",
                containLabel: true,
            },
            xAxis: {
                type: "category",
                boundaryGap: false,
                data: evolutionChartSeries.labels,
                axisLine: { lineStyle: { color: "rgba(148,163,184,0.2)" } },
                axisTick: { show: false },
                axisLabel: { color: "#94a3b8", fontSize: 10, fontWeight: 700 },
            },
            yAxis: {
                type: "value",
                min: 0,
                max: 100,
                splitLine: { lineStyle: { type: "dashed", color: "rgba(148,163,184,0.2)" } },
                axisLabel: {
                    color: "#94a3b8",
                    fontSize: 10,
                    fontWeight: 700,
                    formatter: (value: number) => `${value}%`,
                },
            },
            series: [
                {
                    name: "Prontezza",
                    type: "line",
                    smooth: 0.35,
                    showSymbol: false,
                    lineStyle: { width: 3, color: "#3b82f6" },
                    areaStyle: { color: "rgba(59,130,246,0.12)" },
                    data: evolutionChartSeries.readiness,
                },
                {
                    name: "Esperienza",
                    type: "line",
                    smooth: 0.35,
                    showSymbol: false,
                    lineStyle: { width: 3, color: "#10b981" },
                    areaStyle: { color: "rgba(16,185,129,0.12)" },
                    data: evolutionChartSeries.experience,
                },
                {
                    name: "Stabilità",
                    type: "line",
                    smooth: 0.35,
                    showSymbol: false,
                    lineStyle: { width: 3, color: "#f59e0b" },
                    areaStyle: { color: "rgba(245,158,11,0.1)" },
                    data: evolutionChartSeries.stability,
                },
            ],
        }
    }, [evolutionChartSeries])

    const vectorWeights = useMemo(
        () => snapshot?.weights ?? new Array(NEURAL_BRAIN_VECTOR_SIZE).fill(0),
        [snapshot?.weights]
    )

    const silentWeightsCount = useMemo(
        () => vectorWeights.filter((weight) => weight === 0).length,
        [vectorWeights]
    )

    const activeWeightsCount = vectorWeights.length - silentWeightsCount

    const riskPercent = evolution?.prediction ? Math.round(evolution.prediction.riskScore * 100) : 0
    const confidencePercent = evolution?.prediction ? Math.round(evolution.prediction.confidence * 100) : 0

    const predictedExpensesLabel = evolution?.prediction
        ? formatCents(evolution.predictedExpensesNextMonthCents, currency, locale)
        : "-"
    const rawCurrentMonthRemainingLabel = evolution && evolution.currentMonthNowcastReady
        ? formatCents(evolution.predictedCurrentMonthRemainingExpensesCents, currency, locale)
        : "-"
    const currentMonthConfidencePercent = evolution
        ? Math.round(evolution.currentMonthNowcastConfidence * 100)
        : 0

    const contributorsTop = evolution?.prediction?.contributors.slice(0, 3) ?? []
    const nextMonthMaeLabel = evolution && evolution.nextMonthReliability.sampleCount > 0
        ? formatRatioAsPercent(evolution.nextMonthReliability.mae)
        : "-"
    const nextMonthMapeLabel = evolution && evolution.nextMonthReliability.mapeSampleCount > 0
        ? formatRatioAsPercent(evolution.nextMonthReliability.mape)
        : "-"
    const nextMonthReliabilitySamples = evolution?.nextMonthReliability.sampleCount ?? 0
    const adaptiveNowcastConfidenceThreshold = resolveAdaptiveNowcastConfidenceThreshold({
        baseThreshold: adaptivePolicy.minNowcastConfidence,
        maturityScore: Math.max(
            0,
            Math.min(1, (snapshot?.currentMonthHead?.trainedSamples ?? 0) / BRAIN_MATURITY_SAMPLE_TARGET)
        ),
        reliabilitySampleCount: evolution?.nowcastReliability.sampleCount ?? 0,
        reliabilityMape: evolution?.nowcastReliability.mape ?? 0,
        reliabilityMae: evolution?.nowcastReliability.mae ?? 0,
    })
    const adaptiveNowcastConfidencePercent = Math.round(adaptiveNowcastConfidenceThreshold * 100)
    const advisorNowcastReady = Boolean(
        evolution?.currentMonthNowcastReady
        && currentMonthConfidencePercent >= adaptiveNowcastConfidencePercent
    )
    const currentMonthRemainingLabel = advisorNowcastReady ? rawCurrentMonthRemainingLabel : "-"

    const handleInitialize = useCallback(() => {
        const newborn = initializeBrain()
        setSnapshot(newborn)
        setEvolutionHistory([])
        snapshotSignatureRef.current = signatureOf(newborn)
        pushEvent("Core inizializzato", "Ho creato un nuovo Core pronto a imparare.", "positive")
    }, [pushEvent])

    const handleReset = useCallback(() => {
        resetBrain()
        setSnapshot(null)
        setEvolution(null)
        setEvolutionHistory([])
        setTraining({
            isTraining: false,
            epoch: 0,
            totalEpochs: 0,
            progress: 0,
            currentLoss: 0,
            sampleCount: 0,
            lastCompletedAt: null,
        })
        lastAutoSignatureRef.current = ""
        lastAdaptivePolicySignatureRef.current = ""
        snapshotSignatureRef.current = signatureOf(null)
        pushEvent("Core resettato", "La memoria locale del Core è stata cancellata.", "warning")
    }, [pushEvent])

    return (
        <StaggerContainer className="space-y-8 pb-20 md:pb-10">
            <motion.div variants={macroItemVariants}>
                <PageHeader
                    title="Core previsioni"
                    description="Qui vedi come il Core cresce dai tuoi movimenti e affina le stime."
                />
            </motion.div>

            {/* Hero section: chart + forecast + actions */}
            <motion.div variants={macroItemVariants}>
                <MacroSection
                    variant="premium"
                    background={<NeuralFieldBackground />}
                    contentClassName="pt-5"
                >
                    <BrainHeroSection
                        evolutionChartOption={evolutionChartOption}
                        hwForecast={evolution?.hwForecast ?? null}
                        currency={currency}
                        locale={locale}
                        training={training}
                        isInitialized={isInitialized}
                        handleInitialize={handleInitialize}
                        handleReset={handleReset}
                        timeline={timeline}
                        formatClock={formatClock}
                        transactionsCount={transactions.length}
                        categoriesCount={categories.length}
                        updatedAtLabel={formatUpdatedAt(training.lastCompletedAt)}
                    />
                </MacroSection>
            </motion.div>

            {/* KPI mosaic grid — uniform premium cards */}
            <MacroSection
                title="Stato del Core"
                description={stage.summary}
                contentClassName="pt-5"
                background={
                    <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(14,165,168,0.06),transparent_30%),linear-gradient(330deg,rgba(148,163,184,0.06),transparent_30%)]" />
                }
            >
                <StaggerContainer className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Prontezza"
                            value={`${evolutionProgress}%`}
                            animatedValue={evolutionProgress}
                            formatFn={(v) => `${Math.round(v)}%`}
                            icon={Gauge}
                            tone={evolutionProgress >= 80 ? "positive" : evolutionProgress >= 40 ? "neutral" : "warning"}
                            description="Quanto il Core è vicino alla piena operatività."
                            explainabilityText="Percentuale di dati raccolti rispetto al minimo necessario per previsioni affidabili."
                        />
                    </motion.div>
                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Esperienza"
                            value={`${experienceProgress}%`}
                            animatedValue={experienceProgress}
                            formatFn={(v) => `${Math.round(v)}%`}
                            icon={TrendingUp}
                            tone={experienceProgress >= 80 ? "positive" : "neutral"}
                            change={`${snapshot?.trainedSamples ?? 0}/${BRAIN_MATURITY_SAMPLE_TARGET}`}
                            comparisonLabel="Campioni"
                            description="Campioni appresi rispetto all'obiettivo."
                            explainabilityText="Misura quanti pattern di spesa il Core ha osservato e memorizzato."
                        />
                    </motion.div>
                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Stabilità"
                            value={`${stabilityProgress}%`}
                            animatedValue={stabilityProgress}
                            formatFn={(v) => `${Math.round(v)}%`}
                            icon={ShieldCheck}
                            tone={stabilityProgress >= 70 ? "positive" : stabilityProgress >= 30 ? "neutral" : "warning"}
                            description="Quanto sono coerenti le previsioni tra un ciclo e l'altro."
                            explainabilityText={`Valore attuale: ${liveLoss.toFixed(4)}. Più basso = più stabile.`}
                        />
                    </motion.div>
                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Rischio"
                            value={evolution?.prediction ? `${riskPercent}%` : "-"}
                            icon={ShieldCheck}
                            trend={evolution?.prediction ? (riskPercent > 65 ? "warning" : "neutral") : "neutral"}
                            change={evolution?.prediction ? `${confidencePercent}%` : "-"}
                            comparisonLabel="Affidabilità"
                            description="Quanto è probabile che la spesa salga."
                            explainabilityText="Score prodotto dalla Logistic Regression del Core basato su 8 segnali finanziari."
                        />
                    </motion.div>
                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Spesa prossimo mese"
                            value={predictedExpensesLabel}
                            icon={Sparkles}
                            trend={evolution?.prediction ? "up" : "neutral"}
                            change={evolution?.inferencePeriod ?? "-"}
                            comparisonLabel="Periodo"
                            description="Stima basata su trend e stagionalità."
                            explainabilityText="Previsione Holt-Winters con fallback alla Logistic Regression del Core."
                        />
                    </motion.div>
                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Spesa residua del mese"
                            value={currentMonthRemainingLabel}
                            icon={CalendarClock}
                            trend={advisorNowcastReady ? "neutral" : "warning"}
                            change={advisorNowcastReady ? `${currentMonthConfidencePercent}%` : evolution ? `Soglia ${adaptiveNowcastConfidencePercent}%` : "Non pronta"}
                            comparisonLabel={advisorNowcastReady ? "Confidenza" : "Soglia qualità"}
                            description="Quanto il Core stima che resti da spendere."
                            explainabilityText="Nowcast intra-mese con soglia adattiva per il controllo qualità."
                        />
                    </motion.div>
                </StaggerContainer>
            </MacroSection>

            {/* Core internals — clear KPIs */}
            <MacroSection
                title="Sotto il cofano"
                description="Metriche interne del Core."
                contentClassName="pt-5"
                background={
                    <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(148,163,184,0.05),transparent_28%),linear-gradient(340deg,rgba(14,165,168,0.04),transparent_28%)]" />
                }
            >
                <StaggerContainer className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Neuroni attivi"
                            value={`${activeWeightsCount}/${vectorWeights.length}`}
                            icon={Brain}
                            tone={activeWeightsCount === vectorWeights.length ? "positive" : "neutral"}
                            description="Quanti segnali contribuiscono attivamente alla stima."
                            explainabilityText="Un neurone 'neutro' ha peso zero e non influenza la previsione. Tutti attivi = il Core usa ogni informazione disponibile."
                            compact
                        />
                    </motion.div>
                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Campioni appresi"
                            value={`${snapshot?.trainedSamples ?? 0}`}
                            animatedValue={snapshot?.trainedSamples ?? 0}
                            formatFn={(v) => `${Math.round(v)}`}
                            icon={Target}
                            tone={(snapshot?.trainedSamples ?? 0) >= 60 ? "positive" : "neutral"}
                            description="Quante 'fotografie' del tuo comportamento il Core ha memorizzato."
                            explainabilityText="Ogni ciclo di addestramento aggiunge campioni. Più ne ha, più la stima si affina."
                            compact
                        />
                    </motion.div>
                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Precisione"
                            value={nextMonthMaeLabel}
                            icon={Crosshair}
                            tone={
                                nextMonthMaeLabel === "-" ? "neutral"
                                    : parseFloat(nextMonthMaeLabel) <= 15 ? "positive"
                                        : parseFloat(nextMonthMaeLabel) <= 30 ? "neutral"
                                            : "warning"
                            }
                            change={`${nextMonthReliabilitySamples} mesi`}
                            comparisonLabel="Misurato su"
                            description="Errore medio della previsione rispetto alla spesa reale."
                            explainabilityText="MAE — Media dell'errore assoluto. Più basso è, più la previsione è vicina alla realtà. Obiettivo: sotto il 15%."
                            compact
                        />
                    </motion.div>
                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Margine d'errore"
                            value={nextMonthMapeLabel}
                            icon={ShieldCheck}
                            tone={
                                nextMonthMapeLabel === "-" ? "neutral"
                                    : parseFloat(nextMonthMapeLabel) <= 15 ? "positive"
                                        : parseFloat(nextMonthMapeLabel) <= 30 ? "neutral"
                                            : "warning"
                            }
                            description="Di quanto, in percentuale, la stima può sbagliare."
                            explainabilityText="MAPE — Se mostra 30%, una previsione di €1000 significa che la spesa reale sarà tra €700 e €1300."
                            compact
                        />
                    </motion.div>
                </StaggerContainer>
            </MacroSection>

            {/* Signal Matrix — signals detail */}
            <motion.div variants={macroItemVariants}>
                <SignalMatrix
                    contributorsTop={contributorsTop}
                />
            </motion.div>
        </StaggerContainer>
    )
}
