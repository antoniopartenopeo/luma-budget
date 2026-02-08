import { useMemo } from "react"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { useCategories } from "@/features/categories/api/use-categories"
import { computeMonthlyAverages, SimulationPeriod, MonthlyAveragesResult } from "./utils"

export function useMonthlyAverages(period: SimulationPeriod) {
    const { data: transactions, isLoading: isTxLoading } = useTransactions()
    const { data: categories, isLoading: isCatLoading } = useCategories()

    // Memoize calculations to avoid re-running on every render unless data changes
    const averagesResult = useMemo<MonthlyAveragesResult>(() => {
        if (!transactions) return { categories: {}, incomeCents: 0 }
        return computeMonthlyAverages(transactions, period)
    }, [transactions, period])

    // Enrich averages with Category metadata (name, icon, color)
    const enrichedAverages = useMemo(() => {
        if (!categories) return []

        // Merge computed averages with category list to ensure we have names
        return categories.map(cat => {
            const avgData = averagesResult.categories[cat.id]
            return {
                ...cat,
                averageAmount: avgData?.averageAmount || 0,
                hasData: !!avgData
            }
        })
            .filter(c => c.kind === "expense") // Only expenses usually matter for savings
            .sort((a, b) => b.averageAmount - a.averageAmount) // Sort by highest spend
    }, [averagesResult, categories])

    return {
        data: enrichedAverages,
        isLoading: isTxLoading || isCatLoading,
        rawAverages: averagesResult
    }
}
