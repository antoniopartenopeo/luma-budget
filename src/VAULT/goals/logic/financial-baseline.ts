
import { Transaction } from "@/features/transactions/api/types"
import { calculateDateRange } from "@/lib/date-ranges"
import { SpendingNature } from "@/features/categories/config"
import { Category } from "@/features/categories/config"

export interface BaselineMetrics {
    averageMonthlyIncome: number
    averageMonthlyExpenses: number
    averageEssentialExpenses: number
    expensesStdDev: number
    monthsAnalyzed: number
}

/**
 * Validates if the date string is in YYYY-MM format
 */
function isValidDateStr(dateStr: string): boolean {
    return /^\d{4}-\d{2}$/.test(dateStr);
}

/**
 * Calculates financial baseline metrics including variability (Standard Deviation).
 * Needs to aggregate by month first to compute stdDev.
 */
export function calculateBaselineMetrics(
    transactions: Transaction[],
    categories: Category[],
    periodMonths: 3 | 6 | 12,
    now: Date = new Date()
): BaselineMetrics {
    // 1. Determine Date Range
    // Same logic as Simulator: Pivot is previous month
    const previousMonthDate = new Date(now)
    previousMonthDate.setDate(0)

    const pivotYear = previousMonthDate.getFullYear()
    const pivotMonth = previousMonthDate.getMonth() + 1
    const pivotStr = `${pivotYear}-${pivotMonth.toString().padStart(2, '0')}`

    const { startDate, endDate } = calculateDateRange(pivotStr, periodMonths)

    // 2. Group by Month (YYYY-MM)
    const monthlyStats: Record<string, { income: number; expenses: number; essential: number }> = {}

    // Initialize exactly 'periodMonths' keys, counting backward from pivot (previous month)
    const pivotDate = new Date(now)
    pivotDate.setDate(0) // Last day of previous month

    // We want keys: Pivot, Pivot-1, ..., Pivot-(period-1)
    // We want keys: Pivot, Pivot-1, ..., Pivot-(period-1)
    for (let i = 0; i < periodMonths; i++) {
        // Use Day 1 to avoid "31st -> 1st next month" rollover issues
        const d = new Date(pivotDate.getFullYear(), pivotDate.getMonth() - i, 1)
        const mStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
        monthlyStats[mStr] = { income: 0, expenses: 0, essential: 0 }
    }

    // Map Categories for fast lookup
    const catMap = new Map(categories.map(c => [c.id, c]))

    // 3. Aggregate Scans
    transactions.forEach(t => {
        const tDate = new Date(t.timestamp)
        // We rely on monthlyStats keys as the source of truth for the period.
        // If the transaction's month is not in our initialized map, it's outside the analysis period.


        const mStr = `${tDate.getFullYear()}-${(tDate.getMonth() + 1).toString().padStart(2, '0')}`

        // Skip if month outside (shouldn't happen with logic above but safe)
        if (!monthlyStats[mStr]) return;

        const amount = Math.abs(t.amountCents)

        if (t.type === 'income') {
            monthlyStats[mStr].income += amount
        } else if (t.type === 'expense') {
            monthlyStats[mStr].expenses += amount

            const cat = catMap.get(t.categoryId || "")
            if (cat && cat.spendingNature === 'essential') {
                monthlyStats[mStr].essential += amount
            }
        }
    })

    // 4. Calculate Averages & StdDev
    const months = Object.values(monthlyStats)
    const count = months.length || periodMonths // Should match periodMonths unless date logic allows gaps
    if (count === 0) {
        return { averageMonthlyIncome: 0, averageMonthlyExpenses: 0, averageEssentialExpenses: 0, expensesStdDev: 0, monthsAnalyzed: 0 }
    }

    const totalIncome = months.reduce((sum, m) => sum + m.income, 0)
    const totalExpenses = months.reduce((sum, m) => sum + m.expenses, 0)
    const totalEssential = months.reduce((sum, m) => sum + m.essential, 0)

    const avgIncome = Math.round(totalIncome / count)
    const avgExpenses = Math.round(totalExpenses / count)
    const avgEssential = Math.round(totalEssential / count)

    // StdDev of Expenses
    const squaredDiffs = months.map(m => Math.pow(m.expenses - avgExpenses, 2))
    const avgSquaredDiff = squaredDiffs.reduce((sum, sq) => sum + sq, 0) / count
    const stdDev = Math.round(Math.sqrt(avgSquaredDiff))



    return {
        averageMonthlyIncome: avgIncome,
        averageMonthlyExpenses: avgExpenses,
        averageEssentialExpenses: avgEssential,
        expensesStdDev: stdDev,
        monthsAnalyzed: count
    }
}
