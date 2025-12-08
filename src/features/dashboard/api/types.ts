export interface CategorySummary {
    name: string
    id: string
    value: number
    color: string
}

export interface DashboardSummary {
    totalSpent: number
    totalIncome: number
    totalExpenses: number
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
