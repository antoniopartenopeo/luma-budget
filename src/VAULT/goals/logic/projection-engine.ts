
import { ProjectionInput, ProjectionResult } from "../types"
import { addMonths } from "date-fns" // Assuming date-fns is available or I'll use native Date

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

    // Edge Case: Goal already met
    if (goalTarget <= 0) {
        return {
            minMonths: 0, likelyMonths: 0, maxMonths: 0,
            minDate: baseDate, likelyDate: baseDate, maxDate: baseDate,
            canReach: true
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
        return createUnreachableResult("Il flusso di cassa medio attuale è nullo o negativo.", baseDate)
    }

    // 3. Compute Months (Round up to full months)
    const minMonths = Math.ceil(goalTarget / optimisticCapacity)
    const likelyMonths = Math.ceil(goalTarget / likelyCapacity)

    // For prudent scenario, if capacity is very low or negative, it might be effectively unreachable
    let maxMonths = 0
    if (prudentCapacity <= 0) {
        // If prudent scenario is negative, max date is undefined/infinite. 
        // We cap it or mark as "highly uncertain".
        // For MVP, we'll set a high number or use likely * 2 as a robust fallback?
        // Let's rely on likelyCapacity with a wider margin if prudent is bad.
        maxMonths = Math.ceil(likelyMonths * 2)
    } else {
        maxMonths = Math.ceil(goalTarget / prudentCapacity)
    }

    // Safety Cap: If > 10 years, treat as unreachable for practical purposes
    if (likelyMonths > 120) {
        return createUnreachableResult("L'obiettivo richiede oltre 10 anni al ritmo attuale.", baseDate)
    }

    return {
        minMonths: Math.max(0, minMonths),
        likelyMonths: Math.max(0, likelyMonths),
        maxMonths: Math.max(0, maxMonths),
        minDate: addMonths(baseDate, minMonths),
        likelyDate: addMonths(baseDate, likelyMonths),
        maxDate: addMonths(baseDate, maxMonths),
        canReach: true
    }
}

function createUnreachableResult(reason: string, baseDate: Date): ProjectionResult {
    return {
        minMonths: 0,
        likelyMonths: 0,
        maxMonths: 0,
        minDate: baseDate,
        likelyDate: baseDate,
        maxDate: baseDate,
        canReach: false,
        unreachableReason: reason
    }
}

