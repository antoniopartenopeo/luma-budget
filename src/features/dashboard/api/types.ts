import type { CardNetwork, CardParseConfidence, WalletProvider } from "@/domain/transactions"

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

export type CardUsageStatus = "active" | "stale"

export interface DashboardCardUsage {
    cardId: string
    last4: string
    network: CardNetwork
    walletProvider: WalletProvider
    firstSeen: string
    lastSeen: string
    status: CardUsageStatus
    confidence: CardParseConfidence
}

export interface DashboardSummary {
    allTimeIncomeCents: number
    allTimeExpensesCents: number
    netBalanceAllTimeCents: number
    totalSpentCents: number
    totalIncomeCents: number
    totalExpensesCents: number
    netBalanceCents: number
    allTimeIncome: number
    allTimeExpenses: number
    netBalanceAllTime: number
    totalSpent: number
    totalIncome: number
    totalExpenses: number
    netBalance: number
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
    cardsUsed: DashboardCardUsage[]
}
