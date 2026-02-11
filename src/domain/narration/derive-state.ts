/**
 * State Derivation for Snapshot Narration
 * ========================================
 * 
 * Derives SnapshotState from SnapshotFacts using deterministic rules.
 * This is the ONLY place where business logic lives for state determination.
 */

import { KPIFacts, KPIState, SnapshotFacts, SnapshotState, TrendFacts, TrendState, AdvisorFacts, AdvisorState, BudgetFacts, BudgetState } from "./types"


/**
 * Derives the TrendState from temporal facts.
 */
export function deriveTrendState(facts: TrendFacts): TrendState {
    const { metricType, direction, changePercent } = facts
    const absChange = Math.abs(changePercent)

    // Priority 1: Volatile (large oscillations, e.g. > 50% change)
    if (absChange > 50) {
        return "volatile"
    }

    // Priority 2: Stable (insufficient change or context)
    if (direction === "flat" || absChange < 2) {
        return "stable"
    }

    // Priority 3: Improve/Deteriorate based on metric type
    if (metricType === "income" || metricType === "savings_rate") {
        if (direction === "up") return "improving"
        if (direction === "down") return "deteriorating"
    }

    if (metricType === "expenses") {
        if (direction === "up") return "deteriorating"
        if (direction === "down") return "improving"
    }

    // Default Fallback
    return "neutral"
}

/**
 * Derives the KPIState from facts for a single card.
 */
export function deriveKPIState(facts: KPIFacts): KPIState {
    const { tone, kpiId, percent, bufferRatio } = facts

    // Priority 1: Critical (explicitly negative tone or critical thresholds)
    if (tone === "negative") {
        return "critical"
    }

    // Priority 2: Attention
    // a) Explicit warning tone
    if (tone === "warning") {
        return "attention"
    }
    // b) Budget near limit (<10% remaining)
    if (kpiId === "budget" && percent !== undefined && percent < 10 && percent > 0) {
        return "attention"
    }
    // c) Balance Micro-surplus (Buffer < 5%)
    if (kpiId === "balance" && bufferRatio !== undefined && bufferRatio < 0.05 && bufferRatio >= 0) {
        return "attention"
    }

    // Priority 3: Good (explicitly positive tone)
    if (tone === "positive") {
        return "good"
    }

    // Default: Neutral
    return "neutral"
}

/**
 * Derives the SnapshotState from facts.
 * 
 * Rules (in priority order):
 * 1. critical: budget >100% AND superfluous over target
 * 2. strained: budget >90% OR superfluous over target OR (micro-surplus < 5%)
 * 3. thriving: positive balance AND savingsRate >= 10%
 * 4. stable: everything else that's ok
 * 5. calm: insufficient data
 */
export function deriveSnapshotState(facts: SnapshotFacts): SnapshotState {
    const {
        balanceCents,
        incomeCents,
        utilizationPercent,
        superfluousPercent,
        superfluousTargetPercent,
        savingsRatePercent,
        elapsedRatio,
        isProjectedOverrun,
        isDataIncomplete
    } = facts

    // B6: Data Integrity - Highest Priority
    if (isDataIncomplete) {
        return "calm"
    }

    // Basic calculation flags
    const hasUtilization = utilizationPercent !== undefined && utilizationPercent > 0
    const hasSuperfluousData = superfluousPercent !== undefined && superfluousTargetPercent !== undefined
    const isBudgetOverrun = hasUtilization && utilizationPercent > 100
    const isBudgetStrained = hasUtilization && utilizationPercent > 90
    const isSuperfluousOver = hasSuperfluousData && superfluousPercent > superfluousTargetPercent
    const hasPositiveBalance = balanceCents > 0
    const hasNegativeBalance = balanceCents < 0
    const hasGoodSavings = savingsRatePercent !== undefined && savingsRatePercent >= 10

    // B3: Pacing Logic
    const utilizationRatio = utilizationPercent !== undefined ? utilizationPercent / 100 : 0
    const isPacingOff = utilizationPercent !== undefined && elapsedRatio !== undefined && elapsedRatio > 0 &&
        (utilizationRatio > elapsedRatio * 1.1) // More than 10% over temporal pace

    // B2: Pacing Required for positive states
    const hasPacingInfo = elapsedRatio !== undefined && elapsedRatio > 0

    // Micro-surplus Logic
    let isMicroSurplus = false
    if (hasPositiveBalance && incomeCents && incomeCents > 0) {
        const bufferRatio = balanceCents / incomeCents
        if (bufferRatio < 0.05) {
            isMicroSurplus = true
        }
    }

    // ===================================
    // PRIORITY 1: CRITICAL & STRAINED (Risks)
    // ===================================

    // Priority 1: Critical - negative balance AND (budget overrun OR superfluous over)
    if (hasNegativeBalance && (isBudgetOverrun || isSuperfluousOver)) {
        return "critical"
    }

    // Priority 2: At Risk (B4 & B3)
    if (isProjectedOverrun || (hasUtilization && isPacingOff)) {
        return "at_risk"
    }

    // Priority 3: Strained
    if (hasNegativeBalance || isBudgetStrained || isSuperfluousOver || isMicroSurplus) {
        return "strained"
    }

    // ===================================
    // PRIORITY 2: EARLY MONTH (B1)
    // ===================================

    // B1: No Early Praise (takes precedence over Thriving/Stable)
    if (elapsedRatio !== undefined && elapsedRatio < 0.15) {
        return "early_uncertain"
    }

    // ===================================
    // PRIORITY 3: POSITIVE STATES
    // ===================================

    // B2 check: No positive state without pacing
    if (!hasPacingInfo) {
        return "calm"
    }

    // Priority 4: Thriving
    if (hasPositiveBalance && hasGoodSavings && !isBudgetStrained && !isPacingOff) {
        return "thriving"
    }

    // Priority 5: Stable
    if (hasPositiveBalance && incomeCents && incomeCents > 0) {
        return "stable"
    }

    // Default: Calm
    return "calm"
}

/**
 * Derives the AdvisorState from facts.
 */
export function deriveAdvisorState(facts: AdvisorFacts): AdvisorState {
    const {
        predictedTotalEstimatedBalanceCents,
        baseBalanceCents,
        historicalMonthsCount,
    } = facts

    // Neutral for cold start (insufficient history) or zero balance
    if (historicalMonthsCount < 1 && predictedTotalEstimatedBalanceCents === 0 && baseBalanceCents === 0) {
        return "neutral"
    }

    if (predictedTotalEstimatedBalanceCents < 0) {
        return "deficit"
    }

    if (predictedTotalEstimatedBalanceCents > 0) {
        return "positive_balance"
    }

    return "neutral"
}

/**
 * Derives the BudgetState from facts.
 * 
 * Rules (in priority order - MUST MATCH CHECKLIST):
 * 1. calm/neutral: isDataIncomplete === true
 * 2. early_uncertain: elapsedRatio < 0.15 (15% of period)
 * 3. over_budget: spentCents > limitCents
 * 4. at_risk: pacingRatio > 1.1 OR projectedSpendCents > limitCents
 * 5. on_track: pacingRatio <= 1.1
 */
export function deriveBudgetState(facts: BudgetFacts): BudgetState {
    const {
        spentCents,
        limitCents,
        elapsedRatio,
        pacingRatio,
        projectedSpendCents,
        isDataIncomplete
    } = facts

    // Precedence 1: Data Integrity
    if (isDataIncomplete) {
        return "calm"
    }

    // Precedence 2: Early Month (Rule B1)
    if (elapsedRatio < 0.15) {
        return "early_uncertain"
    }

    // Precedence 3: Limit Exceeded (Rule B5)
    if (spentCents > limitCents) {
        return "over_budget"
    }

    // Precedence 4: At Risk (Rule B4 & B3)
    // 10% buffer allowed before calling at_risk for noise reduction
    if (pacingRatio > 1.1 || projectedSpendCents > limitCents) {
        return "at_risk"
    }

    // Precedence 5: On Track
    // Requires pacingRatio to be valid (> 0) and healthy
    if (pacingRatio > 0 && pacingRatio <= 1.1) {
        return "on_track"
    }

    // Fallback: Calm (Insufficient signal)
    return "calm"
}
