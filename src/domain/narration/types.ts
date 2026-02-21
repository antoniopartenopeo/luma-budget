/**
 * Narration Layer Types
 * =====================
 * Based on Narration Contract v1
 * 
 * RULE: Narration Layer does NOT compute. It receives pre-calculated facts only.
 */

// =====================
// COMMON TYPES
// =====================

/**
 * Output of any narrator function
 */
export interface NarrationResult {
    /** Main narrative text */
    text: string
    /** Short version (<50 chars) for compact displays */
    shortText?: string
    /** Key items to highlight */
    highlights?: string[]
    /** Optional action label */
    actionLabel?: string
    /** Optional action URL */
    actionUrl?: string
}

// =====================
// SNAPSHOT TYPES (Flash Summary)
// =====================

/**
 * Facts for Flash Summary SNAPSHOT narration
 * 
 * All monetary values MUST be pre-formatted (e.g., "€1.234,56")
 * Narration Layer never calls formatCents() or any calculation function
 */
export interface SnapshotFacts {
    /** Unique identifier for this snapshot */
    snapshotId: string
    /** Human-readable period label (e.g., "Gennaio 2026") */
    periodLabel: string

    // === Core Metrics (pre-formatted) ===
    incomeFormatted: string
    expensesFormatted: string
    balanceFormatted: string
    /** Balance in cents - ONLY for sign determination, not for display */
    balanceCents: number
    /** Income in cents - required for relative buffer calculation */
    incomeCents?: number

    // === Budget (optional) ===
    budgetFormatted?: string
    /** Budget utilization 0-100+ */
    utilizationPercent?: number
    /** Superfluous spending percentage */
    superfluousPercent?: number
    /** User's target for superfluous spending */
    superfluousTargetPercent?: number
    /** Savings rate as percentage of income */
    savingsRatePercent?: number
    /** Ratio of time passed in the period (0-1) */
    elapsedRatio?: number
    /** Whether the current spending pace exceeds the budget at end of period */
    isProjectedOverrun?: boolean
    /** Data integrity flag for Rule B6 */
    isDataIncomplete?: boolean
}

/**
 * Derived state for Snapshot narration
 * 
 * State is derived from facts by deriveSnapshotState() in the calculation layer
 */
export type SnapshotState =
    | "thriving"    // surplus, under budget, superfluous ok
    | "stable"      // balanced, on track
    | "at_risk"     // NEW: projection exceeds budget or pacing is off
    | "strained"    // deficit or budget pressure
    | "critical"    // multiple negative indicators
    | "early_uncertain" // NEW: first days of month, no praise allowed
    | "calm"        // insufficient data, no alarms
// =====================
// KPI TYPES (Dashboard Cards)
// =====================

/**
 * Facts for a single KPI card narration
 */
export interface KPIFacts {
    /** Unique identifier for the KPI */
    kpiId: "balance" | "expenses" | "budget" | "superfluous"
    /** Formatted value for display (e.g., "€1.234") */
    valueFormatted: string
    /** Optional raw percentage (0-100+) */
    percent?: number
    /** Optional target percentage for comparison */
    targetPercent?: number
    /** Optional pre-calculated tone from KPI logic */
    tone?: "positive" | "negative" | "warning" | "neutral"
    /** Optional relative buffer (net / income) for balance KPI */
    bufferRatio?: number
}

/**
 * Derived state for KPI narration
 */
export type KPIState =
    | "good"        // Positive/encouraging
    | "attention"   // Needs monitoring
    | "critical"    // Action required
    | "neutral"      // Contextual or insufficient data

// =====================
// TREND TYPES (Insights)
// =====================

/**
 * Facts for a trend analysis narration
 */
export interface TrendFacts {
    /** The metric being analyzed */
    metricType: "income" | "expenses" | "savings_rate"
    /** Percentage change compared to previous period or average */
    changePercent: number
    /** Direction of the trend */
    direction: "up" | "down" | "flat"
    /** Formatted current value */
    currentValueFormatted: string
    /** Formatted previous or average value for comparison */
    comparisonValueFormatted?: string
    /** Optional period label */
    periodLabel?: string
    /** Metric Identifier for logic checks */
    metricId?: "expenses" | "income" | "savings" | "savings_rate"
    /** Raw savings rate value (decimal, e.g. -0.10 for -10%) if applicable */
    savingsRateValue?: number
    /** Flag to explicitly indicate negative savings rate without parsing */
    isSavingsRateNegative?: boolean
}

/**
 * Derived state for Trend narration
 */
export type TrendState =
    | "improving"      // Positive financial evolution
    | "deteriorating"  // Negative financial evolution
    | "stable"         // Minimum variation
    | "volatile"       // Significant oscillations
    | "neutral"        // Contextual or insufficient data

// =====================
// ORCHESTRATOR TYPES
// =====================

/**
 * A candidate for orchestration. 
 * Represents a signal from any source (forecast, trend, risk_spike, etc.)
 */
export interface NarrationCandidate {
    id: string
    source: "projection" | "trend" | "risk_spike" | "snapshot" | "subscription"
    scope: "current_period" | "long_term"
    severity: "low" | "medium" | "high" | "critical"
    narration: NarrationResult
}

/**
 * The final output of the orchestrator
 */
export interface OrchestratedNarration {
    /** The top priority signal */
    primary: NarrationCandidate
    /** Up to 2 secondary signals for context */
    secondary: NarrationCandidate[]
    /** Signals that were filtered out */
    suppressed: NarrationCandidate[]
    /** Metadata about why this orchestration was chosen */
    rationale: {
        rulesTriggered: string[]
    }
    /** Context for cross-component awareness (e.g. current crisis affecting long-term trends) */
    context: OrchestrationContext
}

/**
 * Context derived from the orchestration process to inform other narrators.
 */
export interface OrchestrationContext {
    /** True if there is a High or Critical severity issue in the current period */
    hasHighSeverityCurrentIssue: boolean
}

// =====================
// AI ADVISOR TYPES
// =====================

export interface AdvisorFacts {
    baseBalanceCents: number
    predictedRemainingCurrentMonthExpensesCents: number
    predictedTotalEstimatedBalanceCents: number
    primarySource: "brain" | "fallback"
    historicalMonthsCount: number
    subscriptionCount: number
    subscriptionTotalYearlyCents: number
}

export type AdvisorState = "deficit" | "positive_balance" | "neutral"
