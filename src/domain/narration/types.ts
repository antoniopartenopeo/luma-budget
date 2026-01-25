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

    // === Budget (optional) ===
    budgetFormatted?: string
    /** Budget utilization 0-100+ */
    utilizationPercent?: number

    // === Behavior (optional) ===
    /** Superfluous spending percentage */
    superfluousPercent?: number
    /** User's target for superfluous spending */
    superfluousTargetPercent?: number

    // === Derived (pre-calculated) ===
    /** Savings rate as percentage of income */
    savingsRatePercent?: number
}

/**
 * Derived state for Snapshot narration
 * 
 * State is derived from facts by deriveSnapshotState() in the calculation layer
 */
export type SnapshotState =
    | "thriving"    // surplus, under budget, superfluous ok
    | "stable"      // balanced, on track
    | "strained"    // deficit or budget pressure
    | "critical"    // multiple negative indicators
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
}

/**
 * Derived state for KPI narration
 */
export type KPIState =
    | "good"        // Positive/encouraging
    | "attention"   // Needs monitoring
    | "critical"    // Action required
    | "neutral"      // Contextual or insufficient data
