"use client"

import { useMemo } from "react"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { sumExpensesInCents, sumIncomeInCents } from "@/domain/money"
import { AdvisorFacts } from "@/domain/narration"

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
    facts: AdvisorFacts | null
    forecast: AIForecast | null
    subscriptions: AISubscription[]
    isLoading: boolean
}

export function useAIAdvisor() {
    const { data: transactions = [], isLoading } = useTransactions()

    return useMemo((): AIAdvisorResult => {
        if (isLoading || transactions.length < 2) {
            return { facts: null, forecast: null, subscriptions: [], isLoading }
        }

        const expenses = transactions.filter(t => t.type === "expense")

        // 1. Subscription Detection Logic
        const patternMap = new Map<string, number[]>()
        expenses.forEach(t => {
            const key = `${t.description.toLowerCase()}_${Math.abs(t.amountCents)}`
            const dates = patternMap.get(key) || []
            dates.push(new Date(t.timestamp).getTime())
            patternMap.set(key, dates)
        })

        const detectedSubscriptions: AISubscription[] = []
        let subscriptionTotalYearlyCents = 0

        patternMap.forEach((dates, key) => {
            if (dates.length >= 2) {
                dates.sort((a, b) => a - b)
                let isMonthly = false
                for (let i = 1; i < dates.length; i++) {
                    const diffDays = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)
                    if (diffDays >= 25 && diffDays <= 35) isMonthly = true
                }

                if (isMonthly) {
                    const [desc, amountCentsStr] = key.split("_")
                    const amountCents = parseInt(amountCentsStr)
                    const amount = amountCents / 100

                    // Noise Gate: Ignore subscriptions under €5
                    if (Math.abs(amount) >= 5) {
                        detectedSubscriptions.push({
                            id: key,
                            description: desc.charAt(0).toUpperCase() + desc.slice(1),
                            amount: amount,
                            frequency: "monthly"
                        })
                        subscriptionTotalYearlyCents += (Math.abs(amountCents) * 12)
                    }
                }
            }
        })

        // 2. Forecasting Logic
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
                income: sumIncomeInCents(mTransactions),
                expenses: sumExpensesInCents(mTransactions),
                hasData: mTransactions.length > 0
            }
        })

        const historicalMonthsWithData = monthlyStats.filter(m => m.hasData).length
        let facts: AdvisorFacts | null = null

        if (historicalMonthsWithData > 0) {
            const avgIncomeCents = Math.round(monthlyStats.reduce((s, m) => s + m.income, 0) / historicalMonthsWithData)
            const avgExpensesCents = Math.round(monthlyStats.reduce((s, m) => s + m.expenses, 0) / historicalMonthsWithData)
            const predictedSavingsCents = avgIncomeCents - avgExpensesCents

            facts = {
                predictedIncomeCents: avgIncomeCents,
                predictedExpensesCents: avgExpensesCents,
                deltaCents: predictedSavingsCents,
                historicalMonthsCount: historicalMonthsWithData,
                subscriptionCount: detectedSubscriptions.length,
                subscriptionTotalYearlyCents
            }
        } else {
            // Cold Start: Use current month
            const currentMonthTransactions = transactions.filter(t => {
                const td = new Date(t.timestamp)
                return td.getFullYear() === now.getFullYear() && td.getMonth() === now.getMonth()
            })

            if (currentMonthTransactions.length > 0) {
                const currentIncomeCents = sumIncomeInCents(currentMonthTransactions)
                const currentExpensesCents = sumExpensesInCents(currentMonthTransactions)

                facts = {
                    predictedIncomeCents: currentIncomeCents,
                    predictedExpensesCents: currentExpensesCents,
                    deltaCents: currentIncomeCents - currentExpensesCents,
                    historicalMonthsCount: 0,
                    subscriptionCount: detectedSubscriptions.length,
                    subscriptionTotalYearlyCents
                }
            }
        }

        // Map facts to legacy Forecast object for UI
        let forecast: AIForecast | null = null
        if (facts) {
            forecast = {
                predictedIncome: facts.predictedIncomeCents / 100,
                predictedExpenses: facts.predictedExpensesCents / 100,
                predictedSavings: facts.deltaCents / 100,
                confidence: facts.historicalMonthsCount >= 3 ? "high" : facts.historicalMonthsCount > 0 ? "medium" : "low"
            }
        }

        return {
            facts,
            forecast,
            subscriptions: detectedSubscriptions,
            isLoading: false
        }
    }, [transactions, isLoading])
}
