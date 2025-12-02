import { DashboardSummary } from "./types"

import { getTransactions } from "../../transactions/api/mock-data"

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate random error (5% chance)
    if (Math.random() < 0.05) {
        throw new Error("Failed to fetch dashboard summary")
    }

    const transactions = getTransactions()

    // Calculate Total Spent (only expenses)
    const totalSpent = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            // Parse amount string "-€85.00" -> 85.00
            const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g, ""))
            return acc + Math.abs(amount)
        }, 0)

    // Calculate Budget Remaining (Fixed Budget 2000 for now)
    const budgetLimit = 2000
    const budgetRemaining = budgetLimit - totalSpent

    // Calculate Category Distribution
    const categoryMap = new Map<string, number>()
    transactions.filter(t => t.type === 'expense').forEach(t => {
        const amount = Math.abs(parseFloat(t.amount.replace(/[^0-9.-]+/g, "")))
        categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + amount)
    })

    const categoriesSummary = Array.from(categoryMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: `hsl(var(--chart-${(index % 5) + 1}))`
    }))

    // Calculate Useless Spending (Mock logic: "Svago" and "Altro" are useless)
    const uselessCategories = ["Svago", "Altro"]
    const uselessSpent = transactions
        .filter(t => t.type === 'expense' && uselessCategories.includes(t.category))
        .reduce((acc, t) => acc + Math.abs(parseFloat(t.amount.replace(/[^0-9.-]+/g, ""))), 0)

    const uselessSpendPercent = totalSpent > 0 ? Math.round((uselessSpent / totalSpent) * 100) : 0

    // Calculate Monthly Expenses (Last 6 months)
    const monthlyExpenses = []
    const today = new Date()
    const monthNames = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]

    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthIndex = d.getMonth()
        const year = d.getFullYear()
        const monthName = monthNames[monthIndex]

        const total = transactions
            .filter(t => {
                if (t.type !== 'expense') return false
                const tDate = new Date(t.timestamp)
                return tDate.getMonth() === monthIndex && tDate.getFullYear() === year
            })
            .reduce((acc, t) => {
                const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g, ""))
                return acc + Math.abs(amount)
            }, 0)

        monthlyExpenses.push({ name: monthName, total })
    }

    return {
        totalSpent,
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
