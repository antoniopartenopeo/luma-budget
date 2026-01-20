// Insight Generator Functions
// ===========================
// Pure functions that generate Insight objects based on transaction data

import { formatCents } from "@/domain/money"
import { calculateGrowthPct, calculateSharePct, sumExpensesInCents } from "@/domain/money"
import { INSIGHT_CONFIG } from "./constants"
import {
    Insight,
    InsightSeverity,
    BudgetRiskInput,
    CategorySpikeInput,
    TopDriversInput,
    InsightDriver,
    InsightThresholds,
} from "./types"
import {
    filterTransactionsByMonth,

    getExpenseTotalsByCategoryCents,
    getPreviousMonths,
    getDaysElapsedInMonth,
    getDaysInMonth,
    buildTransactionsUrl,
    formatPeriodLabel,
} from "./utils"

/**
 * Build Budget Risk Insight
 * 
 * Calculates projected month-end spending based on burn rate.
 * Returns insight if projected spending exceeds budget.
 */
export function buildBudgetRiskInsight(
    input: BudgetRiskInput,
    thresholds: InsightThresholds
): Insight | null {
    const { transactions, budgetCents, period, currentDate } = input

    // No insight if no budget set
    if (!budgetCents || budgetCents <= 0) return null

    const monthTransactions = filterTransactionsByMonth(transactions, period)
    const spentCents = sumExpensesInCents(monthTransactions)

    const daysElapsed = getDaysElapsedInMonth(period, currentDate)
    const daysInMonth = getDaysInMonth(period)

    // Can't project if no days elapsed yet
    if (daysElapsed <= 0) return null

    // Calculate projected spending
    const burnRatePerDay = spentCents / daysElapsed
    const projectedCents = Math.round(burnRatePerDay * daysInMonth)

    const deltaCents = projectedCents - budgetCents
    const deltaPct = calculateSharePct(deltaCents, budgetCents)

    // No insight if below medium threshold for triggering
    if (deltaPct < thresholds.budgetMediumPct) return null

    // Determine severity
    let severity: InsightSeverity = "low"
    if (deltaPct > thresholds.budgetHighPct) {
        severity = "high"
    } else if (deltaPct > thresholds.budgetMediumPct) {
        severity = "medium"
    }

    const periodLabel = formatPeriodLabel(period)

    return {
        id: `budget-risk-${period}`,
        kind: "budget-risk",
        severity,
        title: "Budget a rischio",
        summary: `A questo ritmo, spenderai ${formatCents(projectedCents)} entro fine ${periodLabel}, superando il budget di ${formatCents(deltaCents)} (+${deltaPct}%).`,
        metrics: {
            currentCents: spentCents,
            baselineCents: budgetCents,
            projectedCents,
            deltaCents,
            deltaPct,
        },
        actions: [
            {
                label: "Vedi transazioni",
                href: buildTransactionsUrl({ period }),
            },
        ],
    }
}

/**
 * Build Category Spike Insights
 * 
 * Compares current month spending per category vs 3-month average.
 * Returns insights for categories exceeding thresholds.
 */
export function buildCategorySpikeInsights(
    input: CategorySpikeInput,
    thresholds: InsightThresholds
): Insight[] {
    const { transactions, categoriesMap, currentPeriod } = input

    // Get current month totals
    const currentTransactions = filterTransactionsByMonth(transactions, currentPeriod)
    const currentTotals = getExpenseTotalsByCategoryCents(currentTransactions)

    // Get previous 3 months for baseline
    const previousPeriods = getPreviousMonths(currentPeriod, 3)

    // Calculate 3-month average per category
    const baselineAverages = new Map<string, number>()

    for (const prevPeriod of previousPeriods) {
        const prevTransactions = filterTransactionsByMonth(transactions, prevPeriod)
        const prevTotals = getExpenseTotalsByCategoryCents(prevTransactions)

        for (const [catId, amount] of prevTotals) {
            const current = baselineAverages.get(catId) || 0
            baselineAverages.set(catId, current + amount)
        }
    }

    // Convert sums to averages
    for (const [catId, total] of baselineAverages) {
        baselineAverages.set(catId, Math.round(total / 3))
    }

    // Find spikes
    const spikes: Array<{
        categoryId: string
        label: string
        currentCents: number
        baselineCents: number
        deltaCents: number
        deltaPct: number
    }> = []

    for (const [categoryId, currentCents] of currentTotals) {
        const baselineCents = baselineAverages.get(categoryId) || 0
        const deltaCents = currentCents - baselineCents

        // Skip if below absolute threshold
        if (deltaCents < thresholds.spikeMinDeltaCents) continue

        // Skip if below percentage threshold (avoid division by zero)
        const deltaPct = calculateGrowthPct(currentCents, baselineCents)
        if (deltaPct < thresholds.spikeMinDeltaPct) continue

        const category = categoriesMap.get(categoryId)
        const label = category?.label || categoryId

        spikes.push({
            categoryId,
            label,
            currentCents,
            baselineCents,
            deltaCents,
            deltaPct,
        })
    }

    // Sort by delta (highest first) and take top N
    spikes.sort((a, b) => b.deltaCents - a.deltaCents)
    const topSpikes = spikes.slice(0, INSIGHT_CONFIG.SPIKE_TOP_CATEGORIES)

    // Generate insights
    return topSpikes.map((spike) => {
        const severity: InsightSeverity =
            spike.deltaPct > 100 ? "high" :
                spike.deltaPct > 50 ? "medium" : "low"

        return {
            id: `category-spike-${currentPeriod}-${spike.categoryId}`,
            kind: "category-spike" as const,
            severity,
            title: `Spike in ${spike.label}`,
            summary: `Hai speso ${formatCents(spike.currentCents)} in ${spike.label}, +${formatCents(spike.deltaCents)} (+${spike.deltaPct}%) rispetto alla media degli ultimi 3 mesi.`,
            metrics: {
                currentCents: spike.currentCents,
                baselineCents: spike.baselineCents,
                deltaCents: spike.deltaCents,
                deltaPct: spike.deltaPct,
            },
            drivers: [{
                type: "category" as const,
                id: spike.categoryId,
                label: spike.label,
                amountCents: spike.currentCents,
                deltaCents: spike.deltaCents,
            }],
            actions: [
                {
                    label: "Vedi transazioni",
                    href: buildTransactionsUrl({ period: currentPeriod, categoryId: spike.categoryId }),
                },
            ],
        }
    })
}

/**
 * Build Top Drivers Insight
 * 
 * Identifies the top transactions by amount in the current month
 * that contribute most to spending.
 */
export function buildTopDriversInsight(
    input: TopDriversInput,
    thresholds: InsightThresholds
): Insight | null {
    const { transactions, currentPeriod } = input

    // Get current month transactions
    const currentTransactions = filterTransactionsByMonth(transactions, currentPeriod)
        .filter(t => t.type === "expense")

    if (currentTransactions.length === 0) return null

    // Get previous month for comparison
    const previousPeriods = getPreviousMonths(currentPeriod, 1)
    const prevPeriod = previousPeriods[0]
    const prevTransactions = filterTransactionsByMonth(transactions, prevPeriod)

    const currentTotalCents = sumExpensesInCents(currentTransactions)
    const prevTotalCents = sumExpensesInCents(prevTransactions)

    // Calculate month-over-month delta
    const deltaCents = currentTotalCents - prevTotalCents

    // Noise gate check based on thresholds
    if (deltaCents < thresholds.topDriversMinDeltaCents) {
        return null
    }

    // Sort by amount and take top N
    const sortedTransactions = [...currentTransactions]
        .sort((a, b) => Math.abs(b.amountCents) - Math.abs(a.amountCents))
        .slice(0, INSIGHT_CONFIG.TOP_DRIVERS_COUNT)

    const drivers: InsightDriver[] = sortedTransactions.map(t => {
        return {
            type: "transaction" as const,
            id: t.id,
            label: t.description,
            amountCents: Math.abs(t.amountCents),
        }
    })

    const periodLabel = formatPeriodLabel(currentPeriod)
    const deltaText = deltaCents > 0
        ? `+${formatCents(deltaCents)} rispetto al mese scorso`
        : deltaCents < 0
            ? `${formatCents(deltaCents)} rispetto al mese scorso`
            : "uguale al mese scorso"

    return {
        id: `top-drivers-${currentPeriod}`,
        kind: "top-drivers",
        severity: deltaCents > 0 ? "medium" : "low",
        title: "Top spese del mese",
        summary: `Le tue 5 transazioni più rilevanti di ${periodLabel} (${deltaText}).`,
        metrics: {
            currentCents: currentTotalCents,
            baselineCents: prevTotalCents,
            deltaCents,
            deltaPct: calculateGrowthPct(currentTotalCents, prevTotalCents),
        },
        drivers,
        actions: [
            {
                label: "Vedi tutte ordinate per importo",
                href: buildTransactionsUrl({ period: currentPeriod, sortByAmount: true }),
            },
        ],
    }
}
