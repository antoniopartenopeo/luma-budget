// Insights Data Types
// ===================

export type InsightKind = "budget-risk" | "category-spike" | "top-drivers"
export type InsightSeverity = "low" | "medium" | "high"

export interface InsightThresholds {
    spikeMinDeltaCents: number
    spikeMinDeltaPct: number
    budgetMediumPct: number
    budgetHighPct: number
    topDriversMinDeltaCents: number
}


export interface InsightMetrics {
    currentCents?: number
    baselineCents?: number
    deltaCents?: number
    deltaPct?: number
    projectedCents?: number
    budgetCents?: number
}

export interface InsightDriver {
    type: "category" | "transaction"
    id: string
    label: string
    amountCents: number
    deltaCents?: number
}

export interface InsightAction {
    label: string
    href: string
}

export interface Insight {
    id: string
    kind: InsightKind
    severity: InsightSeverity
    title: string
    summary: string
    metrics: InsightMetrics
    drivers?: InsightDriver[]
    actions: InsightAction[]
}

// Generator input types
export interface BudgetRiskInput {
    transactions: { amountCents: number; type: "income" | "expense"; timestamp: number }[]
    budgetCents: number | null
    period: string // YYYY-MM
    currentDate: Date
    currency?: string
    locale?: string
}

export interface CategorySpikeInput {
    transactions: { categoryId: string; amountCents: number; type: "income" | "expense"; timestamp: number }[]
    categoriesMap: Map<string, { label: string }>
    currentPeriod: string // YYYY-MM
    currency?: string
    locale?: string
}

export interface TopDriversInput {
    transactions: {
        id: string
        description: string
        categoryId: string
        amountCents: number
        type: "income" | "expense"
        timestamp: number
    }[]
    currentPeriod: string // YYYY-MM
    currency?: string
    locale?: string
}
