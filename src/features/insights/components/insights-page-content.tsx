"use client"

import { useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { useInsights } from "../use-insights"
import { InsightCard } from "./insight-card"
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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Insights</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Analisi intelligente delle tue spese e suggerimenti personalizzati.
                    </p>
                </div>
            </div>

            {/* Period Selector */}
            <div className="flex items-center justify-center gap-3 py-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigatePeriod("prev")}
                    className="h-9 w-9 rounded-xl"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 min-w-[180px] justify-center">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{periodLabel}</span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigatePeriod("next")}
                    disabled={isCurrentMonth}
                    className="h-9 w-9 rounded-xl"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-48 w-full rounded-2xl" />
                        </div>
                    ))}
                </div>
            ) : isEmpty ? (
                <div className="py-16">
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {insights.map(insight => (
                        <InsightCard key={insight.id} insight={insight} />
                    ))}
                </div>
            )}
        </div>
    )
}
