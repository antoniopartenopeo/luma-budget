"use client"

import * as React from "react"

import { SubSectionCard } from "@/components/patterns/sub-section-card"
import { NumaEngineCard } from "@/components/patterns/numa-engine-card"
import { cn } from "@/lib/utils"
import { Compass, CheckCircle2, Wallet, TrendingUp, ShieldCheck } from "lucide-react"
import { GoalScenarioResult, ScenarioKey } from "@/VAULT/goals/types"
import {
    FINANCIAL_LAB_COPY,
    getOverlayAuditSubValue,
    getOverlayStatsValue,
    getPlanBasisLabel,
    getSustainabilityLabel
} from "@/features/goals/utils/financial-lab-copy"

import { formatCents } from "@/domain/money"
import { useCurrency } from "@/features/settings/api/use-currency"

interface ScenarioDeckProps {
    scenarios: GoalScenarioResult[]
    activeKey: ScenarioKey
    onSelect: (key: ScenarioKey) => void
    className?: string
}

export function ScenarioDeck({
    scenarios,
    activeKey,
    onSelect,
    className
}: ScenarioDeckProps) {
    const { currency, locale } = useCurrency()

    const activeScenario = scenarios.find(s => s.key === activeKey)
    const calibration = activeScenario?.config.calibration
    const sustainabilityLabel = activeScenario
        ? getSustainabilityLabel(activeScenario.sustainability.status)
        : "—"
    const overlayValue = getOverlayStatsValue(
        Boolean(activeScenario?.quota.realtimeOverlayApplied),
        activeScenario?.quota.realtimeWindowMonths || 0
    )
    const overlaySource = getPlanBasisLabel(activeScenario?.planBasis || "historical")

    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-4">
                <Compass className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold tracking-tight">{FINANCIAL_LAB_COPY.scenarioDeck.title}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map((scenario) => {
                    const isActive = activeKey === scenario.key
                    const quotaLabel = `${formatCents(scenario.quota.realtimeMonthlyCapacityCents, currency, locale)}/mese`
                    const statusLabel = getSustainabilityLabel(scenario.sustainability.status)

                    return (
                        <div
                            key={scenario.key}
                            onClick={() => onSelect(scenario.key)}
                            className="cursor-pointer h-full"
                        >
                            <SubSectionCard
                                variant={isActive ? "accent" : "default"}
                                label={scenario.config.label}
                                icon={isActive ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Wallet className="h-4 w-4 text-muted-foreground" />}
                                className={cn(
                                    "h-full border-2 transition-all duration-300 relative overflow-hidden",
                                    isActive ? "border-primary/50 shadow-lg bg-primary/5" : "border-transparent opacity-80 hover:opacity-100 hover:bg-accent/30 dark:hover:bg-accent/20"
                                )}
                            >
                                <div className="space-y-4 flex-1 flex flex-col">
                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                        {scenario.config.description}
                                    </p>

                                    <div className="pt-2 border-t border-border/40 mt-auto">
                                        <div className="flex justify-between items-end gap-3">
                                            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{FINANCIAL_LAB_COPY.scenarioDeck.quotaLabel}</span>
                                            <span className={cn(
                                                "text-xl sm:text-2xl lg:text-3xl font-black tabular-nums tracking-tighter leading-none",
                                                isActive ? "text-primary" : "text-foreground"
                                            )}>
                                                {quotaLabel}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs uppercase tracking-wide font-bold text-muted-foreground">
                                            {statusLabel}
                                        </p>
                                    </div>
                                </div>
                            </SubSectionCard>
                        </div>
                    )
                })}
            </div>

            <div className="mt-12 mb-8">
                <NumaEngineCard
                    title={FINANCIAL_LAB_COPY.scenarioDeck.engineTitle}
                    icon={Compass}
                    audienceHint={FINANCIAL_LAB_COPY.scenarioDeck.audienceHint}
                    steps={[
                        {
                            icon: Wallet,
                            colorClass: "text-primary",
                            bgClass: "bg-primary/10",
                            stepLabel: FINANCIAL_LAB_COPY.scenarioDeck.steps[0].stepLabel,
                            title: FINANCIAL_LAB_COPY.scenarioDeck.steps[0].title,
                            description: FINANCIAL_LAB_COPY.scenarioDeck.steps[0].description
                        },
                        {
                            icon: TrendingUp,
                            colorClass: "text-amber-500",
                            bgClass: "bg-amber-500/10",
                            stepLabel: FINANCIAL_LAB_COPY.scenarioDeck.steps[1].stepLabel,
                            title: FINANCIAL_LAB_COPY.scenarioDeck.steps[1].title,
                            description: FINANCIAL_LAB_COPY.scenarioDeck.steps[1].description
                        },
                        {
                            icon: ShieldCheck,
                            colorClass: "text-emerald-500",
                            bgClass: "bg-emerald-500/10",
                            stepLabel: FINANCIAL_LAB_COPY.scenarioDeck.steps[2].stepLabel,
                            title: FINANCIAL_LAB_COPY.scenarioDeck.steps[2].title,
                            description: FINANCIAL_LAB_COPY.scenarioDeck.steps[2].description
                        }
                    ]}
                    certificationTitle={FINANCIAL_LAB_COPY.scenarioDeck.certificationTitle}
                    certificationSubtitle={FINANCIAL_LAB_COPY.scenarioDeck.certificationSubtitle}
                    transparencyNote={FINANCIAL_LAB_COPY.scenarioDeck.transparencyNote}
                    auditStats={calibration ? [
                        {
                            label: FINANCIAL_LAB_COPY.scenarioDeck.audit.depthLabel,
                            value: FINANCIAL_LAB_COPY.scenarioDeck.audit.depthValue,
                            subValue: FINANCIAL_LAB_COPY.scenarioDeck.audit.depthSubValue
                        },
                        {
                            label: FINANCIAL_LAB_COPY.scenarioDeck.audit.stabilityLabel,
                            value: `${(calibration.stabilityFactor * 100).toFixed(1)}%`,
                            subValue: FINANCIAL_LAB_COPY.scenarioDeck.audit.stabilitySubValue
                        },
                        {
                            label: FINANCIAL_LAB_COPY.scenarioDeck.audit.sustainabilityLabel,
                            value: sustainabilityLabel,
                            subValue: activeScenario?.sustainability.reason || FINANCIAL_LAB_COPY.scenarioDeck.audit.sustainabilitySubValue
                        },
                        {
                            label: FINANCIAL_LAB_COPY.scenarioDeck.audit.overlayLabel,
                            value: overlayValue,
                            subValue: getOverlayAuditSubValue(
                                Boolean(activeScenario?.quota.realtimeOverlayApplied),
                                overlaySource
                            )
                        }
                    ] : undefined}
                />
            </div>
        </div>
    )
}
