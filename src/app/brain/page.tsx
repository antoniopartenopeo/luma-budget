"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    Activity,
    BrainCircuit,
    CalendarClock,
    Cpu,
    Database,
    Gauge,
    RotateCcw,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Zap,
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
    loadBrainAdaptivePolicy,
    saveBrainAdaptivePolicy,
} from "@/features/insights/brain-auto-tune"
import { resolveAdaptiveNowcastConfidenceThreshold } from "@/features/insights/brain-adaptive-thresholds"
import { formatCents } from "@/domain/money"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MacroSection, macroItemVariants } from "@/components/patterns/macro-section"
import { KpiCard } from "@/components/patterns/kpi-card"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { EChartsWrapper } from "@/features/dashboard/components/charts/echarts-wrapper"
import type { EChartsOption } from "echarts"
import { cn } from "@/lib/utils"
import { getCurrentPeriod } from "@/lib/date-ranges"

const STABILITY_LOSS_TARGET = 0.12
const POLL_INTERVAL_MS = 5000

type StageId = "dormant" | "newborn" | "imprinting" | "adapting"
type SyncReason = "boot" | "poll" | "storage"
type EventTone = "neutral" | "positive" | "warning" | "critical"

interface TimelineEvent {
    id: string
    title: string
    detail: string
    at: string
    tone: EventTone
}

interface StageState {
    id: StageId
    label: string
    summary: string
    badgeVariant: "outline" | "secondary"
}

interface TrainingState {
    isTraining: boolean
    epoch: number
    totalEpochs: number
    progress: number
    currentLoss: number
    sampleCount: number
    lastCompletedAt: string | null
}

interface EvolutionPoint {
    at: number
    readiness: number
    experience: number
    stability: number
}

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

function formatFeatureLabel(feature: string): string {
    const labels: Record<string, string> = {
        expense_income_ratio: "Rapporto spese/entrate",
        superfluous_share: "Quota spese non essenziali",
        comfort_share: "Quota spese di comfort",
        txn_density: "Frequenza transazioni",
        expense_momentum: "Tendenza recente delle spese",
        income_momentum: "Tendenza recente delle entrate",
        discretionary_pressure: "Pressione spese discrezionali",
        expense_gap_ratio: "Divario tra spese ed entrate",
    }

    if (labels[feature]) return labels[feature]
    const fallback = feature.replace(/_/g, " ")
    return fallback.charAt(0).toUpperCase() + fallback.slice(1)
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
            summary: "Il Core e spento: avvialo per iniziare a imparare.",
            badgeVariant: "outline",
        }
    }

    const trained = snapshot.trainedSamples
    if (trained === 0) {
        return {
            id: "newborn",
            label: "Nuovo",
            summary: "Il Core e nato, ma non ha ancora imparato dai tuoi dati.",
            badgeVariant: "secondary",
        }
    }

    if (trained < 36) {
        return {
            id: "imprinting",
            label: "In apprendimento",
            summary: "Il Core sta imparando le prime abitudini dalle tue spese passate.",
            badgeVariant: "secondary",
        }
    }

    return {
        id: "adapting",
        label: "Attivo",
        summary: "Il Core ha una buona base e si aggiorna quando arrivano nuovi dati.",
        badgeVariant: "secondary",
    }
}

function eventToneClass(tone: EventTone): string {
    if (tone === "positive") return "bg-success"
    if (tone === "warning") return "bg-warning"
    if (tone === "critical") return "bg-destructive"
    return "bg-primary/70"
}

function formatEvolutionReason(result: BrainEvolutionResult): { title: string; detail: string; tone: EventTone } {
    if (result.reason === "trained") {
        return {
            title: "Apprendimento completato",
            detail: `Il Core ha concluso ${result.epochsRun} cicli su ${result.sampleCount} campioni (stabilita ${result.averageLoss.toFixed(4)}).`,
            tone: "positive",
        }
    }

    if (result.reason === "no-new-data") {
        return {
            title: "Nessun dato nuovo",
            detail: "I dati sono uguali all'ultima analisi, quindi il Core non si aggiorna.",
            tone: "neutral",
        }
    }

    if (result.reason === "insufficient-data") {
        return {
            title: "Dati insufficienti",
            detail: `Per imparare servono piu dati: mesi validi ${result.monthsAnalyzed}, campioni ${result.sampleCount}.`,
            tone: "warning",
        }
    }

    return {
        title: "Core non avviato",
        detail: "Inizializza il Core per attivare analisi e previsioni.",
        tone: "warning",
    }
}

function NeuralFieldBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.72_0.14_200_/_.22),transparent_46%),radial-gradient(circle_at_82%_10%,oklch(0.68_0.15_160_/_.16),transparent_34%),radial-gradient(circle_at_50%_86%,oklch(0.62_0.13_220_/_.12),transparent_42%)]" />
            <div className="absolute left-1/3 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/25 animate-pulse-soft" />
            <div className="absolute left-1/3 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15 animate-ping-slow" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#7c8ea11a_1px,transparent_1px),linear-gradient(to_bottom,#7c8ea11a_1px,transparent_1px)] bg-[size:26px_26px] opacity-35" />
        </div>
    )
}

export default function BrainPage() {
    const { data: transactions = [], isLoading: isTransactionsLoading } = useTransactions()
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories({ includeArchived: true })
    const { currency, locale } = useCurrency()

    const [snapshot, setSnapshot] = useState<NeuralBrainSnapshot | null>(null)
    const [evolution, setEvolution] = useState<BrainEvolutionResult | null>(null)
    const [adaptivePolicy, setAdaptivePolicy] = useState(() => loadBrainAdaptivePolicy())
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
            pushEvent("Core collegato", next ? "Stato caricato dal dispositivo." : "Core non ancora inizializzato.", "neutral")
            return
        }

        if (reason === "storage") {
            pushEvent("Aggiornamento rilevato", "Lo stato del Core e cambiato in un'altra scheda.", "warning")
            return
        }

        if (hasChanged) {
            pushEvent("Stato aggiornato", "Il Core ha ricevuto un nuovo stato.", "neutral")
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
            pushEvent("Core non attivo", "Inizializza il Core prima di avviare l'analisi.", "warning")
            return
        }
        if (isDataLoading) {
            pushEvent("Dati in caricamento", "Sto ancora caricando transazioni e categorie.", "warning")
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
            `Avvio automatico · ${transactions.length} transazioni · ${categories.length} categorie`,
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
                        `Campioni ${progress.sampleCount} · stabilita ${progress.averageLoss.toFixed(4)}`,
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
            pushEvent("Errore analisi", detail, "critical")
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
                data: ["Prontezza", "Esperienza", "Stabilita"],
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
                    name: "Stabilita",
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
    const nowcastMaeLabel = evolution && evolution.nowcastReliability.sampleCount > 0
        ? formatRatioAsPercent(evolution.nowcastReliability.mae)
        : "-"
    const nowcastMapeLabel = evolution && evolution.nowcastReliability.mapeSampleCount > 0
        ? formatRatioAsPercent(evolution.nowcastReliability.mape)
        : "-"
    const nowcastReliabilitySamples = evolution?.nowcastReliability.sampleCount ?? 0
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
    const brainKpiCardClassName = "h-auto"
    const brainKpiValueClassName = "text-[clamp(1.65rem,2.1vw,2.5rem)] leading-none break-normal"
    const brainKpiMoneyValueClassName = "text-[clamp(1.6rem,2vw,2.35rem)] leading-none break-normal whitespace-nowrap"

    const handleInitialize = useCallback(() => {
        const newborn = initializeBrain()
        setSnapshot(newborn)
        setEvolutionHistory([])
        snapshotSignatureRef.current = signatureOf(newborn)
        pushEvent("Core inizializzato", "Creato un nuovo Core pronto a imparare.", "positive")
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
        pushEvent("Core resettato", "Memoria locale del Core cancellata.", "warning")
    }, [pushEvent])

    return (
        <StaggerContainer className="space-y-8 pb-20 md:pb-10">
            <motion.div variants={macroItemVariants}>
                <PageHeader
                    title={
                        <span className="flex items-center gap-3">
                            <BrainCircuit className="h-8 w-8" />
                            Core previsioni
                        </span>
                    }
                    description="Qui vedi come il Core impara dalle tue spese reali e aggiorna le stime."
                />
            </motion.div>

            <motion.div variants={macroItemVariants}>
                <MacroSection
                    variant="premium"
                    background={<NeuralFieldBackground />}
                >
                    <div className="space-y-6">
                        <div className="grid gap-6">
                            <Card className="glass-card border-white/35 order-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Gauge className="h-5 w-5" />
                                        Indice evoluzione
                                    </CardTitle>
                                    <CardDescription>{stage.summary}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="rounded-2xl border border-border/60 bg-background/60 p-3">
                                        <div className="h-[260px] w-full">
                                            <EChartsWrapper option={evolutionChartOption} />
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
                                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Prontezza</p>
                                            <p className="mt-1 text-sm font-bold tabular-nums">{evolutionProgress}%</p>
                                            <p className="mt-1 text-[10px] text-muted-foreground">Prontezza complessiva del Core.</p>
                                        </div>
                                        <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
                                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Esperienza</p>
                                            <p className="mt-1 text-sm font-bold tabular-nums">{experienceProgress}%</p>
                                            <p className="mt-1 text-[10px] text-muted-foreground">{snapshot?.trainedSamples ?? 0}/{BRAIN_MATURITY_SAMPLE_TARGET} campioni appresi.</p>
                                        </div>
                                        <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
                                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Stabilita</p>
                                            <p className="mt-1 text-sm font-bold tabular-nums">{stabilityProgress}%</p>
                                            <p className="mt-1 text-[10px] text-muted-foreground">Stabilita attuale: {liveLoss.toFixed(4)}.</p>
                                        </div>
                                    </div>

                                    {training.isTraining && (
                                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                                            <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                                                Analisi in corso
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Ciclo {training.epoch}/{training.totalEpochs} · campioni {training.sampleCount} · stabilita {training.currentLoss.toFixed(4)}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                                        <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Versione Core</p>
                                            <p className="mt-1 text-sm font-bold">{snapshot?.version ?? "-"}</p>
                                        </div>
                                        <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Schema fattori</p>
                                            <p className="mt-1 text-sm font-bold">{snapshot?.featureSchemaVersion ?? "-"}</p>
                                        </div>
                                        <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Ultimo aggiornamento</p>
                                            <p className="mt-1 text-sm font-bold">{formatUpdatedAt(snapshot?.updatedAt ?? null)}</p>
                                        </div>
                                        <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Affidabilita prossimo mese</p>
                                            <p className="mt-1 text-sm font-bold tabular-nums">MAE {nextMonthMaeLabel}</p>
                                            <p className="mt-1 text-[10px] text-muted-foreground tabular-nums">
                                                MAPE {nextMonthMapeLabel} · {nextMonthReliabilitySamples} campioni
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Affidabilita residuo mese</p>
                                            <p className="mt-1 text-sm font-bold tabular-nums">MAE {nowcastMaeLabel}</p>
                                            <p className="mt-1 text-[10px] text-muted-foreground tabular-nums">
                                                MAPE {nowcastMapeLabel} · {nowcastReliabilitySamples} campioni · soglia {adaptiveNowcastConfidencePercent}%
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass-card border-white/35 order-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Comandi Core
                                    </CardTitle>
                                <CardDescription>
                                    Azioni base del Core: avvio, analisi e reset.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            onClick={handleInitialize}
                                            disabled={isInitialized || training.isTraining}
                                            className="min-w-[170px]"
                                        >
                                            <Zap className="h-4 w-4" />
                                            Inizializza Core
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleReset}
                                            disabled={!isInitialized || training.isTraining}
                                            className="min-w-[170px]"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Azzera Core
                                        </Button>
                                    </div>

                                    <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                            Registro eventi in tempo reale
                                        </p>
                                        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                                            {timeline.length === 0 && (
                                                <p className="text-xs text-muted-foreground">Nessun evento per ora.</p>
                                            )}
                                            {timeline.map((event) => (
                                                <div key={event.id} className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("h-2 w-2 rounded-full", eventToneClass(event.tone))} />
                                                            <p className="text-xs font-bold text-foreground">{event.title}</p>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground tabular-nums">{formatClock(event.at)}</p>
                                                    </div>
                                                    <p className="mt-1 text-[11px] text-muted-foreground">{event.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <p className="text-[11px] text-muted-foreground">
                                        Dati live: {transactions.length} transazioni, {categories.length} categorie, ultima analisi {formatUpdatedAt(training.lastCompletedAt)}.
                                    </p>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            <KpiCard
                                title="Unita Core"
                                value={vectorWeights.length}
                                icon={Cpu}
                                trend="neutral"
                                change={`${activeWeightsCount}/${vectorWeights.length}`}
                                comparisonLabel="Attive"
                                description="Componenti interne del modello."
                                className={brainKpiCardClassName}
                                valueClassName={brainKpiValueClassName}
                                compact
                            />
                            <KpiCard
                                title="Campioni"
                                value={snapshot?.trainedSamples ?? 0}
                                icon={Database}
                                trend={snapshot && snapshot.trainedSamples > 0 ? "up" : "neutral"}
                                change={`${experienceProgress}%`}
                                comparisonLabel="Maturita"
                                description="Campioni usati per imparare."
                                className={brainKpiCardClassName}
                                valueClassName={brainKpiValueClassName}
                                compact
                            />
                            <KpiCard
                                title="Rischio"
                                value={evolution?.prediction ? `${riskPercent}%` : "-"}
                                icon={ShieldCheck}
                                trend={evolution?.prediction ? (riskPercent > 65 ? "warning" : "neutral") : "neutral"}
                                change={evolution?.prediction ? `${confidencePercent}%` : "-"}
                                comparisonLabel="Affidabilita"
                                description="Probabilita di aumento spese."
                                className={brainKpiCardClassName}
                                valueClassName={brainKpiValueClassName}
                                compact
                            />
                            <KpiCard
                                title="Spesa prossimo mese"
                                value={predictedExpensesLabel}
                                icon={Sparkles}
                                trend={evolution?.prediction ? "up" : "neutral"}
                                change={evolution?.inferencePeriod ?? "-"}
                                comparisonLabel="Periodo"
                                description="Stima spesa del prossimo mese."
                                className={brainKpiCardClassName}
                                valueClassName={brainKpiMoneyValueClassName}
                                compact
                            />
                            <KpiCard
                                title="Residuo mese corrente"
                                value={currentMonthRemainingLabel}
                                icon={CalendarClock}
                                trend={advisorNowcastReady ? "neutral" : "warning"}
                                change={advisorNowcastReady ? `${currentMonthConfidencePercent}%` : evolution ? `Soglia ${adaptiveNowcastConfidencePercent}%` : "Non pronta"}
                                comparisonLabel={advisorNowcastReady ? "Confidenza" : "Policy"}
                                description="Stima residua validata con soglia adattiva."
                                className={brainKpiCardClassName}
                                valueClassName={brainKpiMoneyValueClassName}
                                compact
                            />
                        </div>

                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BrainCircuit className="h-5 w-5" />
                                    Mappa segnali del Core
                                </CardTitle>
                                <CardDescription>
                                    Ogni barra indica quanto pesa una componente interna del Core sulla stima attuale. I neuroni (1, 2, 3...) sono parti tecniche del modello, non categorie di spesa.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {vectorWeights.map((weight, index) => {
                                    const intensity = clampPercent(Math.abs(weight) * 28)
                                    const intensityScale = Math.max(0, Math.min(1, intensity / 100))
                                    return (
                                        <div
                                            key={`weight-${index}`}
                                            className="rounded-xl border border-border/60 bg-muted/20 p-3"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[11px] font-bold tracking-wide text-foreground/85">
                                                    Neurone {index + 1}
                                                </p>
                                                <p className="text-xs font-medium tabular-nums text-muted-foreground">
                                                    {weight.toFixed(4)}
                                                </p>
                                            </div>
                                            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-background/70">
                                                <motion.div
                                                    className="h-full w-full origin-left transform-gpu rounded-full bg-gradient-to-r from-primary via-info to-success"
                                                    initial={{ scaleX: 0 }}
                                                    animate={{ scaleX: intensityScale }}
                                                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>

                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Fattori principali della stima
                                </CardTitle>
                                <CardDescription>
                                    Qui vedi i fattori che stanno alzando o abbassando la stima in questo momento.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {contributorsTop.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Stima non ancora pronta: servono piu dati o una nuova analisi completa.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {contributorsTop.map((item) => (
                                            <div key={item.feature} className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-bold text-foreground tracking-wide">{formatFeatureLabel(item.feature)}</p>
                                                    <p className="text-xs text-muted-foreground tabular-nums">
                                                        effetto sulla stima {item.contribution.toFixed(4)}
                                                    </p>
                                                </div>
                                                <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                                                    valore attuale {item.value.toFixed(4)} · peso interno {item.weight.toFixed(4)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </MacroSection>
            </motion.div>
        </StaggerContainer>
    )
}
