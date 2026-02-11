import { DashboardSummary, DashboardTimeFilter } from "./types"
import { fetchTransactions } from "../../transactions/api/repository"
import { fetchBudget } from "@/VAULT/budget/api/repository"
import { getSignedCents } from "@/domain/transactions"
import { calculateDateRangeLocal, filterByRange } from "@/lib/date-ranges"
import { getCategoryById } from "@/features/categories/config"
import { getCategories } from "@/features/categories/api/repository"
import { calculateSuperfluousMetrics } from "../../transactions/utils/transactions-logic"

import { sumExpensesInCents, sumIncomeInCents } from "@/domain/money"
import { getPortfolio } from "@/VAULT/goals/api/goal-repository"
import { LOCAL_USER_ID } from "@/lib/runtime-user"

export const fetchDashboardSummary = async (filter: DashboardTimeFilter): Promise<DashboardSummary> => {
    // Simulate network delay


    // 1. Determine date range for filtered metrics
    const { startDate, endDate } = calculateDateRangeLocal(
        filter.period,
        (filter.mode === "range" && filter.months) ? filter.months : 1
    )

    // 2. Fetch all data
    // In a real app, we would filter in the query, but here we fetch all and filter in memory
    const [transactions, budgetPlan, categories, portfolio] = await Promise.all([
        fetchTransactions(),
        // Budget logic: always fetch for the "pivot" period (filter.period)
        fetchBudget(LOCAL_USER_ID, filter.period),
        getCategories(),
        getPortfolio()
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

    // 6. Calculate Budget Remaining
    // Rule: mode="month" -> use period; mode="range" -> use end period (filter.period)
    const { startDate: pivotStart, endDate: pivotEnd } = calculateDateRangeLocal(filter.period, 1)
    const targetMonthTransactions = filterByRange(transactions, pivotStart, pivotEnd)
    const targetMonthExpensesCents = sumExpensesInCents(targetMonthTransactions)

    const budgetTotalCents = budgetPlan?.globalBudgetAmountCents || 0
    const budgetRemainingCents = Math.max(budgetTotalCents - targetMonthExpensesCents, 0)

    // 7. Calculate Category Distribution (Range-based)
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

    // 8. Calculate Superfluous Spending (Range-based)
    const {
        percentage: uselessSpendPercent
    } = calculateSuperfluousMetrics(rangeTransactions)



    // 9. Monthly Data for Charts
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
        totalSpentCents,
        totalIncomeCents: totalIncomeCentsSafe,
        totalExpensesCents: totalSpentCents,
        netBalanceCents,
        budgetTotalCents,
        budgetRemainingCents,
        totalSpent: totalSpentCents / 100,
        totalIncome: totalIncomeCentsSafe / 100,
        totalExpenses: totalSpentCents / 100,
        netBalance: netBalanceCents / 100,
        budgetTotal: budgetTotalCents / 100,
        budgetRemaining: budgetRemainingCents / 100,
        uselessSpendPercent: finalUselessPercent,
        categoriesSummary,
        usefulVsUseless: {
            useful: finalUselessPercent !== null ? 100 - finalUselessPercent : 100,
            useless: finalUselessPercent !== null ? finalUselessPercent : 0
        },
        monthlyExpenses,
        activeRhythm: portfolio?.activeRhythm ? {
            type: portfolio.activeRhythm.type,
            label: portfolio.activeRhythm.label,
            intensity: portfolio.activeRhythm.intensity
        } : undefined
    }
}
