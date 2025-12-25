import { DashboardSummary } from "./types"
import { fetchTransactions } from "../../transactions/api/repository"
import { fetchBudget } from "../../budget/api/repository"
import { getCurrentPeriod } from "../../budget/utils/calculate-budget"
import { parseCurrencyToCents } from "@/lib/currency-utils"

const DEFAULT_USER_ID = "user-1"

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const currentPeriod = getCurrentPeriod()
    const [transactions, budgetPlan] = await Promise.all([
        fetchTransactions(),
        fetchBudget(DEFAULT_USER_ID, currentPeriod)
    ])

    // Calculate Total Expenses (all time or just current month? Current dashboard seems to show a mix, 
    // but totalSpent/budgetRemaining usually refer to current period in a budget context)
    // However, keeping previous behavior of "all transactions" for charts but period-specific for KPIs
    const currentMonthTxs = transactions.filter(t => {
        const tDate = new Date(t.timestamp)
        const [y, m] = currentPeriod.split("-").map(Number)
        return tDate.getFullYear() === y && tDate.getMonth() + 1 === m
    })

    const totalExpensesCents = currentMonthTxs
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Math.abs(parseCurrencyToCents(t.amount)), 0)

    // Calculate Total Income
    const totalIncomeCents = currentMonthTxs
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Math.abs(parseCurrencyToCents(t.amount)), 0)

    const totalSpent = totalExpensesCents / 100
    const totalIncome = totalIncomeCents / 100

    // Calculate Net Balance (Income - Expenses) - keeping original sign logic
    const netBalance = (totalIncomeCents - totalExpensesCents) / 100

    // Calculate Budget Remaining using real budget plan (Budget - Expenses)
    const budgetTotal = budgetPlan?.globalBudgetAmount || 0
    const budgetTotalCents = Math.round(budgetTotal * 100)
    const budgetRemaining = Math.max((budgetTotalCents - totalExpensesCents) / 100, 0)

    // Calculate Category Distribution (Current month only for consistency with totalSpent)
    const categoryMap = new Map<string, { label: string, amount: number }>()
    currentMonthTxs.filter(t => t.type === 'expense').forEach(t => {
        const amountCents = Math.abs(parseCurrencyToCents(t.amount))
        const current = categoryMap.get(t.categoryId) || { label: t.category, amount: 0 }
        categoryMap.set(t.categoryId, { label: t.category, amount: current.amount + (amountCents / 100) })
    })

    const categoriesSummary = Array.from(categoryMap.entries()).map(([id, data], index) => ({
        id,
        name: data.label,
        value: data.amount,
        color: `hsl(var(--chart-${(index % 5) + 1}))`
    }))

    // Calculate Useless Spending (Using isSuperfluous flag, current month)
    const uselessSpentCents = currentMonthTxs
        .filter(t => t.type === 'expense' && t.isSuperfluous)
        .reduce((acc, t) => acc + Math.abs(parseCurrencyToCents(t.amount)), 0)

    const uselessSpent = uselessSpentCents / 100
    const uselessSpendPercent = totalSpent > 0 ? Math.round((uselessSpent / totalSpent) * 100) : 0

    // Calculate Monthly Expenses (Last 12 months)
    const monthlyExpenses = []
    const today = new Date()
    const monthNames = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]

    for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthIndex = d.getMonth()
        const year = d.getFullYear()
        const monthName = monthNames[monthIndex]

        const totalCents = transactions
            .filter(t => {
                if (t.type !== 'expense') return false
                const tDate = new Date(t.timestamp)
                return tDate.getMonth() === monthIndex && tDate.getFullYear() === year
            })
            .reduce((acc, t) => acc + Math.abs(parseCurrencyToCents(t.amount)), 0)

        const total = totalCents / 100

        monthlyExpenses.push({ name: monthName, total })
    }

    return {
        totalSpent,
        totalIncome,
        totalExpenses: totalSpent,
        netBalance,
        budgetTotal,
        budgetRemaining,
        uselessSpendPercent,
        categoriesSummary,
        usefulVsUseless: {
            useful: 100 - uselessSpendPercent,
            useless: uselessSpendPercent
        },
        monthlyExpenses
    }
}
