import { Transaction } from "@/domain/transactions"
import { Category } from "@/domain/categories"

export interface BaselineMetrics {
    averageMonthlyIncome: number
    averageMonthlyExpenses: number
    averageEssentialExpenses: number
    averageSuperfluousExpenses: number
    averageComfortExpenses: number
    expensesStdDev: number
    monthsAnalyzed: number
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
    // 1. Determine Date Range
    // Same logic as Simulator: Pivot is previous month
    const previousMonthDate = new Date(now)
    previousMonthDate.setDate(0)

    // const pivotYear = previousMonthDate.getFullYear()
    // const pivotMonth = previousMonthDate.getMonth() + 1


    // 2. Group by Month (YYYY-MM)
    const monthlyStats: Record<string, {
        income: number;
        expenses: number;
        essential: number;
        superfluous: number;
        comfort: number;
    }> = {}

    // Initialize exactly 'periodMonths' keys, counting backward from pivot (previous month)
    const pivotDate = new Date(now)
    pivotDate.setDate(0) // Last day of previous month

    // We want keys: Pivot, Pivot-1, ..., Pivot-(period-1)
    // We want keys: Pivot, Pivot-1, ..., Pivot-(period-1)
    for (let i = 0; i < periodMonths; i++) {
        // Use Day 1 to avoid "31st -> 1st next month" rollover issues
        const d = new Date(pivotDate.getFullYear(), pivotDate.getMonth() - i, 1)
        const mStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
        monthlyStats[mStr] = { income: 0, expenses: 0, essential: 0, superfluous: 0, comfort: 0 }
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
            if (cat) {
                if (cat.spendingNature === 'essential') {
                    monthlyStats[mStr].essential += amount
                } else if (cat.spendingNature === 'superfluous') {
                    monthlyStats[mStr].superfluous += amount
                } else if (cat.spendingNature === 'comfort') {
                    monthlyStats[mStr].comfort += amount
                }
            }
        }
    })

    // 4. Calculate Averages & StdDev
    const months = Object.values(monthlyStats)
    const count = months.length

    // Invariant: If we couldn't find data for the requested period (e.g. gaps), we still normalize by periodMonths?
    // Strictly speaking for "Average Monthly" over LAST N MONTHS, we should divide by N even if some have 0 data,
    // assuming the period was active. 
    // BUT the audit says "Pivot Rigido... garanzia dati completi".
    // If strict, we divide by periodMonths.
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


    return {
        averageMonthlyIncome: avgIncome,
        averageMonthlyExpenses: avgExpenses,
        averageEssentialExpenses: avgEssential,
        averageSuperfluousExpenses: avgSuperfluous,
        averageComfortExpenses: avgComfort,
        expensesStdDev: stdDev,
        monthsAnalyzed: count
    }
}
