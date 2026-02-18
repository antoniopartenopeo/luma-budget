import { Transaction } from "@/domain/transactions"
import { Category } from "@/domain/categories"
import { calculateDateRange, filterByRange } from "@/lib/date-ranges"

export interface BaselineMetrics {
    averageMonthlyIncome: number
    averageMonthlyExpenses: number
    averageEssentialExpenses: number
    averageSuperfluousExpenses: number
    averageComfortExpenses: number
    expensesStdDev: number
    freeCashFlowStdDev: number
    monthsAnalyzed: number
    activeMonths: number
    activityCoverageRatio: number
}

/**
 * Validates if the date string is in YYYY-MM format
 */


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
    // 1. Determine canonical date range using shared governance utilities.
    const previousMonthDate = new Date(now)
    previousMonthDate.setDate(0)
    const pivotPeriod = `${previousMonthDate.getFullYear()}-${(previousMonthDate.getMonth() + 1).toString().padStart(2, "0")}`
    const { startDate, endDate } = calculateDateRange(pivotPeriod, periodMonths)
    const periodTransactions = filterByRange(transactions, startDate, endDate)

    // 2. Group by month keys (YYYY-MM) for exact period window.
    const monthlyStats: Record<string, {
        income: number;
        expenses: number;
        essential: number;
        superfluous: number;
        comfort: number;
    }> = {}

    // Initialize exactly 'periodMonths' keys, counting backward from pivot.
    const pivotDate = new Date(now)
    pivotDate.setDate(0)
    for (let i = 0; i < periodMonths; i++) {
        const d = new Date(pivotDate.getFullYear(), pivotDate.getMonth() - i, 1)
        const mStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
        monthlyStats[mStr] = { income: 0, expenses: 0, essential: 0, superfluous: 0, comfort: 0 }
    }

    // Map Categories for fast lookup
    const catMap = new Map(categories.map(c => [c.id, c]))

    // 3. Aggregate only transactions in canonical range.
    periodTransactions.forEach(t => {
        const tDate = new Date(t.timestamp)
        const mStr = `${tDate.getFullYear()}-${(tDate.getMonth() + 1).toString().padStart(2, "0")}`
        if (!monthlyStats[mStr]) return

        const amount = Math.abs(t.amountCents)

        if (t.type === "income") {
            monthlyStats[mStr].income += amount
        } else if (t.type === "expense") {
            monthlyStats[mStr].expenses += amount

            const cat = catMap.get(t.categoryId || "")
            if (cat) {
                if (cat.spendingNature === "essential") {
                    monthlyStats[mStr].essential += amount
                } else if (cat.spendingNature === "superfluous") {
                    monthlyStats[mStr].superfluous += amount
                } else if (cat.spendingNature === "comfort") {
                    monthlyStats[mStr].comfort += amount
                }
            }
        }
    })

    // 4. Calculate Averages & StdDev
    const months = Object.values(monthlyStats)
    const count = months.length

    // Monthly averages are normalized by requested period length,
    // keeping empty months visible in the baseline/coverage signals.
    const divisor = periodMonths

    const totalIncome = months.reduce((sum, m) => sum + m.income, 0)
    const totalExpenses = months.reduce((sum, m) => sum + m.expenses, 0)
    const totalEssential = months.reduce((sum, m) => sum + m.essential, 0)
    const totalSuperfluous = months.reduce((sum, m) => sum + m.superfluous, 0)
    const totalComfort = months.reduce((sum, m) => sum + m.comfort, 0)

    const avgIncome = Math.round(totalIncome / divisor)
    const avgExpenses = Math.round(totalExpenses / divisor)
    const avgEssential = Math.round(totalEssential / divisor)
    const avgSuperfluous = Math.round(totalSuperfluous / divisor)
    const avgComfort = Math.round(totalComfort / divisor)

    // StdDev of Expenses
    const squaredDiffs = months.map(m => Math.pow(m.expenses - avgExpenses, 2))
    const avgSquaredDiff = squaredDiffs.reduce((sum, sq) => sum + sq, 0) / divisor
    const stdDev = Math.round(Math.sqrt(avgSquaredDiff))

    // StdDev of Free Cash Flow (Income - Expenses): more robust variability signal for quota projection.
    const freeCashFlows = months.map(m => m.income - m.expenses)
    const avgFreeCashFlow = Math.round(freeCashFlows.reduce((sum, value) => sum + value, 0) / divisor)
    const freeCashFlowSquaredDiffs = freeCashFlows.map(value => Math.pow(value - avgFreeCashFlow, 2))
    const freeCashFlowAvgSquaredDiff = freeCashFlowSquaredDiffs.reduce((sum, sq) => sum + sq, 0) / divisor
    const freeCashFlowStdDev = Math.round(Math.sqrt(freeCashFlowAvgSquaredDiff))

    const activeMonths = months.filter(m => m.income > 0 || m.expenses > 0).length
    const activityCoverageRatio = divisor > 0 ? activeMonths / divisor : 0

    return {
        averageMonthlyIncome: avgIncome,
        averageMonthlyExpenses: avgExpenses,
        averageEssentialExpenses: avgEssential,
        averageSuperfluousExpenses: avgSuperfluous,
        averageComfortExpenses: avgComfort,
        expensesStdDev: stdDev,
        freeCashFlowStdDev,
        monthsAnalyzed: count,
        activeMonths,
        activityCoverageRatio
    }
}
