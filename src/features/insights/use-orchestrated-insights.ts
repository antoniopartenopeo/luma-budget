"use client"

import { useMemo } from "react"
import { useAIAdvisor, type AIPriceHike, type AISubscription } from "./use-ai-advisor"
import { useInsights } from "./use-insights"
import { useTrendData, type TrendDataItem } from "./use-trend-data"
import { type Insight } from "./types"
import {
    orchestrateNarration,
    type NarrationCandidate,
    deriveTrendState,
    narrateTrend,
    type TrendFacts,
    deriveAdvisorState,
    narrateAdvisor,
    type AdvisorFacts,
} from "@/domain/narration"
import { getCurrentPeriod } from "./utils"

type OrchestrationInput = {
    advisorFacts: AdvisorFacts | null
    subscriptions: AISubscription[]
    priceHikes: AIPriceHike[]
    insights: Insight[]
    trendData: TrendDataItem[]
    isLoading: boolean
}

function buildOrchestration({
    advisorFacts,
    subscriptions,
    priceHikes,
    insights,
    trendData,
    isLoading,
}: OrchestrationInput) {
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
            narration,
        })
    }

    // 2a. Map Price Hikes (high priority)
    priceHikes.forEach((hike) => {
        const diffFormatted = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(hike.diff / 100)
        candidates.push({
            id: `hike-${hike.name}`,
            source: "subscription",
            scope: "current_period",
            severity: "high",
            narration: {
                text: `Attenzione: rilevato aumento prezzo per ${hike.name}. Paghi ${diffFormatted} in più rispetto alla tua media.`,
            },
        })
    })

    // 2b. Map Subscriptions
    if (subscriptions.length > 0 && advisorFacts && advisorFacts.subscriptionTotalYearlyCents > 50000) {
        const totalFormatted = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(advisorFacts.subscriptionTotalYearlyCents / 100)

        candidates.push({
            id: "subscription-signal",
            source: "subscription",
            scope: "long_term",
            severity: "medium",
            narration: {
                text: `Hai ${subscriptions.length} abbonamenti attivi che pesano circa ${totalFormatted}/anno. Una revisione potrebbe farti risparmiare.`,
            },
        })
    }

    // 3. Map Insights (Budget Risk & Category Spikes)
    insights.forEach((insight) => {
        let severity: "low" | "medium" | "high" | "critical" = "low"
        if (insight.severity === "high") severity = "high"
        else if (insight.severity === "medium") severity = "medium"

        candidates.push({
            id: insight.id,
            source: insight.kind === "budget-risk" ? "projection" : "risk_spike",
            scope: "current_period",
            severity,
            narration: { text: insight.summary },
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
                current.savingsRate < previous.savingsRate ? "down" : "flat",
        }
        const state = deriveTrendState(facts)
        candidates.push({
            id: "long-term-trend",
            source: "trend",
            scope: "long_term",
            severity: state === "deteriorating" ? "high" : "low",
            narration: narrateTrend(facts, state),
        })
    }

    return orchestrateNarration(candidates)
}

interface UseOrchestratedInsightsFromDataOptions {
    period?: string
    advisorFacts: AdvisorFacts | null
    subscriptions: AISubscription[]
    priceHikes: AIPriceHike[]
    advisorLoading?: boolean
}

/**
 * Use this variant when advisor signals are already available to avoid duplicate advisor computation.
 */
export function useOrchestratedInsightsFromData({
    period = getCurrentPeriod(),
    advisorFacts,
    subscriptions,
    priceHikes,
    advisorLoading = false,
}: UseOrchestratedInsightsFromDataOptions) {
    const { insights, isLoading: insightsLoading } = useInsights({ period })
    const { data: trendData, isLoading: trendLoading } = useTrendData()

    const isLoading = advisorLoading || insightsLoading || trendLoading

    const orchestration = useMemo(() => {
        return buildOrchestration({
            advisorFacts,
            subscriptions,
            priceHikes,
            insights,
            trendData,
            isLoading,
        })
    }, [advisorFacts, subscriptions, priceHikes, insights, trendData, isLoading])

    return {
        orchestration,
        isLoading,
    }
}

/**
 * Backward-compatible default hook used where advisor data is not precomputed.
 */
export function useOrchestratedInsights(period: string = getCurrentPeriod()) {
    const { facts: advisorFacts, subscriptions, priceHikes, isLoading: advisorLoading } = useAIAdvisor()

    return useOrchestratedInsightsFromData({
        period,
        advisorFacts,
        subscriptions,
        priceHikes,
        advisorLoading,
    })
}
