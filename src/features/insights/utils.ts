// Insights Utility Functions
// ==========================
// Pure functions for date manipulation and transaction aggregation

import { InsightsSensitivity } from "@/features/settings/api/types"
import { InsightThresholds } from "./types"
import { getMonthBoundariesLocal, filterByRange, formatDateLocalISO } from "@/lib/date-ranges"

// Re-export centralized date utilities
export {
    getCurrentPeriod,
    formatPeriodLabel,
    getPreviousMonths,
    getDaysElapsedInMonth,
    getDaysInMonth,
} from "@/lib/date-ranges"

/**
 * Maps sensitivity level to concrete insight thresholds
 */
export function getInsightThresholds(sensitivity: InsightsSensitivity): InsightThresholds {
    switch (sensitivity) {
        case "low":
            return {
                spikeMinDeltaCents: 10000, // €100
                spikeMinDeltaPct: 50,
                budgetMediumPct: 30,
                budgetHighPct: 60,
                topDriversMinDeltaCents: 10000, // €100 noise gate
            }
        case "high":
            return {
                spikeMinDeltaCents: 2000, // €20
                spikeMinDeltaPct: 20,
                budgetMediumPct: 10,
                budgetHighPct: 25,
                topDriversMinDeltaCents: 0,
            }
        case "medium":
        default:
            return {
                spikeMinDeltaCents: 5000, // €50
                spikeMinDeltaPct: 30,
                budgetMediumPct: 20,
                budgetHighPct: 50,
                topDriversMinDeltaCents: 0,
            }
    }
}

/**
 * Filter transactions by a specific month period
 * Uses Local Time boundaries to match user expectation
 */
export function filterTransactionsByMonth<T extends { timestamp: number }>(
    transactions: T[],
    period: string
): T[] {
    const { start, end } = getMonthBoundariesLocal(period)
    return filterByRange(transactions, start, end)
}

/**
 * Calculate total expense cents by category for a set of transactions
 */
export function getExpenseTotalsByCategoryCents(
    transactions: { categoryId: string; amountCents: number; type: "income" | "expense" }[]
): Map<string, number> {
    const totals = new Map<string, number>()

    for (const t of transactions) {
        if (t.type !== "expense") continue
        const current = totals.get(t.categoryId) || 0
        totals.set(t.categoryId, current + Math.abs(t.amountCents))
    }

    return totals
}

/**
 * Build a transactions page URL with filters
 */
export function buildTransactionsUrl(params: {
    period?: string
    categoryId?: string
    sortByAmount?: boolean
}): string {
    const searchParams = new URLSearchParams()

    if (params.period) {
        const { start, end } = getMonthBoundariesLocal(params.period)
        searchParams.set("period", "custom")
        searchParams.set("from", formatDateLocalISO(start))
        searchParams.set("to", formatDateLocalISO(end))
    }

    if (params.categoryId) {
        searchParams.set("cat", params.categoryId)
    }

    if (params.sortByAmount) {
        searchParams.set("sort", "amount")
        searchParams.set("order", "desc")
    }

    const queryString = searchParams.toString()
    return `/transactions${queryString ? `?${queryString}` : ""}`
}
