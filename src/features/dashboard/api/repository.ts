import { DashboardSummary, DashboardTimeFilter } from "./types"
import { fetchTransactions } from "../../transactions/api/repository"
import { fetchBudget } from "../../budget/api/repository"
import { parseCurrencyToCents } from "@/lib/currency-utils"

const DEFAULT_USER_ID = "user-1"

export const fetchDashboardSummary = async (filter: DashboardTimeFilter): Promise<DashboardSummary> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    // 1. Determine date range for filtered metrics
    const endDate = new Date(filter.period + "-01")
    // Set to end of month
    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setDate(0)

    const startDate = new Date(filter.period + "-01")
    if (filter.mode === "range" && filter.months) {
        startDate.setMonth(startDate.getMonth() - (filter.months - 1))
    }
    // Set to start of month
    startDate.setDate(1)

    // 2. Fetch all data
    // In a real app, we would filter in the query, but here we fetch all and filter in memory
    const [transactions, budgetPlan] = await Promise.all([
        fetchTransactions(),
        // Budget logic: always fetch for the "pivot" period (filter.period)
        fetchBudget(DEFAULT_USER_ID, filter.period)
    ])

    // 3. Calculate All-Time Net Balance (Global, unfiltered)
    const allTimeIncomeCents = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Math.abs(parseCurrencyToCents(t.amount)), 0)

    const allTimeExpensesCents = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Math.abs(parseCurrencyToCents(t.amount)), 0)

    const netBalance = (allTimeIncomeCents - allTimeExpensesCents) / 100

    // 4. Filter transactions for the selected range
    const rangeTransactions = transactions.filter(t => {
        const tDate = new Date(t.timestamp)
        return tDate >= startDate && tDate <= endDate
    })

    // 5. Calculate Metrics based on Range
    const totalExpensesCents = rangeTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Math.abs(parseCurrencyToCents(t.amount)), 0)

    const totalIncomeCents = rangeTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Math.abs(parseCurrencyToCents(t.amount)), 0)

    const totalSpent = totalExpensesCents / 100
    const totalIncome = totalIncomeCents / 100

    // 6. Calculate Budget Remaining
    // Rule: mode="month" -> use period; mode="range" -> use end period (filter.period)
    // Budget comparison is always against the "current/selected" month's expenses, even if showing a range chart.
    // So we need expenses specifically for filter.period (the target month)
    const [tYear, tMonth] = filter.period.split('-').map(Number)
    const targetMonthExpensesCents = transactions
        .filter(t => {
            const tDate = new Date(t.timestamp)
            return t.type === 'expense' &&
                tDate.getFullYear() === tYear &&
                tDate.getMonth() + 1 === tMonth
        })
        .reduce((acc, t) => acc + Math.abs(parseCurrencyToCents(t.amount)), 0)

    const budgetTotal = budgetPlan?.globalBudgetAmount || 0
    const budgetTotalCents = Math.round(budgetTotal * 100)
    const budgetRemaining = Math.max((budgetTotalCents - targetMonthExpensesCents) / 100, 0)

    // 7. Calculate Category Distribution (Range-based)
    const categoryMap = new Map<string, { label: string, amount: number }>()
    rangeTransactions.filter(t => t.type === 'expense').forEach(t => {
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

    // 8. Calculate Useless Spending (Range-based)
    const uselessSpentCents = rangeTransactions
        .filter(t => t.type === 'expense' && t.isSuperfluous)
        .reduce((acc, t) => acc + Math.abs(parseCurrencyToCents(t.amount)), 0)

    const uselessSpent = uselessSpentCents / 100
    const uselessSpendPercent = totalSpent > 0 ? Math.round((uselessSpent / totalSpent) * 100) : 0

    // 9. Calculate Monthly Expenses (Last N months based on filter)
    // If mode=month, show last 12 months context? Or just the month? 
    // Requirement says: "monthly series periodo". If I selected Month, a chart with 1 bar is weird.
    // But usually Dashboard charts show context.
    // "monthly-expenses-chart... non devono mantenere stato locale del periodo ... devono ricevere il filtro ... dalla dashboard metric"
    // Let's assume for Charts we ALWAYS want a reasonable history ending at filter.period.
    // If filter is Range 6M, we return those 6 months.
    // If filter is Month, maybe we return last 6 months ending there?
    // Let's stick to returning data strictly matched to filter if possible, OR if mode=month, maybe last 6 months is better UX so chart isn't empty.
    // Prompt: "monthly series periodo". This implies the data for the requested period.
    // If I ask for JAN 2024, range [JAN, JAN]. One bar.
    // If I ask for 3M ending JAN 2024, range [NOV, DEC, JAN].
    // Let's implement strictly what is requested: filtered data.

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

        const mTotalCents = rangeTransactions
            .filter(t => {
                if (t.type !== 'expense') return false
                const d = new Date(t.timestamp)
                return d.getMonth() === iMonth && d.getFullYear() === iYear
            })
            .reduce((acc, t) => acc + Math.abs(parseCurrencyToCents(t.amount)), 0)

        monthlyExpenses.push({ name: Label, total: mTotalCents / 100 })

        // Next month
        iterDate.setMonth(iterDate.getMonth() + 1)
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
