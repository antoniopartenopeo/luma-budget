import { AdvisorFacts } from "@/domain/narration"

import { RealtimeOverlaySignal } from "../types"

export interface RealtimeOverlayForecast {
    predictedRemainingCurrentMonthExpensesCents: number
    primarySource: "brain" | "fallback"
    confidence: "high" | "medium" | "low"
}

export interface RealtimeOverlayBrainSignal {
    isReady: boolean
}

interface DeriveRealtimeOverlayInput {
    flagEnabled: boolean
    forecast: RealtimeOverlayForecast | null
    facts: AdvisorFacts | null
    brainSignal: RealtimeOverlayBrainSignal | null
    avgMonthlyExpensesCents: number
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

function confidenceWeight(confidence: "high" | "medium" | "low"): number {
    if (confidence === "high") return 1
    if (confidence === "medium") return 0.7
    return 0.45
}

function resolveRealtimeWindowMonths(input: {
    forecast: RealtimeOverlayForecast
    facts: AdvisorFacts
    brainSignal: RealtimeOverlayBrainSignal | null
}): number {
    const { forecast, facts, brainSignal } = input

    if (
        forecast.primarySource === "brain"
        && forecast.confidence === "high"
        && facts.historicalMonthsCount >= 3
        && Boolean(brainSignal?.isReady)
    ) {
        return 3
    }

    return 2
}

export function deriveRealtimeOverlaySignal({
    flagEnabled,
    forecast,
    facts,
    brainSignal,
    avgMonthlyExpensesCents
}: DeriveRealtimeOverlayInput): RealtimeOverlaySignal {
    const source = forecast?.primarySource || "fallback"

    if (!flagEnabled || !forecast || !facts || avgMonthlyExpensesCents <= 0) {
        return {
            enabled: false,
            source,
            shortTermMonths: 0,
            capacityFactor: 1
        }
    }

    const remainingLoadRatio = clamp(
        forecast.predictedRemainingCurrentMonthExpensesCents / Math.max(avgMonthlyExpensesCents, 1),
        0,
        3
    )
    const severity = clamp((remainingLoadRatio - 0.25) / 0.75, 0, 1)
    const relief = clamp((0.2 - remainingLoadRatio) / 0.2, 0, 1)

    const sourceWeight = forecast.primarySource === "brain" ? 1 : 0.75
    const delta = ((-0.18 * severity) + (0.05 * relief)) * confidenceWeight(forecast.confidence) * sourceWeight

    return {
        enabled: true,
        source: forecast.primarySource,
        shortTermMonths: resolveRealtimeWindowMonths({ forecast, facts, brainSignal }),
        capacityFactor: clamp(1 + delta, 0.82, 1.05)
    }
}
