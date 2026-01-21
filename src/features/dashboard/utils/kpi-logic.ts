import { KpiTone } from "@/components/patterns/kpi-card"

/**
 * Calculates the percentage of a part relative to a total.
 */
export function calculatePercent(part: number, total: number): number | null {
    if (!total || total === 0) return null
    return Math.round((part / total) * 100)
}

/**
 * Determines the tone for the superfluous spending KPI.
 * Logic: positive if <= target, negative if > target, neutral if null.
 */
export function getSuperfluousTone(
    percent: number | null,
    target: number
): KpiTone {
    if (percent === null) return "neutral"
    return percent <= target ? "positive" : "negative"
}

/**
 * Determines the tone for the budget remaining KPI.
 * Logic: positive if >= 0, negative if < 0.
 */
export function getBudgetTone(
    remaining: number,
    hasBudget: boolean
): KpiTone {
    if (!hasBudget) return "neutral"
    return remaining >= 0 ? "positive" : "negative"
}

/**
 * Determines the tone for the net balance KPI.
 */
export function getBalanceTone(balance: number): KpiTone {
    if (balance > 0) return "positive"
    if (balance < 0) return "negative"
    return "neutral"
}
