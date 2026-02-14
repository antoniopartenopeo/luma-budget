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
    hasTransactions: boolean
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
        const monthBuckets = new Map<string, { incomeCents: number; expensesCents: number; txCount: number }>()

        for (const tx of transactions) {
            const txDate = new Date(tx.timestamp)
            const key = `${txDate.getFullYear()}-${txDate.getMonth()}`
            const bucket = monthBuckets.get(key) ?? { incomeCents: 0, expensesCents: 0, txCount: 0 }
            const amountCents = Math.abs(tx.amountCents || 0)

            if (tx.type === "income") {
                bucket.incomeCents += amountCents
            } else if (tx.type === "expense") {
                bucket.expensesCents += amountCents
            }
            bucket.txCount += 1

            monthBuckets.set(key, bucket)
        }

        // Calculate last 12 months including current
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const year = d.getFullYear()
            const month = d.getMonth() // 0-indexed

            const label = new Intl.DateTimeFormat(locale, { month: "short" }).format(d)
            const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)
            const bucket = monthBuckets.get(`${year}-${month}`)
            const incomeCents = bucket?.incomeCents ?? 0
            const expensesCents = bucket?.expensesCents ?? 0
            const hasTransactions = (bucket?.txCount ?? 0) > 0

            const savingsResCents = incomeCents - expensesCents
            const savingsRate = incomeCents > 0 ? (savingsResCents / incomeCents) * 100 : 0

            months.push({
                month: capitalizedLabel,
                incomeCents,
                expensesCents,
                income: incomeCents / 100,
                expenses: expensesCents / 100,
                hasTransactions,
                savingsRate,
                savingsRateLabel: `${savingsRate.toFixed(1)}%`
            })
        }

        return months
    }, [transactions, isLoading, locale])

    return { data: trendData, isLoading }
}
