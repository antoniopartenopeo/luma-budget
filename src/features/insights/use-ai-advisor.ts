import { useMemo, useState, useEffect } from "react"
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
    const { data: transactions = [], isLoading: isDataLoading } = useTransactions()
    const [isArtificialLoading, setIsArtificialLoading] = useState(true)

    // Force "Thinking" time to allow user to appreciate the semantic animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsArtificialLoading(false)
        }, 2000) // 2s "Thinking" time per user request
        return () => clearTimeout(timer)
    }, []) // Run once on mount

    const computation = useMemo(() => {
        if (isDataLoading || transactions.length < 2) {
            return { facts: null, forecast: null, subscriptions: [] }
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

        // 2. Forecasting Logic (Weighted Moving Average)
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

        // Price Hike Detection (Subscription Analysis)
        const priceHikes: { name: string, diff: number, percent: number }[] = []
        detectedSubscriptions.forEach(sub => {
            // Heuristic: Check if the LATEST transaction for this sub is significantly higher (>5%) than the average of previous ones
            // We need raw transactions for this sub.
            const subKeyPart = sub.description.toLowerCase() // Simple match
            // Note: In a real app we would use exact ID matching or more robust correlation. 
            // Here we re-scan expenses for this description.
            const subTx = expenses.filter(t => t.description.toLowerCase().includes(subKeyPart)).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

            if (subTx.length >= 2) {
                const latestAmount = Math.abs(subTx[0].amountCents)
                const previousAmounts = subTx.slice(1).map(t => Math.abs(t.amountCents))
                const avgPrevious = previousAmounts.reduce((a, b) => a + b, 0) / previousAmounts.length

                if (latestAmount > avgPrevious * 1.05 && (latestAmount - avgPrevious) > 100) { // > 5% AND > €1.00
                    priceHikes.push({
                        name: sub.description,
                        diff: (latestAmount - avgPrevious),
                        percent: ((latestAmount - avgPrevious) / avgPrevious) * 100
                    })
                }
            }
        })

        if (historicalMonthsWithData > 0) {
            // WEIGHTED AVERAGE LOGIC
            // Weigh recent months more heavily: 
            // M-1 (Last Month): 50%
            // M-2: 30%
            // M-3: 20%
            // If missing data, fallback to simple average.

            let avgIncomeCents = 0
            let avgExpensesCents = 0

            if (historicalMonthsWithData === 3) {
                // Month 0 is M-1 (most recent in our reversed array construction? No, wait. 
                // last3Months construction: i=1 is M-1.
                // monthlyStats[0] corresponds to M-1.
                avgIncomeCents = Math.round(monthlyStats[0].income * 0.5 + monthlyStats[1].income * 0.3 + monthlyStats[2].income * 0.2)
                avgExpensesCents = Math.round(monthlyStats[0].expenses * 0.5 + monthlyStats[1].expenses * 0.3 + monthlyStats[2].expenses * 0.2)
            } else {
                // Simple Average fallback
                avgIncomeCents = Math.round(monthlyStats.reduce((s, m) => s + m.income, 0) / historicalMonthsWithData)
                avgExpensesCents = Math.round(monthlyStats.reduce((s, m) => s + m.expenses, 0) / historicalMonthsWithData)
            }

            const predictedSavingsCents = avgIncomeCents - avgExpensesCents

            facts = {
                predictedIncomeCents: avgIncomeCents,
                predictedExpensesCents: avgExpensesCents,
                deltaCents: predictedSavingsCents,
                historicalMonthsCount: historicalMonthsWithData,
                subscriptionCount: detectedSubscriptions.length,
                subscriptionTotalYearlyCents,
                // @ts-ignore - extending type implicitly for internal use if needed, or we rely on Orchestrator to recalculate
                priceHikesCount: priceHikes.length
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
            priceHikes
        }
    }, [transactions, isDataLoading])

    const isLoading = isDataLoading || isArtificialLoading

    if (isLoading) {
        return {
            facts: null,
            forecast: null,
            subscriptions: [],
            priceHikes: [],
            isLoading: true
        }
    }

    return {
        ...computation,
        isLoading: false
    }
}
