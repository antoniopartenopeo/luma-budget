// Insights Utility Functions
// ==========================
// Pure functions for date manipulation and transaction aggregation

import { InsightsSensitivity } from "@/features/settings/api/types"
import { InsightThresholds } from "./types"
import { getMonthBoundariesLocal } from "@/lib/date-ranges"

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
    return transactions.filter(t => {
        const date = new Date(t.timestamp)
        return date >= start && date <= end
    })
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
        // Use local date parts to avoid timezone shift from toISOString()
        const formatDate = (d: Date) => {
            const y = d.getFullYear()
            const m = (d.getMonth() + 1).toString().padStart(2, "0")
            const day = d.getDate().toString().padStart(2, "0")
            return `${y}-${m}-${day}`
        }
        searchParams.set("period", "custom")
        searchParams.set("from", formatDate(start))
        searchParams.set("to", formatDate(end))
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
