import { DashboardTimeFilter } from "../api/types"
import { Transaction } from "@/features/transactions/api/types"
import { calculateDateRangeLocal, filterByRange } from "@/lib/date-ranges"

export const SYNTHETIC_ALTRI_ID = "altro-synthetic"
export const DEFAULT_TOP_SPENDING_CATEGORIES = 5

export interface SpendingCategoryMeta {
    id: string
    label: string
}

export interface SpendingSlice {
    id: string
    name: string
    value: number
}

/**
 * Builds chart-ready spending slices for the selected dashboard period.
 * Values are returned in integer cents and sorted by descending weight.
 */
export function buildSpendingCompositionSlices(
    transactions: Transaction[],
    filter: DashboardTimeFilter,
    categories: SpendingCategoryMeta[],
    topN: number = DEFAULT_TOP_SPENDING_CATEGORIES
): SpendingSlice[] {
    if (!transactions || transactions.length === 0) return []

    const months = filter.mode === "range" && filter.months ? filter.months : 1
    const { startDate, endDate } = calculateDateRangeLocal(filter.period, months)
    const periodTransactions = filterByRange(transactions, startDate, endDate)
        .filter(t => t.type === "expense")

    if (periodTransactions.length === 0) return []

    const categoryLabelMap = new Map(categories.map(c => [c.id, c.label]))
    const totalsByCategory: Record<string, number> = {}

    periodTransactions.forEach(t => {
        const value = Math.abs(t.amountCents)
        totalsByCategory[t.categoryId] = (totalsByCategory[t.categoryId] || 0) + value
    })

    const sortedCategories = Object.entries(totalsByCategory)
        .sort(([, a], [, b]) => b - a)

    const topSlices: SpendingSlice[] = sortedCategories
        .slice(0, topN)
        .map(([id, value]) => ({
            id,
            name: categoryLabelMap.get(id) || "Sconosciuta",
            value
        }))

    const othersTotal = sortedCategories
        .slice(topN)
        .reduce((acc, [, value]) => acc + value, 0)

    if (othersTotal > 0) {
        topSlices.push({
            id: SYNTHETIC_ALTRI_ID,
            name: "Altri",
            value: othersTotal
        })
    }

    return topSlices
}
