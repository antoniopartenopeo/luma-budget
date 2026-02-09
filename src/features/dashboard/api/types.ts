export interface CategorySummary {
    name: string
    id: string
    valueCents: number
    value: number
    color: string
}

export type DashboardTimeFilter = {
    mode: "month" | "range"
    period: string // YYYY-MM
    months?: 3 | 6 | 12
}

export interface DashboardSummary {
    totalSpentCents: number
    totalIncomeCents: number
    totalExpensesCents: number
    netBalanceCents: number
    budgetTotalCents: number
    budgetRemainingCents: number
    totalSpent: number
    totalIncome: number
    totalExpenses: number
    netBalance: number
    budgetTotal: number
    budgetRemaining: number
    uselessSpendPercent: number | null
    categoriesSummary: CategorySummary[]
    usefulVsUseless: {
        useful: number
        useless: number
    }
    monthlyExpenses: {
        name: string
        totalCents: number
        total: number
    }[]
    activeRhythm?: {
        type: string
        label: string
        intensity: number
    }
}
