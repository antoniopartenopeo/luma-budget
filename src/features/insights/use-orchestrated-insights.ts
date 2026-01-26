"use client"

import { useMemo } from "react"
import { useAIAdvisor } from "./use-ai-advisor"
import { useInsights } from "./use-insights"
import { useTrendData } from "./use-trend-data"
import {
    orchestrateNarration,
    NarrationCandidate,
    deriveTrendState,
    narrateTrend,
    TrendFacts,
    deriveAdvisorState,
    narrateAdvisor
} from "@/domain/narration"
import { getCurrentPeriod } from "./utils"

export function useOrchestratedInsights(period: string = getCurrentPeriod()) {
    const { facts: advisorFacts, subscriptions, isLoading: aiLoading } = useAIAdvisor()
    const { insights, isLoading: insightsLoading } = useInsights({ period })
    const { data: trendData, isLoading: trendLoading } = useTrendData()

    const isLoading = aiLoading || insightsLoading || trendLoading

    const orchestration = useMemo(() => {
        if (isLoading) return null

        const candidates: NarrationCandidate[] = []

        // 1. Map Forecast (from useAIAdvisor via Narrator)
        if (advisorFacts) {
            const state = deriveAdvisorState(advisorFacts)
            const narration = narrateAdvisor(advisorFacts, state)

            candidates.push({
                id: "forecast-advisor",
                source: "projection",
                scope: "current_period",
                severity: state === "deficit" ? "critical" : state === "positive_balance" ? "low" : "low",
                narration
            })
        }

        // 2. Map Subscriptions (from useAIAdvisor)
        // Subscription text is now handled by advisor narrator if relevant, OR we can keep a separate signal.
        // The original logic had a specific subscription tip.
        // Let's create a specific subscription signal if impact is high.
        if (subscriptions.length > 0 && advisorFacts && advisorFacts.subscriptionTotalYearlyCents > 50000) { // > €500
            // We can use a simple static narration for now or add to advisor narrator. 
            // The prompt asked to MIGRATE logic. The old logic checked: totalYearly > 500 -> Add Tip.
            // We'll generate a candidate for this.
            const totalFormatted = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(advisorFacts.subscriptionTotalYearlyCents / 100)

            candidates.push({
                id: "subscription-signal",
                source: "subscription",
                scope: "long_term",
                severity: "medium",
                narration: {
                    text: `Hai ${subscriptions.length} abbonamenti attivi che pesano circa ${totalFormatted}/anno. Una revisione potrebbe farti risparmiare.`
                }
            })
        }

        // 3. Map Insights (Budget Risk & Category Spikes)
        insights.forEach(insight => {
            let severity: "low" | "medium" | "high" | "critical" = "low"
            if (insight.severity === "high") severity = "high"
            else if (insight.severity === "medium") severity = "medium"

            candidates.push({
                id: insight.id,
                source: insight.kind === "budget-risk" ? "projection" : "risk_spike",
                scope: "current_period",
                severity: severity,
                narration: { text: insight.summary }
            })
        })

        // 4. Map Trends (Savings Rate)
        if (trendData && trendData.length >= 2) {
            const current = trendData[trendData.length - 1]
            const previous = trendData[trendData.length - 2]
            const facts: TrendFacts = {
                metricType: "savings_rate",
                currentValueFormatted: current.savingsRateLabel,
                changePercent: current.savingsRate - previous.savingsRate,
                direction: current.savingsRate > previous.savingsRate ? "up" :
                    current.savingsRate < previous.savingsRate ? "down" : "flat"
            }
            const state = deriveTrendState(facts)
            candidates.push({
                id: "long-term-trend",
                source: "trend",
                scope: "long_term",
                severity: state === "deteriorating" ? "high" : "low",
                narration: narrateTrend(facts, state)
            })
        }

        return orchestrateNarration(candidates)
    }, [advisorFacts, subscriptions, insights, trendData, isLoading])

    return {
        orchestration,
        isLoading
    }
}
