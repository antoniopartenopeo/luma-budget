export interface CategorySummary {
    name: string
    id: string
    value: number
    color: string
}

export type DashboardTimeFilter = {
    mode: "month" | "range"
    period: string // YYYY-MM
    months?: 3 | 6 | 12
}

export interface DashboardSummary {
    totalSpent: number
    totalIncome: number
    totalExpenses: number
    netBalance: number
    budgetTotal: number
    budgetRemaining: number
    uselessSpendPercent: number
    categoriesSummary: CategorySummary[]
    usefulVsUseless: {
        useful: number
        useless: number
    }
    monthlyExpenses: {
        name: string
        total: number
    }[]
}
