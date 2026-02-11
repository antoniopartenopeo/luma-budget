"use client"

import { useMemo } from "react"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { useCurrency } from "@/features/settings/api/use-currency"

export interface TrendDataItem {
    month: string
    incomeCents: number
    expensesCents: number
    income: number
    expenses: number
    savingsRate: number
    savingsRateLabel: string
}

export function useTrendData() {
    const { data: transactions = [], isLoading } = useTransactions()
    const { locale } = useCurrency()

    const trendData = useMemo(() => {
        if (isLoading || !transactions.length) return []

        const now = new Date()
        const months: TrendDataItem[] = []

        // Calculate last 12 months including current
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const year = d.getFullYear()
            const month = d.getMonth() // 0-indexed

            const label = new Intl.DateTimeFormat(locale, { month: "short" }).format(d)
            const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)

            // Filter transactions for this month
            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.timestamp)
                return tDate.getFullYear() === year && tDate.getMonth() === month
            })

            const incomeCents = monthTransactions
                .filter(t => t.type === "income")
                .reduce((sum, t) => sum + (t.amountCents || 0), 0)

            const expensesCents = monthTransactions
                .filter(t => t.type === "expense")
                .reduce((sum, t) => sum + (t.amountCents || 0), 0)

            const savingsResCents = incomeCents - expensesCents
            const savingsRate = incomeCents > 0 ? (savingsResCents / incomeCents) * 100 : 0

            months.push({
                month: capitalizedLabel,
                incomeCents,
                expensesCents,
                income: incomeCents / 100,
                expenses: expensesCents / 100,
                savingsRate,
                savingsRateLabel: `${savingsRate.toFixed(1)}%`
            })
        }

        return months
    }, [transactions, isLoading, locale])

    return { data: trendData, isLoading }
}
