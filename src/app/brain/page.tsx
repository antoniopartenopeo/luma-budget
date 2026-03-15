"use client"

import { useMemo } from "react"
import {
    Brain,
    CalendarClock,
    Crosshair,
    Gauge,
    ShieldCheck,
    Sparkles,
    TrendingUp,
} from "lucide-react"
import { motion } from "framer-motion"
import {
    BRAIN_MATURITY_SAMPLE_TARGET,
    NEURAL_BRAIN_VECTOR_SIZE,
} from "@/brain"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { useCategories } from "@/features/categories/api/use-categories"
import { useCurrency } from "@/features/settings/api/use-currency"
import { resolveAdaptiveNowcastConfidenceThreshold } from "@/features/insights/brain-adaptive-thresholds"
import {
    BRAIN_CONSISTENCY_LABEL,
    BRAIN_HISTORY_LABEL,
    BRAIN_READY_LABEL,
} from "@/features/insights/brain-copy"
import { useBrainRuntime } from "@/features/insights/brain-runtime"
import { formatCents } from "@/domain/money"
import { PageHeader } from "@/components/ui/page-header"
import { MacroSection, macroItemVariants } from "@/components/patterns/macro-section"
import { KpiCard } from "@/components/patterns/kpi-card"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { getCurrentPeriod } from "@/lib/date-ranges"

import { NeuralFieldBackground } from "./_components/neural-field-background"
import { BrainHeroSection } from "./_components/brain-hero-section"
import { SignalMatrix } from "./_components/signal-matrix"

const STABILITY_LOSS_TARGET = 0.12
const LONG_STATUS_VALUE_CLASS_NAME = "text-lg sm:text-xl lg:text-[1.7rem] leading-tight"
const UNAVAILABLE_LABEL = "Non disponibile"
const PREPARING_FORECAST_LABEL = "Sto stimando"
const VERIFYING_LABEL = "Sto verificando"
const NOT_RELIABLE_YET_LABEL = "Non ancora affidabile"

function formatUpdatedAt(value: string | null): string {
    if (!value) return UNAVAILABLE_LABEL
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value

    return new Intl.DateTimeFormat("it-IT", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsed)
}

function formatClock(value: string): string {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return UNAVAILABLE_LABEL

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

export default function BrainPage() {
    const currentPeriod = getCurrentPeriod()
    const { data: transactions = [] } = useTransactions()
    const { data: categories = [] } = useCategories({ includeArchived: true })
    const { currency, locale } = useCurrency()
    const brainRuntime = useBrainRuntime({ mode: "active", preferredPeriod: currentPeriod })

    const snapshot = brainRuntime.snapshot
    const evolution = brainRuntime.evolution
    const training = brainRuntime.training
    const stage = brainRuntime.stage
    const adaptivePolicy = brainRuntime.adaptivePolicy
    const timeline = brainRuntime.timeline
    const isInitialized = brainRuntime.isInitialized

    const experienceProgress = useMemo(() => {
        const trainedSamples = snapshot?.trainedSamples ?? 0
        return clampPercent((trainedSamples / BRAIN_MATURITY_SAMPLE_TARGET) * 100)
    }, [snapshot?.trainedSamples])

    const liveLoss = training.isTraining ? training.currentLoss : (snapshot?.lossEma ?? 0)

    const stabilityProgress = useMemo(() => {
        const normalizedLoss = Math.min(liveLoss / STABILITY_LOSS_TARGET, 1)
        return clampPercent((1 - normalizedLoss) * 100)
    }, [liveLoss])

    const brainReadiness = useMemo(() => {
        if (!snapshot) return 0
        const learned = clampPercent(experienceProgress * 0.72 + stabilityProgress * 0.28)
        return training.isTraining ? Math.max(learned, training.progress) : learned
    }, [experienceProgress, snapshot, stabilityProgress, training.isTraining, training.progress])

    const vectorWeights = useMemo(
        () => snapshot?.weights ?? new Array(NEURAL_BRAIN_VECTOR_SIZE).fill(0),
        [snapshot?.weights]
    )
    const activeWeightsCount = useMemo(
        () => vectorWeights.filter((weight) => weight !== 0).length,
        [vectorWeights]
    )

    const confidencePercent = evolution?.prediction
        ? Math.round(evolution.prediction.confidence * 100)
        : 0
    const currentMonthConfidencePercent = evolution
        ? Math.round(evolution.currentMonthNowcastConfidence * 100)
        : 0

    const predictedExpensesLabel = evolution?.prediction
        ? formatCents(evolution.predictedExpensesNextMonthCents, currency, locale)
        : "-"
    const rawCurrentMonthRemainingLabel = evolution?.currentMonthNowcastReady
        ? formatCents(evolution.predictedCurrentMonthRemainingExpensesCents, currency, locale)
        : "-"

    const nextMonthMaeLabel = evolution && evolution.nextMonthReliability.sampleCount > 0
        ? formatRatioAsPercent(evolution.nextMonthReliability.mae)
        : "-"
    const nextMonthMapeLabel = evolution && evolution.nextMonthReliability.mapeSampleCount > 0
        ? formatRatioAsPercent(evolution.nextMonthReliability.mape)
        : "-"
    const nextMonthMaePercent = evolution && evolution.nextMonthReliability.sampleCount > 0
        ? evolution.nextMonthReliability.mae * 100
        : null
    const nextMonthMapePercent = evolution && evolution.nextMonthReliability.mapeSampleCount > 0
        ? evolution.nextMonthReliability.mape * 100
        : null
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

    const predictedExpensesDisplayLabel = evolution?.prediction
        ? predictedExpensesLabel
        : brainRuntime.isLoading
            ? PREPARING_FORECAST_LABEL
            : UNAVAILABLE_LABEL
    const currentMonthRemainingDisplayLabel = advisorNowcastReady
        ? rawCurrentMonthRemainingLabel
        : evolution
            ? NOT_RELIABLE_YET_LABEL
            : VERIFYING_LABEL
    const forecastConfidenceDisplayLabel = evolution?.prediction
        ? `${confidencePercent}%`
        : brainRuntime.isLoading
            ? VERIFYING_LABEL
            : UNAVAILABLE_LABEL
    const nextMonthMaeDisplayLabel = nextMonthMaeLabel === "-" ? UNAVAILABLE_LABEL : nextMonthMaeLabel
    const nextMonthMapeDisplayLabel = nextMonthMapeLabel === "-" ? UNAVAILABLE_LABEL : nextMonthMapeLabel
    const updatedAtLabel = formatUpdatedAt(training.lastCompletedAt ?? snapshot?.updatedAt ?? null)
    const contributors = evolution?.prediction?.contributors ?? []

    return (
        <StaggerContainer className="space-y-8 pb-20 md:pb-10">
            <motion.div variants={macroItemVariants}>
                <PageHeader
                    title="Brain"
                    description="Qui vedi cosa sta leggendo il Brain, quali stime sta producendo e da quali segnali dipendono."
                />
            </motion.div>

            <motion.div variants={macroItemVariants}>
                <MacroSection
                    variant="premium"
                    background={<NeuralFieldBackground />}
                    contentClassName="pt-4"
                >
                    <BrainHeroSection
                        hwForecast={evolution?.hwForecast ?? null}
                        currency={currency}
                        locale={locale}
                        training={training}
                        isInitialized={isInitialized}
                        handleInitialize={brainRuntime.initialize}
                        handleReset={brainRuntime.reset}
                        timeline={timeline}
                        formatClock={formatClock}
                        transactionsCount={brainRuntime.transactionsCount || transactions.length}
                        categoriesCount={brainRuntime.categoriesCount || categories.length}
                        updatedAtLabel={updatedAtLabel}
                        stageLabel={stage.label}
                        stageSummary={stage.summary}
                    />
                </MacroSection>
            </motion.div>

            <MacroSection
                title="Stato del Brain"
                description="Le stime principali del Brain e quanto sono affidabili in questo momento."
                contentClassName="pt-5"
                background={
                    <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(14,165,168,0.06),transparent_30%),linear-gradient(330deg,rgba(148,163,184,0.06),transparent_35%)]" />
                }
            >
                <div className="space-y-4">
                    <StaggerContainer className="grid gap-4 lg:grid-cols-3">
                        <motion.div variants={macroItemVariants} className="h-full">
                            <KpiCard
                                title="Spesa prossimo mese"
                                value={predictedExpensesDisplayLabel}
                                valueClassName={evolution?.prediction ? undefined : LONG_STATUS_VALUE_CLASS_NAME}
                                icon={Sparkles}
                                trend={evolution?.prediction ? "up" : "neutral"}
                                change={evolution?.inferencePeriod ?? PREPARING_FORECAST_LABEL}
                                comparisonLabel="Periodo"
                                description="Quanto potresti spendere il mese prossimo."
                                explainabilityText="Il Brain usa storico, ritmo recente e periodo dell'anno per stimare il totale del prossimo mese."
                            />
                        </motion.div>

                        <motion.div variants={macroItemVariants} className="h-full">
                            <KpiCard
                                title="Residuo stimato del mese"
                                value={currentMonthRemainingDisplayLabel}
                                valueClassName={advisorNowcastReady ? undefined : LONG_STATUS_VALUE_CLASS_NAME}
                                icon={CalendarClock}
                                trend={advisorNowcastReady ? "neutral" : "warning"}
                                change={advisorNowcastReady ? `${currentMonthConfidencePercent}%` : `Soglia ${adaptiveNowcastConfidencePercent}%`}
                                comparisonLabel={advisorNowcastReady ? "Affidabilità" : "Soglia qualità"}
                                description={advisorNowcastReady
                                    ? "Quanto potresti ancora spendere da qui a fine mese."
                                    : "Il numero compare solo quando supera il controllo di qualità."}
                                explainabilityText="Il Brain mostra questo dato solo quando lo considera abbastanza affidabile."
                            />
                        </motion.div>

                        <motion.div variants={macroItemVariants} className="h-full">
                            <KpiCard
                                title="Affidabilità della stima"
                                value={forecastConfidenceDisplayLabel}
                                valueClassName={evolution?.prediction ? undefined : LONG_STATUS_VALUE_CLASS_NAME}
                                icon={ShieldCheck}
                                tone={
                                    !evolution?.prediction ? "neutral"
                                        : confidencePercent >= 75 ? "positive"
                                            : confidencePercent >= 45 ? "neutral"
                                                : "warning"
                                }
                                change={evolution?.prediction ? `${nextMonthReliabilitySamples} mesi` : stage.label}
                                comparisonLabel={evolution?.prediction ? "Storico" : "Stato"}
                                description="Quanto il Brain si fida della previsione del prossimo mese."
                                explainabilityText="Più il valore è alto, più la previsione è stabile e coerente con lo storico già visto."
                            />
                        </motion.div>
                    </StaggerContainer>

                    <StaggerContainer className="grid gap-4 lg:grid-cols-2">
                        <motion.div variants={macroItemVariants} className="h-full">
                            <KpiCard
                                title={BRAIN_READY_LABEL}
                                value={`${brainReadiness}%`}
                                animatedValue={brainReadiness}
                                formatFn={(value) => `${Math.round(value)}%`}
                                icon={Gauge}
                                tone={brainReadiness >= 80 ? "positive" : brainReadiness >= 40 ? "neutral" : "warning"}
                                change={stage.label}
                                comparisonLabel="Fase"
                                description="Quanto il Brain ha dati e stabilità sufficienti per lavorare bene."
                                explainabilityText="Tiene insieme quantità di storico letto e regolarità dell'apprendimento."
                                compact
                            />
                        </motion.div>

                        <motion.div variants={macroItemVariants} className="h-full">
                            <KpiCard
                                title={BRAIN_HISTORY_LABEL}
                                value={`${experienceProgress}%`}
                                animatedValue={experienceProgress}
                                formatFn={(value) => `${Math.round(value)}%`}
                                icon={TrendingUp}
                                tone={experienceProgress >= 80 ? "positive" : "neutral"}
                                change={`${snapshot?.trainedSamples ?? 0}/${BRAIN_MATURITY_SAMPLE_TARGET} dati`}
                                comparisonLabel="Dati letti"
                                description="Quanto storico utile il Brain ha già imparato a leggere."
                                explainabilityText="Confronta i dati già letti con il livello considerato maturo per produrre stime più solide."
                                compact
                            />
                        </motion.div>
                    </StaggerContainer>
                </div>
            </MacroSection>

            <MacroSection
                title="Dettagli tecnici del Brain"
                description="Indicatori interni utili per capire come sta lavorando il Brain, separati dalle stime principali."
                contentClassName="pt-5"
                background={
                    <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(14,165,168,0.08),transparent_26%),linear-gradient(330deg,rgba(148,163,184,0.06),transparent_36%)] dark:bg-[linear-gradient(145deg,rgba(255,255,255,0.04),transparent_24%),radial-gradient(circle_at_top_right,rgba(14,165,168,0.1),transparent_26%),linear-gradient(330deg,rgba(148,163,184,0.08),transparent_36%)]" />
                }
            >
                <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title={BRAIN_CONSISTENCY_LABEL}
                            value={`${stabilityProgress}%`}
                            animatedValue={stabilityProgress}
                            formatFn={(value) => `${Math.round(value)}%`}
                            icon={ShieldCheck}
                            tone={stabilityProgress >= 70 ? "positive" : stabilityProgress >= 30 ? "neutral" : "warning"}
                            description="Indice tecnico di quanto il Brain sta imparando in modo regolare."
                            explainabilityText={`Si basa su un indicatore interno di errore. Valore attuale ${liveLoss.toFixed(4)}: più è basso, più l'apprendimento è stabile.`}
                            compact
                        />
                    </motion.div>

                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Segnali interni attivi"
                            value={`${activeWeightsCount}/${vectorWeights.length}`}
                            icon={Brain}
                            tone={activeWeightsCount === vectorWeights.length ? "positive" : "neutral"}
                            description="Quanti segnali interni stanno partecipando alla stima."
                            explainabilityText="Non sono categorie di spesa: sono indicatori tecnici che il Brain combina per arrivare al risultato."
                            compact
                        />
                    </motion.div>

                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Scarto medio storico"
                            value={nextMonthMaeDisplayLabel}
                            valueClassName={nextMonthMaeLabel === "-" ? LONG_STATUS_VALUE_CLASS_NAME : undefined}
                            icon={Crosshair}
                            tone={
                                nextMonthMaePercent === null ? "neutral"
                                    : nextMonthMaePercent <= 15 ? "positive"
                                        : nextMonthMaePercent <= 30 ? "neutral"
                                            : "warning"
                            }
                            change={`${nextMonthReliabilitySamples} mesi`}
                            comparisonLabel="Mesi utili"
                            description="Di quanto, in media, le vecchie stime si sono allontanate dal valore reale."
                            explainabilityText="È un indicatore tecnico: più è basso, più il Brain ci ha preso nelle previsioni già verificate."
                            compact
                        />
                    </motion.div>

                    <motion.div variants={macroItemVariants} className="h-full">
                        <KpiCard
                            title="Errore percentuale storico"
                            value={nextMonthMapeDisplayLabel}
                            valueClassName={nextMonthMapeLabel === "-" ? LONG_STATUS_VALUE_CLASS_NAME : undefined}
                            icon={ShieldCheck}
                            tone={
                                nextMonthMapePercent === null ? "neutral"
                                    : nextMonthMapePercent <= 15 ? "positive"
                                        : nextMonthMapePercent <= 30 ? "neutral"
                                            : "warning"
                            }
                            description="Quanto pesava in percentuale l'errore medio sulle stime già verificate."
                            explainabilityText="Esempio: 15% significa che lo scarto medio era circa il 15% del totale stimato."
                            compact
                        />
                    </motion.div>
                </StaggerContainer>
            </MacroSection>

            <MacroSection
                title="Segnali del Brain"
                description="Qui vedi i fattori che in questo momento stanno pesando di più sulla stima. Selezionane uno per capire come influisce."
                contentClassName="pt-5"
                background={
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_left,rgba(14,165,168,0.08),transparent_30%),linear-gradient(140deg,rgba(148,163,184,0.06),transparent_42%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_28%),radial-gradient(circle_at_top_left,rgba(14,165,168,0.11),transparent_30%),linear-gradient(140deg,rgba(148,163,184,0.08),transparent_42%)]" />
                }
            >
                <SignalMatrix contributors={contributors} />
            </MacroSection>
        </StaggerContainer>
    )
}
