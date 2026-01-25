/**
 * State Derivation for Snapshot Narration
 * ========================================
 * 
 * Derives SnapshotState from SnapshotFacts using deterministic rules.
 * This is the ONLY place where business logic lives for state determination.
 */

import { KPIFacts, KPIState, SnapshotFacts, SnapshotState, TrendFacts, TrendState } from "./types"

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
    const { tone, kpiId, percent } = facts

    // Priority 1: Critical (explicitly negative tone or critical thresholds)
    if (tone === "negative") {
        return "critical"
    }

    // Priority 2: Attention (warning tone or near-limit thresholds)
    if (tone === "warning") {
        return "attention"
    }

    // Special cases for attention if tone not provided
    if (kpiId === "budget" && percent !== undefined && percent < 10 && percent > 0) {
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
 * 2. strained: budget >90% OR superfluous over target
 * 3. thriving: positive balance AND savingsRate >= 10%
 * 4. stable: everything else that's ok
 * 5. calm: insufficient data
 */
export function deriveSnapshotState(facts: SnapshotFacts): SnapshotState {
    const {
        balanceCents,
        utilizationPercent,
        superfluousPercent,
        superfluousTargetPercent,
        savingsRatePercent
    } = facts

    // Check if we have enough data
    const hasUtilization = utilizationPercent !== undefined && utilizationPercent > 0
    const hasSuperfluousData = superfluousPercent !== undefined && superfluousTargetPercent !== undefined

    // Derived flags
    const isBudgetOverrun = hasUtilization && utilizationPercent > 100
    const isBudgetStrained = hasUtilization && utilizationPercent > 90
    const isSuperfluousOver = hasSuperfluousData && superfluousPercent > superfluousTargetPercent
    const hasPositiveBalance = balanceCents > 0
    const hasNegativeBalance = balanceCents < 0
    const hasGoodSavings = savingsRatePercent !== undefined && savingsRatePercent >= 10

    // Priority 1: Critical - negative balance AND (budget overrun OR superfluous over)
    if (hasNegativeBalance && (isBudgetOverrun || isSuperfluousOver)) {
        return "critical"
    }

    // Priority 2: Strained - one significant issue (negative balance OR budget pressure OR superfluous)
    if (hasNegativeBalance || isBudgetStrained || isSuperfluousOver) {
        return "strained"
    }

    // Priority 3: Thriving - clearly positive (only if positive balance AND good savings AND NOT budget strained)
    if (hasPositiveBalance && hasGoodSavings && !isBudgetStrained) {
        return "thriving"
    }

    // Priority 4: Stable - positive balance but no specific "thriving" indicators or just okay
    if (hasPositiveBalance) {
        return "stable"
    }

    // Default: Calm - insufficient data or initial period (usually balance is 0 or very small positive with no other data)
    return "calm"
}
