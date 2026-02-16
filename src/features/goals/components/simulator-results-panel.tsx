"use client"

import { formatCents } from "@/domain/money"
import { GoalScenarioResult } from "@/VAULT/goals/types"
import { useCurrency } from "@/features/settings/api/use-currency"
import { cn } from "@/lib/utils"
import { ShieldCheck, Target, TrendingUp, Wallet } from "lucide-react"

import { MonitorPlanCard } from "./monitor-plan-card"

interface SimulatorResultsPanelProps {
    scenario: GoalScenarioResult
    simulatedSurplusBase: number
    simulatedSurplus: number
    realtimeCapacityFactor: number
    goalMonthlyCapacityRealtime: number
    realtimeWindowMonths: number
    savingsPercent: number
    likelyMonthsForCopy: number | null
    hasInsufficientData: boolean
}

function getSustainabilityLabel(status: GoalScenarioResult["sustainability"]["status"]): string {
    if (status === "secure") return "Molto solido"
    if (status === "sustainable") return "Solido"
    if (status === "fragile") return "Delicato"
    return "A rischio"
}

function getSustainabilityGuidance(scenario: GoalScenarioResult): string {
    if (scenario.sustainability.reason) {
        return scenario.sustainability.reason
    }

    if (scenario.sustainability.status === "secure") {
        return "Sì: il piano lascia un buon margine di sicurezza ogni mese."
    }
    if (scenario.sustainability.status === "sustainable") {
        return "Sì: il piano regge, ma con margine moderato."
    }
    if (scenario.sustainability.status === "fragile") {
        return "Parzialmente: il piano è delicato e va monitorato."
    }
    return "No: il piano è troppo tirato per essere sicuro."
}

function getPlanBasisLabel(planBasis: GoalScenarioResult["planBasis"]): string {
    if (planBasis === "brain_overlay") return "Fonte Brain"
    if (planBasis === "fallback_overlay") return "Fonte Storico+Live"
    return "Fonte Storico"
}

export function SimulatorResultsPanel({
    scenario,
    simulatedSurplusBase,
    simulatedSurplus,
    realtimeCapacityFactor,
    goalMonthlyCapacityRealtime,
    realtimeWindowMonths,
    savingsPercent,
    likelyMonthsForCopy,
    hasInsufficientData
}: SimulatorResultsPanelProps) {
    const { currency, locale } = useCurrency()
    const goalMonthlyCapacity = realtimeWindowMonths > 0
        ? goalMonthlyCapacityRealtime
        : scenario.monthlyGoalCapacityCents
    const realtimeAdjustmentCents = simulatedSurplus - simulatedSurplusBase
    const realtimeAdjustmentSign = realtimeAdjustmentCents > 0 ? "+" : ""
    const realtimePercentDelta = Math.round((realtimeCapacityFactor - 1) * 100)
    const realtimePercentSign = realtimePercentDelta > 0 ? "+" : ""
    const realtimeStepLabel = realtimeWindowMonths > 0
        ? `2) Correzione live (${realtimeWindowMonths} mesi)`
        : "2) Correzione live"
    const sustainabilityLabel = getSustainabilityLabel(scenario.sustainability.status)
    const sustainabilityGuidance = getSustainabilityGuidance(scenario)
    const sustainabilityToneClass = scenario.sustainability.status === "unsafe"
        ? "text-rose-500"
        : scenario.sustainability.status === "fragile"
            ? "text-amber-500"
            : "text-emerald-500"
    const sustainabilityPanelClass = scenario.sustainability.status === "unsafe"
        ? "border-rose-500/30 bg-rose-500/[0.06]"
        : scenario.sustainability.status === "fragile"
            ? "border-amber-500/30 bg-amber-500/[0.06]"
            : "border-emerald-500/25 bg-emerald-500/[0.05]"
    const planBasisLabel = getPlanBasisLabel(scenario.planBasis)
    const realtimeBadgeLabel = realtimeWindowMonths > 0 ? `Live ${realtimeWindowMonths} mesi` : "Solo storico"
    const realtimeNarrative = realtimeWindowMonths > 0
        ? `Per i prossimi ${realtimeWindowMonths} mesi aggiorniamo il margine con dati piu recenti, poi torniamo alla base storica.`
        : "Nessuna correzione live attiva: usiamo solo la base storica."

    return (
        <div className="pt-8 space-y-6 relative z-10">
            <div className="relative glass-card rounded-2xl border border-border/40 p-4 sm:p-5 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(120%_100%_at_0%_0%,rgba(16,185,129,0.08),transparent_45%)]" />
                <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                Come nasce la quota
                            </h4>
                            <p className="text-sm text-muted-foreground/90">
                                Qui vedi, passo per passo, come arriviamo alla tua quota mensile.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                            <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                                {planBasisLabel}
                            </span>
                            <span className="rounded-full border border-white/20 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {realtimeBadgeLabel}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm items-stretch">
                        <div className="rounded-xl border border-border/50 bg-background/20 p-3 h-full min-h-[176px] flex flex-col">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Wallet className="h-3.5 w-3.5" />
                                <p className="text-xs font-semibold">1) Margine base storico</p>
                            </div>
                            <div className="mt-auto space-y-1">
                                <p className="text-base font-bold tabular-nums">{formatCents(simulatedSurplusBase, currency, locale)}/mese</p>
                                <p className="text-xs text-muted-foreground/80 min-h-[32px]">Quanto in media ti rimane a fine mese dai dati storici.</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border/50 bg-background/20 p-3 h-full min-h-[176px] flex flex-col">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <TrendingUp className="h-3.5 w-3.5" />
                                <p className="text-xs font-semibold">{realtimeStepLabel}</p>
                            </div>
                            <div className="mt-auto space-y-1">
                                <div className="flex items-center justify-between gap-3">
                                    <p className={cn(
                                        "text-base font-bold tabular-nums",
                                        realtimeAdjustmentCents < 0 ? "text-amber-500" : realtimeAdjustmentCents > 0 ? "text-emerald-500" : "text-muted-foreground"
                                    )}>
                                        {realtimeAdjustmentSign}{formatCents(realtimeAdjustmentCents, currency, locale)}
                                        {realtimeWindowMonths > 0 ? ` (${realtimePercentSign}${realtimePercentDelta}%)` : ""}
                                    </p>
                                    <p className="text-[11px] sm:text-xs font-semibold text-foreground/90 tabular-nums text-right">
                                        Margine aggiornato: {formatCents(simulatedSurplus, currency, locale)}/mese
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground/80 min-h-[32px]">{realtimeNarrative}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-primary/25 bg-primary/[0.07] p-3 h-full min-h-[176px] flex flex-col">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Target className="h-3.5 w-3.5 text-primary" />
                                <p className="text-xs font-semibold">3) In pratica</p>
                            </div>
                            <div className="mt-auto space-y-1">
                                <p className="text-xl sm:text-2xl font-black tabular-nums">{formatCents(goalMonthlyCapacity, currency, locale)}/mese</p>
                                <p className="text-xs text-muted-foreground/80 min-h-[32px]">Questa e la quota consigliata da mettere sull'obiettivo ogni mese.</p>
                            </div>
                        </div>
                    </div>

                    <div className={cn("mt-4 rounded-xl border p-3 space-y-1", sustainabilityPanelClass)}>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm flex items-center gap-2 text-muted-foreground">
                                <ShieldCheck className="h-4 w-4" />
                                Tenuta del piano
                            </span>
                            <span className={cn("text-sm font-bold", sustainabilityToneClass)}>{sustainabilityLabel}</span>
                        </div>
                        <p className="text-xs text-muted-foreground/85">
                            {sustainabilityGuidance}
                        </p>
                    </div>

                </div>
            </div>

            <MonitorPlanCard
                scenario={scenario}
                savingsPercent={savingsPercent}
                goalMonthlyCapacityCents={goalMonthlyCapacity}
                monthsToGoal={likelyMonthsForCopy}
                hasInsufficientData={hasInsufficientData}
            />
        </div>
    )
}
