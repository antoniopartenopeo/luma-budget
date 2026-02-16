
import { ProjectionInput, ProjectionResult } from "../types"
import { addDays, addMonths } from "date-fns"

const AVERAGE_DAYS_PER_MONTH = 30.4375

function toPreciseMonths(goalTarget: number, monthlyCapacity: number): number {
    if (monthlyCapacity <= 0) return Infinity
    return goalTarget / monthlyCapacity
}

function toDisplayMonths(preciseMonths: number): number {
    if (!Number.isFinite(preciseMonths) || preciseMonths <= 0) return 0
    return Math.ceil(preciseMonths)
}

function toComparableMonths(preciseMonths: number): number {
    if (!Number.isFinite(preciseMonths) || preciseMonths <= 0) return 0
    return Math.round(preciseMonths * 10) / 10
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

function toPreciseMonthsWithRealtimeOverlay(
    goalTarget: number,
    baseCapacity: number,
    realtimeCapacityFactor: number,
    realtimeWindowMonths: number
): number {
    if (baseCapacity <= 0) return Infinity

    if (realtimeWindowMonths <= 0 || Math.abs(realtimeCapacityFactor - 1) < 0.0001) {
        return toPreciseMonths(goalTarget, baseCapacity)
    }

    const shortTermCapacity = baseCapacity * realtimeCapacityFactor
    if (shortTermCapacity <= 0) return Infinity

    const shortTermContribution = shortTermCapacity * realtimeWindowMonths
    if (shortTermContribution >= goalTarget) {
        return goalTarget / shortTermCapacity
    }

    const remainingTarget = goalTarget - shortTermContribution
    return realtimeWindowMonths + (remainingTarget / baseCapacity)
}

function addPreciseMonths(baseDate: Date, preciseMonths: number): Date {
    if (!Number.isFinite(preciseMonths) || preciseMonths <= 0) return baseDate

    const wholeMonths = Math.trunc(preciseMonths)
    const fractionalMonths = preciseMonths - wholeMonths
    const withWholeMonths = addMonths(baseDate, wholeMonths)
    const extraDays = Math.round(fractionalMonths * AVERAGE_DAYS_PER_MONTH)
    return addDays(withWholeMonths, extraDays)
}

/**
 * Projects the timeline for reaching a goal based on financial capacity and variability.
 * 
 * Uses a probabilistic approach:
 * - Optimistic: Free Cash Flow + 1 Standard Deviation (Good month)
 * - Likely: Average Free Cash Flow
 * - Prudent: Free Cash Flow - 1 Standard Deviation (Bad month)
 */
export function projectGoalReachability(input: ProjectionInput): ProjectionResult {
    const { goalTarget, currentFreeCashFlow, historicalVariability } = input
    const baseDate = input.startDate || new Date()
    const realtimeOverlayApplied = Boolean(input.realtimeOverlay?.enabled)
    const realtimeCapacityFactor = realtimeOverlayApplied
        ? clamp(input.realtimeOverlay?.capacityFactor || 1, 0.82, 1.05)
        : 1
    const realtimeWindowMonths = realtimeOverlayApplied
        ? Math.max(1, Math.round(input.realtimeOverlay?.shortTermMonths || 2))
        : 0

    // Edge Case: Goal already met
    if (goalTarget <= 0) {
        return {
            minMonths: 0, likelyMonths: 0, maxMonths: 0,
            minMonthsPrecise: 0,
            likelyMonthsPrecise: 0,
            maxMonthsPrecise: 0,
            likelyMonthsComparable: 0,
            minDate: baseDate, likelyDate: baseDate, maxDate: baseDate,
            canReach: true,
            realtimeOverlayApplied,
            realtimeCapacityFactor,
            realtimeWindowMonths
        }
    }

    // 1. Calculate Monthly Capacity Scenarios
    // Higher variability means we might have months with much less savings
    const optimisticCapacity = currentFreeCashFlow + historicalVariability
    const likelyCapacity = currentFreeCashFlow
    const prudentCapacity = currentFreeCashFlow - historicalVariability

    // 2. Check Feasibility (Likely scenario must be positive)
    if (likelyCapacity <= 0) {
        // Technically unreachable with current average habits
        return createUnreachableResult(
            "Il flusso di cassa medio attuale è nullo o negativo.",
            baseDate,
            realtimeOverlayApplied,
            realtimeCapacityFactor,
            realtimeWindowMonths
        )
    }

    // 3. Compute precise and display months.
    // Display values remain prudential (ceil), while precise values preserve scenario granularity.
    const safeOptimisticCapacity = optimisticCapacity > 0 ? optimisticCapacity : likelyCapacity
    const minMonthsPrecise = toPreciseMonthsWithRealtimeOverlay(
        goalTarget,
        safeOptimisticCapacity,
        realtimeCapacityFactor,
        realtimeWindowMonths
    )
    const likelyMonthsPrecise = toPreciseMonthsWithRealtimeOverlay(
        goalTarget,
        likelyCapacity,
        realtimeCapacityFactor,
        realtimeWindowMonths
    )

    // For prudent scenario, if capacity is very low or negative, it might be effectively unreachable
    let maxMonthsPrecise = 0
    if (prudentCapacity <= 0) {
        // If prudent scenario is negative, max date is undefined/infinite. 
        // We cap it or mark as "highly uncertain".
        // For MVP, we'll set a high number or use likely * 2 as a robust fallback?
        // Let's rely on likelyCapacity with a wider margin if prudent is bad.
        maxMonthsPrecise = likelyMonthsPrecise * 2
    } else {
        maxMonthsPrecise = toPreciseMonthsWithRealtimeOverlay(
            goalTarget,
            prudentCapacity,
            realtimeCapacityFactor,
            realtimeWindowMonths
        )
    }

    const minMonths = toDisplayMonths(minMonthsPrecise)
    const likelyMonths = toDisplayMonths(likelyMonthsPrecise)
    const maxMonths = toDisplayMonths(maxMonthsPrecise)

    // Safety Cap: If > 10 years, treat as unreachable for practical purposes
    if (likelyMonthsPrecise > 120) {
        return createUnreachableResult(
            "L'obiettivo richiede oltre 10 anni al ritmo attuale.",
            baseDate,
            realtimeOverlayApplied,
            realtimeCapacityFactor,
            realtimeWindowMonths
        )
    }

    return {
        minMonths: Math.max(0, minMonths),
        likelyMonths: Math.max(0, likelyMonths),
        maxMonths: Math.max(0, maxMonths),
        minMonthsPrecise: Math.max(0, minMonthsPrecise),
        likelyMonthsPrecise: Math.max(0, likelyMonthsPrecise),
        maxMonthsPrecise: Math.max(0, maxMonthsPrecise),
        likelyMonthsComparable: Math.max(0, toComparableMonths(likelyMonthsPrecise)),
        minDate: addPreciseMonths(baseDate, minMonthsPrecise),
        likelyDate: addPreciseMonths(baseDate, likelyMonthsPrecise),
        maxDate: addPreciseMonths(baseDate, maxMonthsPrecise),
        canReach: true,
        realtimeOverlayApplied,
        realtimeCapacityFactor,
        realtimeWindowMonths
    }
}

function createUnreachableResult(
    reason: string,
    baseDate: Date,
    realtimeOverlayApplied: boolean,
    realtimeCapacityFactor: number,
    realtimeWindowMonths: number
): ProjectionResult {
    return {
        minMonths: 0,
        likelyMonths: 0,
        maxMonths: 0,
        minMonthsPrecise: 0,
        likelyMonthsPrecise: 0,
        maxMonthsPrecise: 0,
        likelyMonthsComparable: 0,
        minDate: baseDate,
        likelyDate: baseDate,
        maxDate: baseDate,
        canReach: false,
        realtimeOverlayApplied,
        realtimeCapacityFactor,
        realtimeWindowMonths,
        unreachableReason: reason
    }
}
