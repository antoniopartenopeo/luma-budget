import { useMemo, useState, useEffect, useRef } from "react"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { sumExpensesInCents } from "@/domain/money"
import { AdvisorFacts } from "@/domain/narration"
import { extractMerchantKey } from "@/features/import-csv/core/merchant/pipeline"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { useCategories } from "@/features/categories/api/use-categories"
import { evolveBrainFromHistory, initializeBrain, type BrainEvolutionResult } from "@/brain"
import { getCurrentPeriod, getDaysElapsedInMonth, getDaysInMonth, getPreviousMonths } from "@/lib/date-ranges"
import { filterTransactionsByMonth } from "./utils"

export interface AISubscription {
    id: string
    description: string
    amountCents: number
    amount: number
    frequency: "monthly"
}

export interface AIForecast {
    baseBalanceCents: number
    predictedRemainingCurrentMonthExpensesCents: number
    predictedTotalEstimatedBalanceCents: number
    primarySource: "brain" | "fallback"
    confidence: "high" | "medium" | "low"
}

export interface AIBrainSignal {
    isReady: boolean
    source: "brain" | "fallback"
    riskScore: number | null
    confidenceScore: number | null
}

export interface AIAdvisorResult {
    facts: AdvisorFacts | null
    forecast: AIForecast | null
    subscriptions: AISubscription[]
    brainSignal: AIBrainSignal
    isLoading: boolean
}

export interface UseAIAdvisorOptions {
    mode?: "active" | "readonly"
}

function computeBrainInputSignature(
    transactions: Array<{
        amountCents: number
        timestamp: number
        categoryId: string
        type: "income" | "expense"
        isSuperfluous?: boolean
    }>,
    categories: Array<{
        id: string
        spendingNature: "essential" | "comfort" | "superfluous"
    }>,
    period: string
): string {
    let h = 2166136261

    for (const tx of transactions) {
        h ^= tx.timestamp
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)

        h ^= tx.amountCents
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)

        h ^= tx.type === "income" ? 1 : 2
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)

        for (let i = 0; i < tx.categoryId.length; i++) {
            h ^= tx.categoryId.charCodeAt(i)
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
        }

        h ^= tx.isSuperfluous === true ? 19 : tx.isSuperfluous === false ? 23 : 29
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
    }

    for (const category of categories) {
        for (let i = 0; i < category.id.length; i++) {
            h ^= category.id.charCodeAt(i)
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
        }
        h ^= category.spendingNature === "essential" ? 11 : category.spendingNature === "comfort" ? 13 : 17
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
    }

    return `${period}:${transactions.length}:${categories.length}:${(h >>> 0).toString(16)}`
}

function estimateRemainingExpensesFromHistory(
    transactions: Array<{ timestamp: number; type: "income" | "expense"; amountCents: number }>,
    currentPeriod: string,
    now: Date = new Date()
): number | null {
    const dayOfMonth = now.getDate()
    const recentPeriods = getPreviousMonths(currentPeriod, 3)

    const remainingByPeriod: number[] = []

    for (const period of recentPeriods) {
        const monthExpenses = filterTransactionsByMonth(transactions, period).filter((transaction) => transaction.type === "expense")
        if (monthExpenses.length === 0) continue

        const totalExpensesCents = sumExpensesInCents(monthExpenses)
        const cutoffDay = Math.min(dayOfMonth, getDaysInMonth(period))
        const spentUntilCutoffCents = sumExpensesInCents(
            monthExpenses.filter((transaction) => new Date(transaction.timestamp).getDate() <= cutoffDay)
        )

        remainingByPeriod.push(Math.max(totalExpensesCents - spentUntilCutoffCents, 0))
    }

    if (remainingByPeriod.length === 0) return null
    if (remainingByPeriod.length >= 3) {
        return Math.round(
            remainingByPeriod[0] * 0.5
            + remainingByPeriod[1] * 0.3
            + remainingByPeriod[2] * 0.2
        )
    }

    const total = remainingByPeriod.reduce((sum, value) => sum + value, 0)
    return Math.round(total / remainingByPeriod.length)
}

function estimateRemainingExpensesRunRate(
    currentMonthExpensesCents: number,
    period: string,
    now: Date = new Date()
): number {
    if (currentMonthExpensesCents <= 0) return 0
    const daysElapsed = Math.max(1, getDaysElapsedInMonth(period, now))
    const daysInMonth = Math.max(daysElapsed, getDaysInMonth(period))
    const projectedTotalCents = Math.round((currentMonthExpensesCents / daysElapsed) * daysInMonth)
    return Math.max(projectedTotalCents - currentMonthExpensesCents, 0)
}

function isMonthlySubscriptionPattern(sortedDates: number[]): boolean {
    if (sortedDates.length < 2) return false
    const diffsInDays: number[] = []
    for (let i = 1; i < sortedDates.length; i++) {
        diffsInDays.push((sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24))
    }

    const monthlyMatches = diffsInDays.filter((diffDays) => diffDays >= 25 && diffDays <= 35).length
    const cadenceRatio = monthlyMatches / diffsInDays.length

    return monthlyMatches >= 1 && cadenceRatio >= 0.5
}

function isRecentlyActive(latestTimestamp: number, now: Date): boolean {
    const diffDays = (now.getTime() - latestTimestamp) / (1000 * 60 * 60 * 24)
    return diffDays <= 45
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

function createDefaultBrainSignal(): AIBrainSignal {
    return {
        isReady: false,
        source: "fallback",
        riskScore: null,
        confidenceScore: null
    }
}

export function useAIAdvisor(options: UseAIAdvisorOptions = {}) {
    const advisorMode = options.mode || "active"
    const isReadOnlyMode = advisorMode === "readonly"
    const currentPeriod = getCurrentPeriod()
    const { data: transactions = [], isLoading: isTransactionsLoading } = useTransactions()
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories({ includeArchived: true })
    const { data: dashboardSummary, isLoading: isDashboardLoading } = useDashboardSummary({
        mode: "month",
        period: currentPeriod,
    })

    const [brainEvolution, setBrainEvolution] = useState<BrainEvolutionResult | null>(null)
    const [brainEvolutionSignature, setBrainEvolutionSignature] = useState("")
    const lastBrainSignatureRef = useRef("")

    const brainInputSignature = useMemo(
        () => computeBrainInputSignature(transactions, categories, currentPeriod),
        [categories, currentPeriod, transactions]
    )

    useEffect(() => {
        if (isTransactionsLoading || isCategoriesLoading) return
        if (transactions.length < 2 || categories.length === 0) return

        if (lastBrainSignatureRef.current === brainInputSignature) return
        lastBrainSignatureRef.current = brainInputSignature

        const brainTransactions = transactions.map((tx) => ({
            amountCents: Math.abs(tx.amountCents || 0),
            type: tx.type,
            timestamp: tx.timestamp,
            categoryId: tx.categoryId,
            isSuperfluous: tx.isSuperfluous,
        }))
        const brainCategories = categories.map((category) => ({
            id: category.id,
            spendingNature: category.spendingNature,
        }))

        let cancelled = false
        if (!isReadOnlyMode) {
            initializeBrain()
        }

        void evolveBrainFromHistory(brainTransactions, brainCategories, {
            preferredPeriod: currentPeriod,
            allowTraining: !isReadOnlyMode
        })
            .then((result) => {
                if (!cancelled) {
                    setBrainEvolution(result)
                    setBrainEvolutionSignature(brainInputSignature)
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setBrainEvolution(null)
                    setBrainEvolutionSignature("")
                }
            })

        return () => {
            cancelled = true
        }
    }, [
        brainInputSignature,
        categories,
        currentPeriod,
        isReadOnlyMode,
        isCategoriesLoading,
        isTransactionsLoading,
        transactions,
    ])

    const computation = useMemo(() => {
        if (isTransactionsLoading || transactions.length < 2) {
            return {
                facts: null,
                forecast: null,
                subscriptions: [],
                brainSignal: createDefaultBrainSignal()
            }
        }

        const expenses = transactions.filter(t => t.type === "expense")
        const currentMonthTransactions = filterTransactionsByMonth(transactions, currentPeriod)
        const currentMonthExpensesCents = sumExpensesInCents(currentMonthTransactions)
        const historicalRemainingCurrentMonthExpensesCents = estimateRemainingExpensesFromHistory(
            transactions,
            currentPeriod
        )
        const runRateRemainingCurrentMonthExpensesCents = estimateRemainingExpensesRunRate(currentMonthExpensesCents, currentPeriod)
        const fallbackRemainingCurrentMonthExpensesCents = historicalRemainingCurrentMonthExpensesCents ?? runRateRemainingCurrentMonthExpensesCents
        const baseBalanceCents = dashboardSummary?.netBalanceCents ?? 0
        const brainResultIsCurrent = brainEvolutionSignature === brainInputSignature
        const brainNowcastReady = brainResultIsCurrent && brainEvolution?.currentMonthNowcastReady === true
        const predictedRemainingCurrentMonthExpensesCents = brainNowcastReady
            ? Math.max(0, brainEvolution?.predictedCurrentMonthRemainingExpensesCents ?? 0)
            : fallbackRemainingCurrentMonthExpensesCents
        const primarySource: AIForecast["primarySource"] = brainNowcastReady ? "brain" : "fallback"
        const predictedTotalEstimatedBalanceCents = baseBalanceCents - predictedRemainingCurrentMonthExpensesCents
        const brainPrediction = brainResultIsCurrent ? (brainEvolution?.prediction ?? null) : null
        const fallbackRiskScore = brainResultIsCurrent && brainEvolution
            ? clamp(
                (brainEvolution.predictedCurrentMonthRemainingExpensesCents || 0)
                / Math.max(brainEvolution.currentExpensesCents || 0, 1),
                0,
                1
            )
            : null
        const brainSignal: AIBrainSignal = {
            isReady: brainNowcastReady,
            source: brainNowcastReady ? "brain" : "fallback",
            riskScore: brainPrediction ? clamp(brainPrediction.riskScore, 0, 1) : fallbackRiskScore,
            confidenceScore: brainResultIsCurrent
                ? clamp(
                    brainPrediction?.confidence ?? (brainEvolution?.currentMonthNowcastConfidence ?? 0),
                    0,
                    1
                )
                : null
        }

        // 1. Subscription Detection Logic (merchant-centric, one active subscription per merchant)
        const patternMap = new Map<string, { dates: number[]; samples: Array<{ timestamp: number; amountCents: number }> }>()
        expenses.forEach(t => {
            const merchantKey = extractMerchantKey(t.description)
            const key = merchantKey
            const timestamp = new Date(t.timestamp).getTime()
            const record = patternMap.get(key) || { dates: [], samples: [] }
            record.dates.push(timestamp)
            record.samples.push({ timestamp, amountCents: Math.abs(t.amountCents) })
            patternMap.set(key, record)
        })

        const detectedSubscriptions: AISubscription[] = []
        let subscriptionTotalYearlyCents = 0
        const now = new Date()

        patternMap.forEach((record, merchantKey) => {
            if (merchantKey === "ALTRO" || merchantKey === "UNRESOLVED") return
            if (record.dates.length < 2) return

            const sortedDates = [...record.dates].sort((a, b) => a - b)
            const latestTimestamp = sortedDates[sortedDates.length - 1]
            if (!isRecentlyActive(latestTimestamp, now)) return
            if (!isMonthlySubscriptionPattern(sortedDates)) return

            const latestAmountCents =
                record.samples
                    .slice()
                    .sort((a, b) => b.timestamp - a.timestamp)[0]?.amountCents ?? 0
            const amount = latestAmountCents / 100

            // Noise Gate: Ignore subscriptions under €5
            if (Math.abs(amount) < 5) return

            detectedSubscriptions.push({
                id: merchantKey,
                description: merchantKey,
                amountCents: latestAmountCents,
                amount: amount,
                frequency: "monthly"
            })
            subscriptionTotalYearlyCents += (Math.abs(latestAmountCents) * 12)
        })

        detectedSubscriptions.sort((a, b) => {
            if (b.amount !== a.amount) return b.amount - a.amount
            return a.description.localeCompare(b.description)
        })

        // 2. Historical coverage signal (used only for confidence level)
        const last3Months = []
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
                hasData: mTransactions.length > 0
            }
        })

        const historicalMonthsWithData = monthlyStats.filter(m => m.hasData).length
        const hasCurrentMonthData = currentMonthTransactions.length > 0
        const hasAnyAdvisorSignal = historicalMonthsWithData > 0 || hasCurrentMonthData || baseBalanceCents !== 0

        const facts: AdvisorFacts | null = hasAnyAdvisorSignal ? {
            baseBalanceCents,
            predictedRemainingCurrentMonthExpensesCents,
            predictedTotalEstimatedBalanceCents,
            primarySource,
            historicalMonthsCount: historicalMonthsWithData,
            subscriptionCount: detectedSubscriptions.length,
            subscriptionTotalYearlyCents
        } : null

        // Map facts to Advisor forecast object for UI
        let forecast: AIForecast | null = null
        if (facts) {
            forecast = {
                baseBalanceCents,
                predictedRemainingCurrentMonthExpensesCents,
                predictedTotalEstimatedBalanceCents,
                primarySource,
                confidence: facts.historicalMonthsCount >= 3 ? "high" : facts.historicalMonthsCount > 0 ? "medium" : "low"
            }
        }

        return {
            facts,
            forecast,
            subscriptions: detectedSubscriptions,
            brainSignal
        }
    }, [
        brainEvolution,
        brainEvolutionSignature,
        brainInputSignature,
        currentPeriod,
        dashboardSummary?.netBalanceCents,
        isTransactionsLoading,
        transactions
    ])

    const isLoading = isTransactionsLoading || isCategoriesLoading || isDashboardLoading

    if (isLoading) {
        return {
            facts: null,
            forecast: null,
            subscriptions: [],
            brainSignal: createDefaultBrainSignal(),
            isLoading: true
        }
    }

    return {
        ...computation,
        isLoading: false
    }
}
