"use client"

import { formatCents } from "@/domain/money"
import { QuotaScenarioResult } from "@/VAULT/goals/types"
import { useCurrency } from "@/features/settings/api/use-currency"
import { cn } from "@/lib/utils"
import { ShieldCheck, Target, TrendingUp, Wallet } from "lucide-react"
import {
    FINANCIAL_LAB_COPY,
    getPlanBasisLabel,
    getRealtimeBadgeLabel,
    getRealtimeNarrative,
    getRealtimeStepLabel,
    getSustainabilityGuidance,
    getSustainabilityLabel
} from "@/features/goals/utils/financial-lab-copy"

import { MonitorPlanCard } from "./monitor-plan-card"

interface SimulatorResultsPanelProps {
    scenario: QuotaScenarioResult
    simulatedSurplusBase: number
    simulatedSurplus: number
    realtimeCapacityFactor: number
    monthlyQuotaRealtimeCents: number
    realtimeWindowMonths: number
    savingsPercent: number
    hasInsufficientData: boolean
}

export function SimulatorResultsPanel({
    scenario,
    simulatedSurplusBase,
    simulatedSurplus,
    realtimeCapacityFactor,
    monthlyQuotaRealtimeCents,
    realtimeWindowMonths,
    savingsPercent,
    hasInsufficientData
}: SimulatorResultsPanelProps) {
    const { currency, locale } = useCurrency()
    const monthlyQuotaCents = realtimeWindowMonths > 0
        ? monthlyQuotaRealtimeCents
        : scenario.quota.baseMonthlyCapacityCents
    const realtimeAdjustmentCents = simulatedSurplus - simulatedSurplusBase
    const realtimeAdjustmentSign = realtimeAdjustmentCents > 0 ? "+" : ""
    const realtimePercentDelta = Math.round((realtimeCapacityFactor - 1) * 100)
    const realtimePercentSign = realtimePercentDelta > 0 ? "+" : ""
    const realtimeStepLabel = getRealtimeStepLabel(realtimeWindowMonths)
    const sustainabilityLabel = getSustainabilityLabel(scenario.sustainability.status)
    const sustainabilityGuidance = getSustainabilityGuidance(
        scenario.sustainability.status,
        scenario.sustainability.reason
    )
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
    const realtimeBadgeLabel = getRealtimeBadgeLabel(realtimeWindowMonths)
    const realtimeNarrative = getRealtimeNarrative(realtimeWindowMonths)

    return (
        <div className="pt-8 space-y-6 relative z-10">
            <div className="relative glass-card rounded-2xl border border-border/40 p-4 sm:p-5 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                {FINANCIAL_LAB_COPY.resultsPanel.title}
                            </h4>
                            <p className="text-sm text-muted-foreground/90">
                                {FINANCIAL_LAB_COPY.resultsPanel.intro}
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                            <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                                {planBasisLabel}
                            </span>
                            <span className="rounded-full border border-border/40 bg-background/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {realtimeBadgeLabel}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm items-stretch">
                        <div className="rounded-xl border border-border/50 bg-background/20 p-3 h-full min-h-[176px] flex flex-col">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Wallet className="h-3.5 w-3.5" />
                                <p className="text-xs font-bold tracking-wide">{FINANCIAL_LAB_COPY.resultsPanel.baseStepLabel}</p>
                            </div>
                            <div className="mt-auto space-y-1">
                                <p className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter tabular-nums">{formatCents(simulatedSurplusBase, currency, locale)}/mese</p>
                                <p className="text-xs text-muted-foreground/80 min-h-[32px]">{FINANCIAL_LAB_COPY.resultsPanel.baseStepDescription}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border/50 bg-background/20 p-3 h-full min-h-[176px] flex flex-col">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <TrendingUp className="h-3.5 w-3.5" />
                                <p className="text-xs font-bold tracking-wide">{realtimeStepLabel}</p>
                            </div>
                            <div className="mt-auto space-y-1">
                                <div className="flex items-center justify-between gap-3">
                                    <p className={cn(
                                        "text-xl sm:text-2xl font-black tracking-tighter tabular-nums",
                                        realtimeAdjustmentCents < 0 ? "text-amber-500" : realtimeAdjustmentCents > 0 ? "text-emerald-500" : "text-muted-foreground"
                                    )}>
                                        {realtimeAdjustmentSign}{formatCents(realtimeAdjustmentCents, currency, locale)}
                                        {realtimeWindowMonths > 0 ? ` (${realtimePercentSign}${realtimePercentDelta}%)` : ""}
                                    </p>
                                    <p className="text-xs font-medium text-foreground/90 tabular-nums text-right">
                                        {FINANCIAL_LAB_COPY.resultsPanel.updatedMarginLabel}: {formatCents(simulatedSurplus, currency, locale)}/mese
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground/80 min-h-[32px]">{realtimeNarrative}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-primary/25 bg-primary/[0.07] p-3 h-full min-h-[176px] flex flex-col">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Target className="h-3.5 w-3.5 text-primary" />
                                <p className="text-xs font-bold tracking-wide">{FINANCIAL_LAB_COPY.resultsPanel.practicalStepLabel}</p>
                            </div>
                            <div className="mt-auto space-y-1">
                                <p className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter tabular-nums">{formatCents(monthlyQuotaCents, currency, locale)}/mese</p>
                                <p className="text-xs text-muted-foreground/80 min-h-[32px]">{FINANCIAL_LAB_COPY.resultsPanel.practicalStepDescription}</p>
                            </div>
                        </div>
                    </div>

                    <div className={cn("mt-4 rounded-xl border p-3 space-y-1", sustainabilityPanelClass)}>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm flex items-center gap-2 text-muted-foreground">
                                <ShieldCheck className="h-4 w-4" />
                                {FINANCIAL_LAB_COPY.resultsPanel.sustainabilityPanelLabel}
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
                monthlyQuotaCents={monthlyQuotaCents}
                hasInsufficientData={hasInsufficientData}
            />
        </div>
    )
}
