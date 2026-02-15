"use client"

import { motion } from "framer-motion"
import { Calculator, RefreshCw, Target } from "lucide-react"

import { KpiCard } from "@/components/patterns/kpi-card"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { macroItemVariants } from "@/components/patterns/macro-section"
import { formatCents } from "@/domain/money"
import { GoalScenarioResult } from "@/VAULT/goals/types"
import { useCurrency } from "@/features/settings/api/use-currency"
import { cn } from "@/lib/utils"

import { MonitorPlanCard } from "./monitor-plan-card"

interface SimulatorResultsPanelProps {
    scenario: GoalScenarioResult
    simulatedSurplus: number
    extraSavings: number
    savingsPercent: number
    likelyMonthsForCopy: number | null
    minMonthsForRange: number | null
    maxMonthsForRange: number | null
    hasInsufficientData: boolean
    brainAssistApplied: boolean
}

function formatMonthsLabel(months: number): string {
    if (months >= 24) return `${Math.round(months)}`
    if (Math.abs(months - Math.round(months)) < 0.2) return `${Math.round(months)}`
    return months.toFixed(1).replace(".", ",")
}

export function SimulatorResultsPanel({
    scenario,
    simulatedSurplus,
    extraSavings,
    savingsPercent,
    likelyMonthsForCopy,
    minMonthsForRange,
    maxMonthsForRange,
    hasInsufficientData,
    brainAssistApplied
}: SimulatorResultsPanelProps) {
    const { currency, locale } = useCurrency()
    const projection = scenario.projection

    return (
        <div className="pt-8 space-y-6 relative z-10">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                <motion.div variants={macroItemVariants} className="h-full">
                    <KpiCard
                        title="Quanto mettere da parte"
                        subtitle="Risparmio al mese"
                        value={formatCents(simulatedSurplus, currency, locale)}
                        animatedValue={simulatedSurplus}
                        formatFn={(value) => formatCents(value, currency, locale)}
                        change={extraSavings > 0 ? `+${formatCents(extraSavings, currency, locale)}` : undefined}
                        trend={extraSavings > 0 ? "up" : "neutral"}
                        comparisonLabel={extraSavings > 0 ? "in piu" : undefined}
                        description={extraSavings > 0 ? "Risparmio extra generato da questo scenario." : "Risparmio stimato con le abitudini attuali."}
                        icon={Calculator}
                        tone={extraSavings > 0 ? "positive" : "neutral"}
                        className={cn(
                            "h-full min-h-[180px] transition-all duration-300",
                            extraSavings > 50000 ? "bg-emerald-500/5 dark:bg-emerald-500/10 shadow-[0_0_20px_-12px_rgba(16,185,129,0.3)]" : "hover:bg-white/60"
                        )}
                    />
                </motion.div>

                <motion.div variants={macroItemVariants} className="h-full">
                    <KpiCard
                        title="Quando arrivi"
                        subtitle="Con il ritmo attuale"
                        value={!projection.canReach
                            ? "—"
                            : new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" })
                                .format(new Date(projection.likelyDate))
                                .replace(/^\w/, (char) => char.toUpperCase())
                        }
                        change={projection.canReach && likelyMonthsForCopy && likelyMonthsForCopy > 0
                            ? `${formatMonthsLabel(likelyMonthsForCopy)} mesi`
                            : undefined
                        }
                        description={!projection.canReach
                            ? "Con questo ritmo non raggiungi ancora l'obiettivo."
                            : `Intervallo stimato: ${formatMonthsLabel(minMonthsForRange || 0)}-${formatMonthsLabel(maxMonthsForRange || 0)} mesi`
                        }
                        icon={Target}
                        tone={projection.canReach ? "positive" : "neutral"}
                        className={cn(
                            "h-full min-h-[180px] transition-all duration-500",
                            projection.canReach ? "bg-primary/5 dark:bg-primary/10" : "bg-rose-50/40 dark:bg-rose-950/10"
                        )}
                    />
                </motion.div>

                <motion.div variants={macroItemVariants} className="h-full">
                    <KpiCard
                        title="Sostenibilita"
                        subtitle="Tenuta del piano"
                        value={(() => {
                            const status = scenario.sustainability.status
                            if (status === "secure") return "Molto solido"
                            if (status === "sustainable") return "Solido"
                            if (status === "fragile") return "Delicato"
                            return "A rischio"
                        })()}
                        description={scenario.sustainability.reason || "Valutazione del sistema su stabilita e possibili imprevisti."}
                        icon={RefreshCw}
                        tone={(() => {
                            const status = scenario.sustainability.status
                            if (status === "secure" || status === "sustainable") return "positive"
                            if (status === "fragile") return "warning"
                            return "negative"
                        })()}
                        className="h-full min-h-[180px]"
                    />
                </motion.div>
            </StaggerContainer>

            <MonitorPlanCard
                scenario={scenario}
                savingsPercent={savingsPercent}
                simulatedSurplus={simulatedSurplus}
                monthsToGoal={likelyMonthsForCopy}
                hasInsufficientData={hasInsufficientData}
                brainAssistApplied={brainAssistApplied}
            />
        </div>
    )
}
