"use client"

import { Badge } from "@/components/ui/badge"
import { formatCents } from "@/domain/money"
import { GoalScenarioResult } from "@/VAULT/goals/types"
import { useCurrency } from "@/features/settings/api/use-currency"
import { generateAIMonitorMessage, getAIMonitorStyles } from "@/features/goals/utils/ai-monitor-copy"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface MonitorPlanCardProps {
    scenario: GoalScenarioResult
    savingsPercent: number
    simulatedSurplus: number
    monthsToGoal: number | null
    hasInsufficientData: boolean
    brainAssistApplied: boolean
}

export function MonitorPlanCard({
    scenario,
    savingsPercent,
    simulatedSurplus,
    monthsToGoal,
    hasInsufficientData,
    brainAssistApplied
}: MonitorPlanCardProps) {
    const { currency, locale } = useCurrency()
    const targetDateFormatted = scenario.projection.likelyDate
        ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" })
            .format(new Date(scenario.projection.likelyDate))
            .replace(/^\w/, (char) => char.toUpperCase())
        : null

    const aiMonitor = generateAIMonitorMessage({
        scenario,
        savingsPercent,
        monthlySavingsFormatted: formatCents(simulatedSurplus, currency, locale),
        monthsToGoal,
        targetDateFormatted,
        hasInsufficientData,
        brainAssistApplied
    })
    const planSourceLabel = brainAssistApplied ? "Fonte Brain" : "Fonte Storico"
    const styles = getAIMonitorStyles(aiMonitor.tone)

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                delay: 0.3,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1]
            }}
        >
            <div className={cn(
                "glass-card rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg",
                styles.containerClass
            )}>
                <div className="flex items-start gap-4">
                    <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                        aiMonitor.tone === "thriving" ? "bg-emerald-500/10" :
                            aiMonitor.tone === "stable" ? "bg-primary/10" :
                                aiMonitor.tone === "strained" ? "bg-amber-500/10" :
                                    "bg-rose-500/10"
                    )}>
                        <Sparkles className={cn("h-6 w-6", styles.iconClass)} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            Monitor piano
                        </h4>
                        <p className={cn(
                            "text-sm font-medium leading-relaxed",
                            styles.textClass
                        )}>
                            {aiMonitor.message}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge
                                variant="outline"
                                className={cn(
                                    "px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                                    brainAssistApplied
                                        ? "bg-primary/10 border-primary/20 text-primary"
                                        : "bg-white/40 dark:bg-white/5 border-white/20 text-muted-foreground"
                                )}
                            >
                                {planSourceLabel}
                            </Badge>

                            {aiMonitor.sacrifices.map((sacrifice) => (
                                <Badge
                                    key={sacrifice.id}
                                    variant="outline"
                                    className={cn(
                                        "bg-white/40 dark:bg-white/5 border-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                                        sacrifice.intensity === "high" ? "text-rose-500 border-rose-500/20" :
                                            sacrifice.intensity === "medium" ? "text-amber-500 border-amber-500/20" :
                                                "text-primary border-primary/20"
                                    )}
                                >
                                    {sacrifice.label}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
