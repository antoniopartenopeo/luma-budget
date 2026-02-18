import { DashboardSummary, DashboardTimeFilter } from "./types"
import { fetchTransactions } from "../../transactions/api/repository"
import { getSignedCents } from "@/domain/transactions"
import { calculateDateRangeLocal, filterByRange } from "@/lib/date-ranges"
import { getCategoryById } from "@/features/categories/config"
import { getCategories } from "@/features/categories/api/repository"
import { calculateSuperfluousMetrics } from "../../transactions/utils/transactions-logic"

import { sumExpensesInCents, sumIncomeInCents } from "@/domain/money"

export const fetchDashboardSummary = async (filter: DashboardTimeFilter): Promise<DashboardSummary> => {
    // Simulate network delay


    // 1. Determine date range for filtered metrics
    const { startDate, endDate } = calculateDateRangeLocal(
        filter.period,
        (filter.mode === "range" && filter.months) ? filter.months : 1
    )

    // 2. Fetch all data
    // In a real app, we would filter in the query, but here we fetch all and filter in memory
    const [transactions, categories] = await Promise.all([
        fetchTransactions(),
        getCategories()
    ])

    // 3. Calculate All-Time Net Balance (Global, unfiltered)
    const allTimeIncomeCents = sumIncomeInCents(transactions)
    const allTimeExpensesCents = sumExpensesInCents(transactions)

    const netBalanceCents = allTimeIncomeCents - allTimeExpensesCents

    // 4. Filter transactions for the selected range
    const rangeTransactions = filterByRange(transactions, startDate, endDate)

    // 5. Calculate Metrics based on range
    const totalExpensesCents = sumExpensesInCents(rangeTransactions)
    const totalIncomeCents = sumIncomeInCents(rangeTransactions)

    const totalSpentCents = totalExpensesCents
    const totalIncomeCentsSafe = totalIncomeCents

    // 6. Calculate Category Distribution (Range-based)
    const categoryMap = new Map<string, { label: string, amountCents: number, color: string }>()
    rangeTransactions.filter(t => t.type === 'expense').forEach(t => {
        const amountCents = Math.abs(getSignedCents(t))
        // Lookup category for consistent label and color
        const categoryDef = getCategoryById(t.categoryId, categories)
        // Fallback color if not found (shouldn't happen)
        const color = categoryDef?.hexColor || "#94a3b8"
        const label = categoryDef?.label || t.category

        const current = categoryMap.get(t.categoryId) || { label, amountCents: 0, color }
        categoryMap.set(t.categoryId, { label, amountCents: current.amountCents + amountCents, color })
    })

    const categoriesSummary = Array.from(categoryMap.entries())
        .map(([id, data]) => ({
            id,
            name: data.label,
            valueCents: data.amountCents,
            value: data.amountCents / 100,
            color: data.color
        }))
        .sort((a, b) => {
            const delta = b.valueCents - a.valueCents
            if (delta !== 0) return delta
            return a.name.localeCompare(b.name, "it-IT")
        })

    // 7. Calculate Superfluous Spending (Range-based)
    const {
        percentage: uselessSpendPercent
    } = calculateSuperfluousMetrics(rangeTransactions)



    // 8. Monthly Data for Charts
    const monthlyExpenses = []
    const startM = startDate.getMonth()
    const startY = startDate.getFullYear()

    // Iterate month by month from start to end
    const iterDate = new Date(startY, startM, 1)
    while (iterDate <= endDate) {
        const iMonth = iterDate.getMonth()
        const iYear = iterDate.getFullYear()
        // Italian short month name
        const monthName = new Intl.DateTimeFormat("it-IT", { month: "short" }).format(iterDate)
        // Capitalize
        const Label = monthName.charAt(0).toUpperCase() + monthName.slice(1)

        const monthTxs = rangeTransactions.filter(t => {
            const d = new Date(t.timestamp)
            return d.getMonth() === iMonth && d.getFullYear() === iYear
        })
        const mTotalCents = sumExpensesInCents(monthTxs)

        monthlyExpenses.push({ name: Label, totalCents: mTotalCents, total: mTotalCents / 100 })

        // Next month
        iterDate.setMonth(iterDate.getMonth() + 1)
    }

    // Since calculateSharePct returns 0 if total is 0, we need to handle "uselessSpendPercent" nullability if we want to preserve distinct "No Data" semantics vs "0%"
    // Original logic: totalSpent > 0 ? ... : null
    // New logic: 0. If we want null, we must check totalExpensesCents > 0
    const finalUselessPercent = totalExpensesCents > 0 ? uselessSpendPercent : null

    return {
        allTimeIncomeCents,
        allTimeExpensesCents,
        netBalanceAllTimeCents: netBalanceCents,
        totalSpentCents,
        totalIncomeCents: totalIncomeCentsSafe,
        totalExpensesCents: totalSpentCents,
        // Compatibility alias used by existing components and hooks.
        netBalanceCents,
        allTimeIncome: allTimeIncomeCents / 100,
        allTimeExpenses: allTimeExpensesCents / 100,
        netBalanceAllTime: netBalanceCents / 100,
        totalSpent: totalSpentCents / 100,
        totalIncome: totalIncomeCentsSafe / 100,
        totalExpenses: totalSpentCents / 100,
        netBalance: netBalanceCents / 100,
        uselessSpendPercent: finalUselessPercent,
        categoriesSummary,
        usefulVsUseless: {
            useful: finalUselessPercent !== null ? 100 - finalUselessPercent : 100,
            useless: finalUselessPercent !== null ? finalUselessPercent : 0
        },
        monthlyExpenses
    }
}
