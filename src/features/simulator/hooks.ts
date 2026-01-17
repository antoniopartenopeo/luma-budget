import { useMemo } from "react"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { useCategories } from "@/features/categories/api/use-categories"
import { computeMonthlyAverages, SimulationPeriod } from "./utils"

export function useMonthlyAverages(period: SimulationPeriod) {
    const { data: transactions, isLoading: isTxLoading } = useTransactions()
    const { data: categories, isLoading: isCatLoading } = useCategories()

    // Memoize calculations to avoid re-running on every render unless data changes
    const averages = useMemo(() => {
        if (!transactions) return {}
        return computeMonthlyAverages(transactions, period)
    }, [transactions, period])

    // Enrich averages with Category metadata (name, icon, color)
    // and include categories with 0 spend if needed (optional, for now we list what we have)
    const enrichedAverages = useMemo(() => {
        if (!categories) return []

        // Merge computed averages with category list to ensure we have names
        return categories.map(cat => {
            const avgData = averages[cat.id]
            return {
                ...cat,
                averageAmount: avgData?.averageAmount || 0,
                hasData: !!avgData
            }
        })
            .filter(c => c.kind === "expense") // Only expenses usually matter for savings
            .sort((a, b) => b.averageAmount - a.averageAmount) // Sort by highest spend
    }, [averages, categories])

    return {
        data: enrichedAverages,
        isLoading: isTxLoading || isCatLoading,
        rawAverages: averages
    }
}
