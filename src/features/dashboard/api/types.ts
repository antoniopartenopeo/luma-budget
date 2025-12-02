export interface CategorySummary {
    name: string
    value: number
    color: string
}

export interface DashboardSummary {
    totalSpent: number
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
