"use client"

import { useMemo } from "react"
import { useTransactions } from "@/features/transactions/api/use-transactions"

export interface TrendDataItem {
    month: string
    income: number
    expenses: number
    savingsRate: number
    savingsRateLabel: string
}

export function useTrendData() {
    const { data: transactions = [], isLoading } = useTransactions()

    const trendData = useMemo(() => {
        if (isLoading || !transactions.length) return []

        const now = new Date()
        const months: TrendDataItem[] = []

        // Calculate last 12 months including current
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const year = d.getFullYear()
            const month = d.getMonth() // 0-indexed

            const label = new Intl.DateTimeFormat("it-IT", { month: "short" }).format(d)
            const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)

            // Filter transactions for this month
            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.timestamp)
                return tDate.getFullYear() === year && tDate.getMonth() === month
            })

            const income = monthTransactions
                .filter(t => t.type === "income")
                .reduce((sum, t) => sum + (t.amountCents || 0) / 100, 0)

            const expenses = monthTransactions
                .filter(t => t.type === "expense")
                .reduce((sum, t) => sum + (t.amountCents || 0) / 100, 0)

            const savingsRes = income - expenses
            const savingsRate = income > 0 ? (savingsRes / income) * 100 : 0

            months.push({
                month: capitalizedLabel,
                income,
                expenses,
                savingsRate,
                savingsRateLabel: `${savingsRate.toFixed(1)}%`
            })
        }

        return months
    }, [transactions, isLoading])

    return { data: trendData, isLoading }
}
