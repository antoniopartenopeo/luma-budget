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
    TrendFacts
} from "@/domain/narration"
import { getCurrentPeriod } from "./utils"

export function useOrchestratedInsights(period: string = getCurrentPeriod()) {
    const { forecast, subscriptions, tips: rawTips, isLoading: aiLoading } = useAIAdvisor()
    const { insights, isLoading: insightsLoading } = useInsights({ period })
    const { data: trendData, isLoading: trendLoading } = useTrendData()

    const isLoading = aiLoading || insightsLoading || trendLoading

    const orchestration = useMemo(() => {
        if (isLoading) return null

        const candidates: NarrationCandidate[] = []

        // 1. Map Forecast (from useAIAdvisor)
        if (forecast) {
            const isDeficit = forecast.predictedSavings < 0
            candidates.push({
                id: "forecast-deficit-surplus",
                source: "projection",
                scope: "current_period",
                severity: isDeficit ? "critical" : "low",
                narration: { text: rawTips[0] || "" } // Using the existing logic-generated string
            })
        }

        // 2. Map Subscriptions (from useAIAdvisor)
        if (subscriptions.length > 0 && rawTips.some(t => t.includes("abbonamenti"))) {
            const subTip = rawTips.find(t => t.includes("abbonamenti"))
            candidates.push({
                id: "subscription-signal",
                source: "subscription",
                scope: "long_term",
                severity: "medium",
                narration: { text: subTip || "" }
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
    }, [forecast, subscriptions, rawTips, insights, trendData, isLoading])

    return {
        orchestration,
        isLoading
    }
}
