import { motion } from "framer-motion"
import { BrainCircuit, Database, History, TrendingDown, TrendingUp, RotateCcw, Zap } from "lucide-react"
import type { HoltWintersResult } from "@/brain/forecaster"
import type { EventTone, TimelineEvent, TrainingState } from "@/features/insights/brain-runtime-types"
import { formatCents } from "@/domain/money"
import { SubSectionCard } from "@/components/patterns/sub-section-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function eventToneClass(tone: EventTone): string {
    if (tone === "positive") return "bg-success"
    if (tone === "warning") return "bg-warning"
    if (tone === "critical") return "bg-destructive"
    return "bg-primary/70"
}

function resolveTrendHeadline(trendCents: number): string {
    if (trendCents > 0) return "Spesa in aumento"
    if (trendCents < 0) return "Spesa in calo"
    return "Spesa stabile"
}

function resolveTrendDescription(trendCents: number, formattedTrend: string): string {
    if (trendCents > 0) {
        return `Rispetto al tuo livello abituale, il Brain vede una spesa più alta di circa ${formattedTrend} al mese.`
    }

    if (trendCents < 0) {
        return `Rispetto al tuo livello abituale, il Brain vede una spesa più bassa di circa ${formattedTrend} al mese.`
    }

    return "Rispetto al tuo livello abituale, il Brain vede un ritmo di spesa abbastanza stabile."
}

function resolveSeasonalityDescription(seasonalAdjustmentCents: number, formattedSeasonality: string): string {
    if (seasonalAdjustmentCents > 0) {
        return `In questo periodo dell'anno lo storico tende a far salire la spesa di circa ${formattedSeasonality}.`
    }

    if (seasonalAdjustmentCents < 0) {
        return `In questo periodo dell'anno lo storico tende a far scendere la spesa di circa ${formattedSeasonality}.`
    }

    return "In questo periodo dell'anno non emerge un effetto stagionale rilevante."
}

interface BrainHeroSectionProps {
    hwForecast: HoltWintersResult | null
    currency: string
    locale: string
    training: TrainingState
    isInitialized: boolean
    handleInitialize: () => void
    handleReset: () => void
    timeline: TimelineEvent[]
    formatClock: (value: string) => string
    transactionsCount: number
    categoriesCount: number
    updatedAtLabel: string
    stageLabel: string
    stageSummary: string
}

export function BrainHeroSection({
    hwForecast,
    currency,
    locale,
    training,
    isInitialized,
    handleInitialize,
    handleReset,
    timeline,
    formatClock,
    transactionsCount,
    categoriesCount,
    updatedAtLabel,
    stageLabel,
    stageSummary,
}: BrainHeroSectionProps) {
    const formattedTrend = hwForecast
        ? formatCents(Math.abs(hwForecast.trendCents), currency, locale)
        : null
    const formattedSeasonality = hwForecast
        ? formatCents(Math.abs(hwForecast.seasonalAdjustmentCents), currency, locale)
        : null
    const formattedConfidenceRange = hwForecast
        ? formatCents(hwForecast.confidenceIntervalCents, currency, locale)
        : null

    return (
        <div className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-3">
                <SubSectionCard
                    label="Stato attuale"
                    icon={<BrainCircuit className="h-3.5 w-3.5 text-primary" />}
                    className="rounded-[1.8rem] border border-white/40 bg-white/38 p-5 shadow-[0_22px_42px_-32px_rgba(15,23,42,0.28)]"
                >
                    <div className="space-y-3">
                        <p className="text-2xl font-black tracking-tighter text-foreground">
                            {stageLabel}
                        </p>
                        <p className="max-w-[34ch] text-sm font-medium leading-relaxed text-muted-foreground">
                            {stageSummary}
                        </p>
                    </div>
                </SubSectionCard>

                <SubSectionCard
                    label="Ritmo del mese"
                    icon={hwForecast?.trendCents && hwForecast.trendCents >= 0
                        ? <TrendingUp className="h-3.5 w-3.5 text-destructive/80" />
                        : <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />}
                    className="rounded-[1.8rem] border border-white/40 bg-white/38 p-5 shadow-[0_22px_42px_-32px_rgba(15,23,42,0.28)]"
                >
                    {hwForecast ? (
                        <div className="space-y-3">
                            <p className="text-2xl font-black tracking-tighter text-foreground">
                                {resolveTrendHeadline(hwForecast.trendCents)}
                            </p>
                            <p className="text-sm font-medium text-muted-foreground">
                                {resolveTrendDescription(hwForecast.trendCents, formattedTrend ?? "-")}
                            </p>
                            <div className="space-y-2">
                                <div className="rounded-[1.35rem] border border-white/45 bg-white/46 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.05]">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                        Effetto del periodo
                                    </p>
                                    <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
                                        {resolveSeasonalityDescription(hwForecast.seasonalAdjustmentCents, formattedSeasonality ?? "-")}
                                    </p>
                                </div>
                                <div className="rounded-[1.35rem] border border-white/45 bg-white/46 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.05]">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                        Possibile oscillazione
                                    </p>
                                    <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
                                        Questa lettura può ancora muoversi di circa {formattedConfidenceRange} in più o in meno.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xl font-black tracking-tighter text-foreground">
                                In preparazione
                            </p>
                            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                Questa lettura compare quando il Brain ha abbastanza dati per capire il ritmo del mese.
                            </p>
                        </div>
                    )}
                </SubSectionCard>

                <SubSectionCard
                    label="Dati analizzati"
                    icon={<Database className="h-3.5 w-3.5 text-primary" />}
                    className="rounded-[1.8rem] border border-white/40 bg-white/38 p-5 shadow-[0_22px_42px_-32px_rgba(15,23,42,0.28)]"
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[1.35rem] border border-white/45 bg-white/46 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.05]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                Transazioni lette
                            </p>
                            <p className="mt-1 text-xl font-black tracking-tighter tabular-nums text-foreground">
                                {transactionsCount}
                            </p>
                        </div>
                        <div className="rounded-[1.35rem] border border-white/45 bg-white/46 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/10 dark:bg-white/[0.05]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                Categorie lette
                            </p>
                            <p className="mt-1 text-xl font-black tracking-tighter tabular-nums text-foreground">
                                {categoriesCount}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-start gap-3 rounded-[1.35rem] border border-white/40 bg-white/34 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:bg-white/[0.035]">
                        <History className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                Ultimo aggiornamento
                            </p>
                            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                {updatedAtLabel}
                            </p>
                        </div>
                    </div>
                </SubSectionCard>
            </div>

            <div className="surface-subtle rounded-[1.8rem] p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                            Azioni Brain
                        </p>
                        <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
                            Avvia o azzera il Brain quando vuoi. Quando arrivano nuovi dati, il Brain rilegge il contesto e aggiorna le sue stime.
                        </p>
                        {training.isTraining ? (
                            <div className="flex items-center gap-2 pt-1">
                                <span className="h-2 w-2 animate-pulse-soft rounded-full bg-primary" />
                                <p className="text-sm font-medium text-muted-foreground tabular-nums">
                                    Analisi in corso · passaggio {training.epoch}/{training.totalEpochs} · {training.sampleCount} dati letti
                                </p>
                            </div>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            size="sm"
                            onClick={handleInitialize}
                            disabled={isInitialized || training.isTraining}
                        >
                            <Zap className="h-3.5 w-3.5" />
                            Avvia il Brain
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            disabled={!isInitialized || training.isTraining}
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Azzera il Brain
                        </Button>
                    </div>
                </div>
            </div>

            {timeline.length > 0 && (
                <div className="glass-card rounded-[1.8rem] border border-white/38 p-5 shadow-[0_22px_42px_-32px_rgba(15,23,42,0.26)]">
                    <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                        Attività recenti
                    </h4>
                    <div className="relative space-y-5 pl-4 before:absolute before:bottom-1 before:left-[0.2rem] before:top-1 before:w-px before:bg-border/60">
                        {timeline.slice(0, 5).map((event, i) => (
                            <motion.div
                                key={event.id}
                                className="relative flex items-start gap-4"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className={cn(
                                    "absolute -left-[1.15rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                                    eventToneClass(event.tone)
                                )} />

                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs font-bold tracking-tight text-foreground/90">
                                            {event.title}
                                        </p>
                                        <time className="text-[10px] font-medium text-muted-foreground/50 tabular-nums">
                                            {formatClock(event.at)}
                                        </time>
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground/70 leading-relaxed">
                                        {event.detail}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
