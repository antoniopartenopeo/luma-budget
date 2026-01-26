"use client"

import { useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MacroSection } from "@/components/patterns/macro-section"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { PageHeader } from "@/components/ui/page-header"
import { StateMessage } from "@/components/ui/state-message"
import { useInsights } from "../use-insights"
import { InsightCard } from "./insight-card"
import { TrendAnalysisCard } from "./trend-analysis-card"
import { AIAdvisorCard } from "./ai-advisor-card"
import { getCurrentPeriod, formatPeriodLabel } from "../utils"

interface InsightsPageContentProps {
    initialPeriod?: string
}

export function InsightsPageContent({ initialPeriod }: InsightsPageContentProps) {
    const [period, setPeriod] = useState(initialPeriod || getCurrentPeriod())

    const { insights, isLoading, isEmpty, hasTransactions } = useInsights({ period })

    // Period navigation helpers
    const navigatePeriod = (direction: "prev" | "next") => {
        const [year, month] = period.split("-").map(Number)
        const date = new Date(year, month - 1 + (direction === "next" ? 1 : -1), 1)
        const newYear = date.getFullYear()
        const newMonth = (date.getMonth() + 1).toString().padStart(2, "0")
        setPeriod(`${newYear}-${newMonth}`)
    }

    const isCurrentMonth = period === getCurrentPeriod()
    const periodLabel = formatPeriodLabel(period)

    return (
        <div className="space-y-8 w-full">
            {/* Header */}
            <PageHeader
                title="Insights"
                description="Analisi intelligente delle tue spese e suggerimenti personalizzati."
            />

            {/* Global Motion Orchestration */}
            <StaggerContainer>
                {/* AI Advisor Section */}
                <AIAdvisorCard />

                {/* Trends Section */}
                <TrendAnalysisCard />

                {/* Periodic Analysis Section */}
                <MacroSection
                    title="Analisi Mensile"
                    description="Dettagli e suggerimenti specifici per il periodo selezionato."
                >
                    <div className="space-y-6">
                        {/* Period Selector */}
                        <div className="flex items-center justify-center gap-2 md:gap-3 py-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigatePeriod("prev")}
                                className="h-8 w-8 md:h-9 md:w-9 rounded-xl"
                            >
                                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                            </Button>

                            <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-muted/50 min-w-[150px] md:min-w-[180px] justify-center">
                                <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground hidden xs:block" />
                                <span className="font-semibold text-sm md:text-base">{periodLabel}</span>
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

                        {/* Content */}
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                                ))}
                            </div>
                        ) : isEmpty ? (
                            <div className="py-8">
                                <StateMessage
                                    variant="empty"
                                    title={hasTransactions ? "Tutto nella norma!" : "Nessuna transazione"}
                                    description={
                                        hasTransactions
                                            ? "Non ci sono anomalie significative nel periodo selezionato. Le tue spese sono allineate con le medie storiche."
                                            : `Non ci sono transazioni registrate per ${periodLabel}. Aggiungi qualche spesa per vedere gli insights.`
                                    }
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {insights.map(insight => (
                                    <InsightCard key={insight.id} insight={insight} />
                                ))}
                            </div>
                        )}
                    </div>
                </MacroSection>
            </StaggerContainer>
        </div>
    )
}
