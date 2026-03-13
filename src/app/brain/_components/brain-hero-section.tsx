
import { TrendingDown, TrendingUp, RotateCcw, Zap } from "lucide-react"
import { EChartsWrapper } from "@/features/dashboard/components/charts/echarts-wrapper"
import type { EChartsOption } from "echarts"
import type { HoltWintersResult } from "@/brain/forecaster"
import { formatCents } from "@/domain/money"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { TimelineEvent, TrainingState, EventTone } from "../types"

function eventToneClass(tone: EventTone): string {
    if (tone === "positive") return "bg-success"
    if (tone === "warning") return "bg-warning"
    if (tone === "critical") return "bg-destructive"
    return "bg-primary/70"
}

interface BrainHeroSectionProps {
    evolutionChartOption: EChartsOption
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
}

export function BrainHeroSection({
    evolutionChartOption,
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
}: BrainHeroSectionProps) {
    return (
        <div className="space-y-5">
            {/* Chart */}
            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="h-[280px] w-full">
                    <EChartsWrapper option={evolutionChartOption} />
                </div>
            </div>

            {/* HW Forecast summary — minimal */}
            {hwForecast && (
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 px-1">
                    <div className="flex items-center gap-2">
                        {hwForecast.trendCents >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-destructive/70" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-success/70" />
                        )}
                        <p className="text-lg font-black tracking-tighter tabular-nums">
                            {hwForecast.trendCents >= 0 ? "+" : ""}{formatCents(hwForecast.trendCents, currency, locale)}/mese
                        </p>
                    </div>
                    {hwForecast.method === "triple" && hwForecast.seasonalAdjustmentCents !== 0 && (
                        <p className="text-sm font-medium text-muted-foreground">
                            Stagionalità {hwForecast.seasonalAdjustmentCents > 0 ? "+" : ""}{formatCents(hwForecast.seasonalAdjustmentCents, currency, locale)}
                        </p>
                    )}
                    <p className="text-xs font-medium text-muted-foreground tabular-nums">
                        ±{formatCents(hwForecast.confidenceIntervalCents, currency, locale)} · {hwForecast.dataPoints} mesi · {hwForecast.method === "triple" ? "stagionale" : "trend"}
                    </p>
                </div>
            )}

            {/* Training status */}
            {training.isTraining && (
                <div className="flex items-center gap-3 px-1">
                    <span className="h-2 w-2 animate-pulse-soft rounded-full bg-primary" />
                    <p className="text-sm font-medium text-muted-foreground tabular-nums">
                        Ciclo {training.epoch}/{training.totalEpochs} · {training.sampleCount} campioni · stabilità {training.currentLoss.toFixed(4)}
                    </p>
                </div>
            )}

            {/* Actions — minimal row */}
            <div className="flex flex-wrap items-center gap-3 px-1">
                <Button
                    size="sm"
                    onClick={handleInitialize}
                    disabled={isInitialized || training.isTraining}
                >
                    <Zap className="h-3.5 w-3.5" />
                    Avvia Core
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={!isInitialized || training.isTraining}
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Resetta
                </Button>
                <p className="text-xs font-medium text-muted-foreground">
                    {transactionsCount} transazioni · {categoriesCount} categorie · ultima analisi {updatedAtLabel}
                </p>
            </div>

            {/* Activity log — collapsed by default */}
            {timeline.length > 0 && (
                <Accordion type="single" collapsible className="px-1">
                    <AccordionItem value="activity-log" className="border-none">
                        <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline">
                            Registro attività
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {timeline.map((event) => (
                                    <div key={event.id} className="flex items-start gap-2 rounded-lg px-2 py-1.5">
                                        <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", eventToneClass(event.tone))} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-bold text-foreground">{event.title}</p>
                                                <p className="shrink-0 text-[10px] font-medium text-muted-foreground tabular-nums">{formatClock(event.at)}</p>
                                            </div>
                                            <p className="text-xs font-medium text-muted-foreground">{event.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </div>
    )
}
