"use client"

import { useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { MacroSection, macroItemVariants } from "@/components/patterns/macro-section"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { PageHeader } from "@/components/ui/page-header"
import { StateMessage } from "@/components/ui/state-message"
import { useInsights } from "../use-insights"
import { useAIAdvisor } from "../use-ai-advisor"
import { InsightCard } from "./insight-card"
import { TrendAnalysisCard } from "./trend-analysis-card"
import { AIAdvisorCard, NumaAdvisorHowItWorksCard } from "./ai-advisor-card"
import { getCurrentPeriod, formatPeriodLabel } from "../utils"
import { shiftPeriod } from "@/lib/date-ranges"

interface InsightsPageContentProps {
    initialPeriod?: string
}

export function InsightsPageContent({ initialPeriod }: InsightsPageContentProps) {
    const [period, setPeriod] = useState(initialPeriod || getCurrentPeriod())
    const prefersReducedMotion = useReducedMotion()

    const { insights, isLoading, isEmpty, hasTransactions } = useInsights({ period })
    const advisorData = useAIAdvisor()
    const hasHighSeverityCurrentIssue = insights.some((insight) => insight.severity === "high")

    // Period navigation helpers
    const navigatePeriod = (direction: "prev" | "next") => {
        setPeriod(shiftPeriod(period, direction === "next" ? 1 : -1))
    }

    const isCurrentMonth = period === getCurrentPeriod()
    const periodLabel = formatPeriodLabel(period)

    return (
        <div className="space-y-8 w-full">
            {/* Header */}
            <PageHeader
                title="Insights"
                description="Una lettura chiara di come stai spendendo e dove puoi migliorare."
            />

            {/* Global Motion Orchestration */}
            <StaggerContainer>
                {/* How It Works Section */}
                <motion.div variants={macroItemVariants}>
                    <NumaAdvisorHowItWorksCard
                        forecast={advisorData.forecast}
                        facts={advisorData.facts}
                        className="rounded-[2.5rem]"
                    />
                </motion.div>

                {/* AI Advisor Section (HERO) */}
                <AIAdvisorCard advisorData={advisorData} />

                {/* Subordinate Content Container */}
                <div className="space-y-6">
                    {/* Trends Section */}
                    <TrendAnalysisCard
                        hasHighSeverityCurrentIssue={hasHighSeverityCurrentIssue}
                        advisorForecast={advisorData.forecast}
                        advisorSubscriptions={advisorData.subscriptions}
                    />

                    {/* Periodic Analysis Section */}
                    <MacroSection
                        title="Analisi del mese"
                        description={`Cosa sta succedendo nelle tue spese di ${periodLabel}.`}
                        headerActions={
                            <div className="flex items-center gap-2 md:gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigatePeriod("prev")}
                                    className="h-8 w-8 md:h-9 md:w-9 rounded-xl"
                                >
                                    <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                                </Button>

                                <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-muted/50 min-w-[140px] md:min-w-[160px] justify-center">
                                    <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground hidden xs:block" />
                                    <span className="font-bold text-xs md:text-sm">{periodLabel}</span>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigatePeriod("next")}
                                    disabled={isCurrentMonth}
                                    className="h-8 w-8 md:h-9 md:w-9 rounded-xl"
                                >
                                    <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                                </Button>
                            </div>
                        }
                    >
                        <div className="min-h-[200px] relative">
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={prefersReducedMotion ? false : { opacity: 0 }}
                                        animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                                        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                                        className="space-y-4 py-8"
                                    >
                                        <div className="space-y-4">
                                            {[1, 2].map(i => (
                                                <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : isEmpty ? (
                                    <motion.div
                                        key="empty"
                                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
                                        animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                                        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                                        className="py-8"
                                    >
                                        <StateMessage
                                            variant="empty"
                                            title={hasTransactions ? "Tutto regolare" : "Nessuna transazione"}
                                            description={
                                                hasTransactions
                                                    ? "Nel periodo selezionato non vedo segnali importanti: il tuo andamento e in linea con il solito."
                                                    : `Per ${periodLabel} non ci sono ancora movimenti. Aggiungi qualche spesa per attivare gli insight.`
                                            }
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="list"
                                        initial={prefersReducedMotion ? false : "hidden"}
                                        animate={prefersReducedMotion ? undefined : "visible"}
                                        variants={{
                                            hidden: { opacity: 0 },
                                            visible: {
                                                opacity: 1,
                                                transition: { staggerChildren: 0.1 }
                                            }
                                        }}
                                        className="space-y-4 py-2"
                                    >
                                        {insights.map(insight => (
                                            <InsightCard key={insight.id} insight={insight} />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </MacroSection>
                </div>
            </StaggerContainer>
        </div>
    )
}
