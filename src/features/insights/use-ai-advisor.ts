"use client"

import { useMemo } from "react"
import { useTransactions } from "@/features/transactions/api/use-transactions"

export interface AISubscription {
    id: string
    description: string
    amount: number
    frequency: "monthly" | "weekly"
}

export interface AIForecast {
    predictedIncome: number
    predictedExpenses: number
    predictedSavings: number
    confidence: "high" | "medium" | "low"
}

export interface AIAdvisorResult {
    forecast: AIForecast | null
    subscriptions: AISubscription[]
    tips: string[]
    isLoading: boolean
}

export function useAIAdvisor() {
    const { data: transactions = [], isLoading } = useTransactions()

    return useMemo((): AIAdvisorResult => {
        if (isLoading || transactions.length < 2) {
            return { forecast: null, subscriptions: [], tips: [], isLoading }
        }

        const expenses = transactions.filter(t => t.type === "expense")

        // 1. Subscription Detection Logic
        // group by description and amount (cents)
        const patternMap = new Map<string, number[]>()
        expenses.forEach(t => {
            const key = `${t.description.toLowerCase()}_${Math.abs(t.amountCents)}`
            const dates = patternMap.get(key) || []
            dates.push(new Date(t.timestamp).getTime())
            patternMap.set(key, dates)
        })

        const detectedSubscriptions: AISubscription[] = []
        patternMap.forEach((dates, key) => {
            if (dates.length >= 2) {
                // Simple check: are they roughly 25-35 days apart?
                dates.sort((a, b) => a - b)
                let isMonthly = false
                for (let i = 1; i < dates.length; i++) {
                    const diffDays = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)
                    if (diffDays >= 25 && diffDays <= 35) isMonthly = true
                }

                if (isMonthly) {
                    const [desc, amountCents] = key.split("_")
                    detectedSubscriptions.push({
                        id: key,
                        description: desc.charAt(0).toUpperCase() + desc.slice(1),
                        amount: parseInt(amountCents) / 100,
                        frequency: "monthly"
                    })
                }
            }
        })

        // 2. Forecasting Logic (3-month moving average)
        const last3Months = []
        const now = new Date()
        for (let i = 1; i <= 3; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            last3Months.push({ y: d.getFullYear(), m: d.getMonth() })
        }

        const monthlyStats = last3Months.map(({ y, m }) => {
            const mTransactions = transactions.filter(t => {
                const td = new Date(t.timestamp)
                return td.getFullYear() === y && td.getMonth() === m
            })
            return {
                income: mTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amountCents, 0),
                expenses: mTransactions.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amountCents), 0),
                hasData: mTransactions.length > 0
            }
        })

        const monthsWithData = monthlyStats.filter(m => m.hasData).length || 1
        const avgIncome = monthlyStats.reduce((s, m) => s + m.income, 0) / monthsWithData / 100
        const avgExpenses = monthlyStats.reduce((s, m) => s + m.expenses, 0) / monthsWithData / 100

        const forecast: AIForecast = {
            predictedIncome: avgIncome,
            predictedExpenses: avgExpenses,
            predictedSavings: avgIncome - avgExpenses,
            confidence: monthsWithData >= 3 ? "high" : "medium"
        }

        // 3. Smart Tips
        const tips = []
        if (forecast.predictedSavings < 0) {
            tips.push("Attenzione: le tue proiezioni indicano uscite superiori alle entrate. Considera di tagliare le spese non essenziali.")
        } else if (forecast.predictedSavings > 500) {
            tips.push("Ottimo lavoro! Avrai un surplus stimato di oltre €500. Potresti considerare di investire una parte nel tuo fondo di emergenza.")
        }

        if (detectedSubscriptions.length > 5) {
            tips.push(`Hai ${detectedSubscriptions.length} abbonamenti attivi. Una revisione potrebbe farti risparmiare oltre €${(detectedSubscriptions.reduce((s, sub) => s + sub.amount, 0) * 12).toFixed(0)} all'anno.`)
        }

        return {
            forecast,
            subscriptions: detectedSubscriptions,
            tips,
            isLoading: false
        }
    }, [transactions, isLoading])
}
