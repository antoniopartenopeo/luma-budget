import { DashboardTimeFilter } from "../api/types"
import { Transaction } from "@/features/transactions/api/types"
import { calculateDateRangeLocal, filterByRange } from "@/lib/date-ranges"
import type { CategorySummary } from "../api/types"

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
    color?: string
}

function sortByWeightAndName(a: SpendingSlice, b: SpendingSlice): number {
    const delta = b.value - a.value
    if (delta !== 0) return delta
    return a.name.localeCompare(b.name, "it-IT")
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
        .map(([id, value]) => ({
            id,
            name: categoryLabelMap.get(id) || "Sconosciuta",
            value
        }))
        .sort(sortByWeightAndName)

    const topSlices: SpendingSlice[] = sortedCategories
        .slice(0, topN)
        .map(({ id, name, value }) => ({ id, name, value }))

    const othersTotal = sortedCategories
        .slice(topN)
        .reduce((acc, item) => acc + item.value, 0)

    if (othersTotal > 0) {
        topSlices.push({
            id: SYNTHETIC_ALTRI_ID,
            name: "Altri",
            value: othersTotal
        })
    }

    return topSlices
}

/**
 * Builds chart-ready spending slices from dashboard summary categories.
 * Source of truth is DashboardSummary.categoriesSummary.
 */
export function buildSpendingCompositionSlicesFromSummary(
    categoriesSummary: CategorySummary[] | undefined,
    topN: number = DEFAULT_TOP_SPENDING_CATEGORIES
): SpendingSlice[] {
    if (!categoriesSummary || categoriesSummary.length === 0) return []

    const safeTopN = Math.max(1, topN)
    const normalized: SpendingSlice[] = categoriesSummary
        .filter(category => Math.abs(category.valueCents) > 0)
        .map(category => ({
            id: category.id,
            name: category.name,
            value: Math.abs(category.valueCents),
            color: category.color || "#6366f1"
        }))
        .sort(sortByWeightAndName)

    if (normalized.length === 0) return []

    const topSlices = normalized.slice(0, safeTopN)
    const othersTotal = normalized
        .slice(safeTopN)
        .reduce((acc, category) => acc + category.value, 0)

    if (othersTotal > 0) {
        topSlices.push({
            id: SYNTHETIC_ALTRI_ID,
            name: "Altri",
            value: othersTotal,
            color: "#94a3b8"
        })
    }

    return topSlices
}
