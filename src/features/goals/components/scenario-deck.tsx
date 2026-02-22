"use client"

import * as React from "react"

import { ExpandableCard } from "@/components/patterns/expandable-card"
import { NumaEngineCard } from "@/components/patterns/numa-engine-card"
import { cn } from "@/lib/utils"
import { Compass, CheckCircle2, Wallet, TrendingUp, ShieldCheck } from "lucide-react"
import { QuotaScenarioResult, ScenarioKey } from "@/VAULT/goals/types"
import {
    FINANCIAL_LAB_COPY,
    getOverlayAuditSubValue,
    getOverlayStatsValue,
    getPlanBasisLabel,
    getRealtimeNarrative,
    getRealtimeStepLabel,
    getSustainabilityLabel
} from "@/features/goals/utils/financial-lab-copy"

import { formatCents } from "@/domain/money"
import { useCurrency } from "@/features/settings/api/use-currency"

interface ScenarioDeckProps {
    scenarios: QuotaScenarioResult[]
    activeKey: ScenarioKey
    onSelect: (key: ScenarioKey) => void
    className?: string
}

function StepBadge({ step }: { step: number }) {
    return (
        <span
            aria-hidden="true"
            className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-[11px] font-bold text-primary"
        >
            {step}
        </span>
    )
}

export function ScenarioDeck({
    scenarios,
    activeKey,
    onSelect,
    className
}: ScenarioDeckProps) {
    const { currency, locale } = useCurrency()
    const [expandedScenarioKey, setExpandedScenarioKey] = React.useState<ScenarioKey | null>(null)

    React.useEffect(() => {
        if (!expandedScenarioKey) return
        const stillExists = scenarios.some((scenario) => scenario.key === expandedScenarioKey)
        if (!stillExists) {
            setExpandedScenarioKey(null)
        }
    }, [expandedScenarioKey, scenarios])

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
            <div className="mb-8">
                <NumaEngineCard
                    icon={Compass}
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

            <div className="mb-4 flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold tracking-tight">{FINANCIAL_LAB_COPY.scenarioDeck.title}</h3>
            </div>
            <p className="mb-4 text-sm font-medium text-muted-foreground">
                {FINANCIAL_LAB_COPY.scenarioDeck.subtitle}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {scenarios.map((scenario) => {
                    const isActive = activeKey === scenario.key
                    const isExpanded = expandedScenarioKey === scenario.key
                    const quotaAmountLabel = formatCents(scenario.quota.realtimeMonthlyCapacityCents, currency, locale)
                    const perMonthSuffix = FINANCIAL_LAB_COPY.scenarioDeck.perMonthSuffix
                    const statusLabel = getSustainabilityLabel(scenario.sustainability.status)
                    const baseMarginLabel = `${formatCents(scenario.quota.baseMonthlyMarginCents, currency, locale)}${perMonthSuffix}`
                    const marginDeltaCents = scenario.quota.realtimeMonthlyMarginCents - scenario.quota.baseMonthlyMarginCents
                    const marginDeltaSign = marginDeltaCents > 0 ? "+" : ""
                    const marginDeltaPct = Math.round((scenario.quota.realtimeCapacityFactor - 1) * 100)
                    const marginDeltaPctSign = marginDeltaPct > 0 ? "+" : ""
                    const realtimeStepLabel = getRealtimeStepLabel(scenario.quota.realtimeWindowMonths)
                    const realtimeNarrative = getRealtimeNarrative(scenario.quota.realtimeWindowMonths)
                    const updatedMarginLabel = `${formatCents(scenario.quota.realtimeMonthlyMarginCents, currency, locale)}${perMonthSuffix}`
                    const planBasisBadge = getPlanBasisLabel(scenario.planBasis)
                    const descriptionNode = (
                        <p className="min-h-[4.75rem] text-sm font-medium text-muted-foreground leading-relaxed break-words">
                            {scenario.config.description}
                        </p>
                    )

                    const summaryContent = (
                        <div className="pt-2 border-t border-border/40 min-h-[6.75rem] sm:min-h-[6.5rem] flex flex-col justify-end" data-testid={`scenario-summary-${scenario.key}`}>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                    {FINANCIAL_LAB_COPY.scenarioDeck.quotaLabel}
                                </span>
                                <div className={cn(
                                    "flex flex-wrap items-end gap-x-1 gap-y-1",
                                    isActive ? "text-primary" : "text-foreground"
                                )}>
                                    <span className="max-w-full break-words text-[clamp(1.35rem,4.5vw,2.05rem)] font-black tabular-nums tracking-tight leading-none">
                                        {quotaAmountLabel}
                                    </span>
                                    <span className="text-[clamp(1.05rem,3.5vw,1.35rem)] font-bold leading-none">
                                        {perMonthSuffix}
                                    </span>
                                </div>
                            </div>
                            <p className="mt-2 text-xs tracking-wide font-semibold text-muted-foreground">
                                {FINANCIAL_LAB_COPY.scenarioDeck.sustainabilityInlineLabel}: {statusLabel}
                            </p>
                        </div>
                    )

                    const expandedContent = (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                                    {FINANCIAL_LAB_COPY.scenarioCard.detailTitle}
                                </p>
                                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold text-primary">
                                    {planBasisBadge}
                                </span>
                            </div>

                            <div className="flex items-start gap-3" data-testid={`scenario-step-${scenario.key}-margin`}>
                                <StepBadge step={1} />
                                <div className="flex-1 rounded-xl border border-border/40 bg-background/30 p-3 sm:p-4 min-h-[6rem] sm:min-h-[6.25rem] flex flex-col justify-center">
                                    <p className="text-[11px] uppercase tracking-wide font-bold text-foreground/85">{FINANCIAL_LAB_COPY.scenarioCard.baseStepTitle}</p>
                                    <p className="mt-1 text-base font-semibold tabular-nums text-foreground">{baseMarginLabel}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3" data-testid={`scenario-step-${scenario.key}-live`}>
                                <StepBadge step={2} />
                                <div className="flex-1 rounded-xl border border-border/40 bg-background/30 p-3 sm:p-4 min-h-[8.25rem] sm:min-h-[8rem]">
                                    <p className="text-[11px] uppercase tracking-wide font-bold text-foreground/85">{realtimeStepLabel}</p>
                                    <p className={cn(
                                        "mt-1 text-base font-semibold tabular-nums",
                                        marginDeltaCents < 0 ? "text-amber-500" : marginDeltaCents > 0 ? "text-emerald-500" : "text-muted-foreground"
                                    )}>
                                        {marginDeltaSign}{formatCents(marginDeltaCents, currency, locale)}
                                        {scenario.quota.realtimeWindowMonths > 0 ? ` (${marginDeltaPctSign}${marginDeltaPct}%)` : ""}
                                    </p>
                                    <p className="text-[12px] text-muted-foreground mt-1">
                                        {FINANCIAL_LAB_COPY.resultsPanel.updatedMarginLabel}: {updatedMarginLabel}
                                    </p>
                                    <p className="text-[12px] text-muted-foreground leading-relaxed mt-2">
                                        {realtimeNarrative}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3" data-testid={`scenario-step-${scenario.key}-quota`}>
                                <StepBadge step={3} />
                                <div className="flex-1 rounded-xl border border-primary/25 bg-primary/5 p-3 sm:p-4 min-h-[7.25rem] sm:min-h-[7rem] flex flex-col justify-center">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                            {FINANCIAL_LAB_COPY.scenarioDeck.quotaLabel}
                                        </span>
                                        <div className="flex flex-wrap items-end gap-x-1 gap-y-1 text-primary">
                                            <span className="max-w-full break-words text-[clamp(1.45rem,5vw,2.2rem)] font-black tabular-nums tracking-tight leading-none">
                                                {quotaAmountLabel}
                                            </span>
                                            <span className="text-[clamp(1.05rem,3.7vw,1.4rem)] font-bold leading-none">
                                                {perMonthSuffix}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs tracking-wide font-semibold text-muted-foreground">
                                        {FINANCIAL_LAB_COPY.scenarioDeck.sustainabilityInlineLabel}: {statusLabel}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )

                    return (
                        <ExpandableCard
                            key={scenario.key}
                            indicatorColor={isActive ? "bg-primary/70" : "bg-border/70"}
                            icon={isActive ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Wallet className="h-4 w-4 text-muted-foreground" />}
                            title={
                                <span className={cn(
                                    "text-[11px] font-bold uppercase tracking-wider",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {scenario.config.label}
                                </span>
                            }
                            description={descriptionNode}
                            className={cn(
                                "self-start rounded-2xl border border-border/60 min-h-[19rem] sm:min-h-[18.75rem]",
                                isActive ? "ring-1 ring-primary/20 bg-primary/5" : ""
                            )}
                            expanded={isExpanded}
                            onToggle={(nextExpanded) => {
                                if (nextExpanded) {
                                    setExpandedScenarioKey(scenario.key)
                                    onSelect(scenario.key)
                                    return
                                }
                                setExpandedScenarioKey((current) => (current === scenario.key ? null : current))
                            }}
                            contentClassName="mt-4"
                            expandedContent={expandedContent}
                        >
                            {!isExpanded ? summaryContent : null}
                        </ExpandableCard>
                    )
                })}
            </div>

        </div>
    )
}
