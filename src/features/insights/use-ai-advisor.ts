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
                    const amount = parseInt(amountCents) / 100

                    // Noise Gate: Ignore subscriptions under €5 to avoid coffee/snacks
                    if (Math.abs(amount) >= 5) {
                        detectedSubscriptions.push({
                            id: key,
                            description: desc.charAt(0).toUpperCase() + desc.slice(1),
                            amount: amount,
                            frequency: "monthly"
                        })
                    }
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
        const avgExpensesCents = monthlyStats.reduce((s, m) => s + m.expenses, 0) / monthsWithData
        const avgIncomeCents = monthlyStats.reduce((s, m) => s + m.income, 0) / monthsWithData

        const predictedSavings = avgIncome - avgExpenses

        const forecast: AIForecast = {
            predictedIncome: avgIncome,
            predictedExpenses: avgExpenses,
            predictedSavings,
            confidence: monthsWithData >= 3 ? "high" : "medium"
        }

        // 3. Smart Tips
        const tips = []
        const formatMoney = (amount: number) => {
            return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount)
        }

        if (forecast.predictedSavings < 0) {
            tips.push(`Attenzione: le proiezioni indicano un deficit di ${formatMoney(Math.abs(predictedSavings))}. Considera di tagliare le spese non essenziali.`)
        } else if (forecast.predictedSavings > 100) {
            const savingsRate = avgIncome > 0 ? (forecast.predictedSavings / avgIncome) * 100 : 0
            tips.push(`Ottimo lavoro! Surplus stimato di ${formatMoney(forecast.predictedSavings)} (${savingsRate.toFixed(0)}% delle entrate). Potresti investirlo nel fondo emergenza.`)
        }

        if (detectedSubscriptions.length > 0) {
            const totalYearly = detectedSubscriptions.reduce((s, sub) => s + sub.amount, 0) * 12
            if (totalYearly > 500) {
                tips.push(`Hai ${detectedSubscriptions.length} abbonamenti attivi (>€5) che pesano circa ${formatMoney(totalYearly)}/anno. Una revisione potrebbe farti risparmiare.`)
            }
        }

        return {
            forecast,
            subscriptions: detectedSubscriptions,
            tips,
            isLoading: false
        }
    }, [transactions, isLoading])
}
