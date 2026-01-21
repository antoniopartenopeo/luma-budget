import { DashboardSummary, DashboardTimeFilter } from "./types"
import { fetchTransactions } from "../../transactions/api/repository"
import { fetchBudget } from "../../budget/api/repository"
import { getSignedCents } from "@/domain/transactions"
import { calculateDateRange, filterByRange, getMonthBoundariesLocal } from "@/lib/date-ranges"
import { getCategoryById } from "@/features/categories/config"

import { sumExpensesInCents, sumIncomeInCents, calculateSharePct } from "@/domain/money"

const DEFAULT_USER_ID = "user-1"

export const fetchDashboardSummary = async (filter: DashboardTimeFilter): Promise<DashboardSummary> => {
    // Simulate network delay


    // 1. Determine date range for filtered metrics
    const { startDate, endDate } = calculateDateRange(
        filter.period,
        (filter.mode === "range" && filter.months) ? filter.months : 1
    )

    // 2. Fetch all data
    // In a real app, we would filter in the query, but here we fetch all and filter in memory
    const [transactions, budgetPlan] = await Promise.all([
        fetchTransactions(),
        // Budget logic: always fetch for the "pivot" period (filter.period)
        fetchBudget(DEFAULT_USER_ID, filter.period)
    ])

    // 3. Calculate All-Time Net Balance (Global, unfiltered)
    const allTimeIncomeCents = sumIncomeInCents(transactions)
    const allTimeExpensesCents = sumExpensesInCents(transactions)

    const netBalance = (allTimeIncomeCents - allTimeExpensesCents) / 100

    // 4. Filter transactions for the selected range
    const rangeTransactions = filterByRange(transactions, startDate, endDate)

    // 5. Calculate Metrics based on range
    const totalExpensesCents = sumExpensesInCents(rangeTransactions)
    const totalIncomeCents = sumIncomeInCents(rangeTransactions)

    const totalSpent = totalExpensesCents / 100
    const totalIncome = totalIncomeCents / 100

    // 6. Calculate Budget Remaining
    // Rule: mode="month" -> use period; mode="range" -> use end period (filter.period)
    const { start: pivotStart, end: pivotEnd } = getMonthBoundariesLocal(filter.period)
    const targetMonthTransactions = filterByRange(transactions, pivotStart, pivotEnd)
    const targetMonthExpensesCents = sumExpensesInCents(targetMonthTransactions)

    const budgetTotal = budgetPlan?.globalBudgetAmount || 0
    const budgetTotalCents = Math.round(budgetTotal * 100)
    const budgetRemaining = Math.max((budgetTotalCents - targetMonthExpensesCents) / 100, 0)

    // 7. Calculate Category Distribution (Range-based)
    const categoryMap = new Map<string, { label: string, amount: number, color: string }>()
    rangeTransactions.filter(t => t.type === 'expense').forEach(t => {
        const amountCents = Math.abs(getSignedCents(t))
        // Lookup category for consistent label and color
        const categoryDef = getCategoryById(t.categoryId)
        // Fallback color if not found (shouldn't happen)
        const color = categoryDef?.hexColor || "#94a3b8"
        const label = categoryDef?.label || t.category

        const current = categoryMap.get(t.categoryId) || { label, amount: 0, color }
        categoryMap.set(t.categoryId, { label, amount: current.amount + (amountCents / 100), color })
    })

    const categoriesSummary = Array.from(categoryMap.entries()).map(([id, data]) => ({
        id,
        name: data.label,
        value: data.amount,
        color: data.color
    }))

    // 8. Calculate Useless Spending (Range-based)
    const uselessTransactions = rangeTransactions.filter(t => t.type === 'expense' && t.isSuperfluous)
    const uselessSpentCents = sumExpensesInCents(uselessTransactions)

    const uselessSpent = uselessSpentCents / 100
    // Use shared percent calculation (input is Cents)
    const uselessSpendPercent = calculateSharePct(uselessSpentCents, totalExpensesCents)

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

        monthlyExpenses.push({ name: Label, total: mTotalCents / 100 })

        // Next month
        iterDate.setMonth(iterDate.getMonth() + 1)
    }

    // Since calculateSharePct returns 0 if total is 0, we need to handle "uselessSpendPercent" nullability if we want to preserve distinct "No Data" semantics vs "0%"
    // Original logic: totalSpent > 0 ? ... : null
    // New logic: 0. If we want null, we must check totalExpensesCents > 0
    const finalUselessPercent = totalExpensesCents > 0 ? uselessSpendPercent : null

    return {
        totalSpent,
        totalIncome,
        totalExpenses: totalSpent,
        netBalance,
        budgetTotal,
        budgetRemaining,
        uselessSpendPercent: finalUselessPercent,
        categoriesSummary,
        usefulVsUseless: {
            useful: finalUselessPercent !== null ? 100 - finalUselessPercent : 100,
            useless: finalUselessPercent !== null ? finalUselessPercent : 0
        },
        monthlyExpenses
    }
}
