"use client"

import { useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
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

    const { insights, isLoading, isThinking, isEmpty, hasTransactions } = useInsights({ period })

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
                {/* AI Advisor Section (HERO) */}
                <AIAdvisorCard />

                {/* Subordinate Content Container */}
                <div className="space-y-6">
                    {/* Trends Section */}
                    <TrendAnalysisCard />

                    {/* Periodic Analysis Section */}
                    <MacroSection
                        title="Analisi Mensile"
                        description={`Scomposizione analitica del tuo ritmo per ${periodLabel}.`}
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
                                {(isLoading || isThinking) ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-4 py-8"
                                    >
                                        {isThinking ? (
                                            <div className="flex flex-col items-center justify-center py-12 gap-6">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                                                    <div className="h-10 w-10 rounded-full border-t-2 border-r-2 border-primary animate-spin" />
                                                </div>
                                                <div className="flex flex-col items-center gap-2 text-center">
                                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-primary/80">
                                                        Analisi Intelligente
                                                    </p>
                                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                        Numa AI is processing...
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {[1, 2].map(i => (
                                                    <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : isEmpty ? (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="py-8"
                                    >
                                        <StateMessage
                                            variant="empty"
                                            title={hasTransactions ? "Tutto nella norma!" : "Nessuna transazione"}
                                            description={
                                                hasTransactions
                                                    ? "Non ci sono anomalie significative nel periodo selezionato. Le tue spese sono allineate con le medie storiche."
                                                    : `Non ci sono transazioni registrate per ${periodLabel}. Aggiungi qualche spesa per vedere gli insights.`
                                            }
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="list"
                                        initial="hidden"
                                        animate="visible"
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
