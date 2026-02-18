import { useMemo, useState, useEffect, useRef } from "react"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { sumExpensesInCents } from "@/domain/money"
import { AdvisorFacts } from "@/domain/narration"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { useCategories } from "@/features/categories/api/use-categories"
import {
    BRAIN_MATURITY_SAMPLE_TARGET,
    evolveBrainFromHistory,
    initializeBrain,
    type BrainEvolutionResult
} from "@/brain"
import { getCurrentPeriod, getDaysElapsedInMonth, getDaysInMonth, getPreviousMonths } from "@/lib/date-ranges"
import { filterTransactionsByMonth } from "./utils"
import { detectActiveSubscriptions, type DetectedSubscription } from "./subscription-detection"

export type AISubscription = DetectedSubscription

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

const MIN_BRAIN_NOWCAST_CONFIDENCE = 0.72
const MIN_OUTLIER_BLEND_CONFIDENCE = 0.88
const HIGH_CONFIDENCE_BRAIN_OVERSHOOT_RATIO = 2.4
const MID_CONFIDENCE_BRAIN_OVERSHOOT_RATIO = 2.1
const LOW_CONFIDENCE_BRAIN_OVERSHOOT_RATIO = 1.8
const MIN_BRAIN_OVERSHOOT_DELTA_CENTS = 30000
const OUTLIER_DAMPING_STRENGTH = 1.25
const HIGH_TRUST_SPIKE_CONFIDENCE = 0.9
const HIGH_TRUST_SPIKE_MATURITY_SCORE = 0.8
const HIGH_TRUST_SPIKE_MIN_BLEND_WEIGHT = 0.72
const PRIMARY_BRAIN_BLEND_WEIGHT_THRESHOLD = 0.6

function resolveAllowedBrainOvershootRatio(confidenceScore: number): number {
    if (confidenceScore >= 0.85) return HIGH_CONFIDENCE_BRAIN_OVERSHOOT_RATIO
    if (confidenceScore >= 0.75) return MID_CONFIDENCE_BRAIN_OVERSHOOT_RATIO
    return LOW_CONFIDENCE_BRAIN_OVERSHOOT_RATIO
}

function resolveOutlierBrainBlendWeight(params: {
    confidenceScore: number
    maturityScore: number
    overshootRatio: number
    allowedOvershootRatio: number
}): number {
    const { confidenceScore, maturityScore, overshootRatio, allowedOvershootRatio } = params
    if (confidenceScore < MIN_OUTLIER_BLEND_CONFIDENCE) return 0

    const confidenceFactor = clamp(
        (confidenceScore - MIN_OUTLIER_BLEND_CONFIDENCE) / (1 - MIN_OUTLIER_BLEND_CONFIDENCE),
        0,
        1
    )
    const maturityFactor = 0.45 + (0.55 * maturityScore)
    const overshootExcess = Math.max(0, overshootRatio - allowedOvershootRatio)
    const outlierDamping = 1 / (1 + (overshootExcess * OUTLIER_DAMPING_STRENGTH))

    let blendWeight = confidenceFactor * maturityFactor * outlierDamping
    if (confidenceScore >= HIGH_TRUST_SPIKE_CONFIDENCE && maturityScore >= HIGH_TRUST_SPIKE_MATURITY_SCORE) {
        blendWeight = Math.max(blendWeight, HIGH_TRUST_SPIKE_MIN_BLEND_WEIGHT)
    }

    return clamp(blendWeight, 0, 1)
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
        const categoriesById = new Map(categories.map((category) => [category.id, category]))
        const subscriptionCandidates = expenses.map((expense) => {
            const category = categoriesById.get(expense.categoryId)
            return {
                amountCents: expense.amountCents,
                description: expense.description,
                timestamp: expense.timestamp,
                categoryId: expense.categoryId,
                categoryLabel: category?.label || expense.category || expense.categoryId
            }
        })
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
        const brainPrediction = brainResultIsCurrent ? (brainEvolution?.prediction ?? null) : null
        const brainNowcastConfidenceScore = brainResultIsCurrent
            ? clamp(
                brainPrediction?.confidence ?? (brainEvolution?.currentMonthNowcastConfidence ?? 0),
                0,
                1
            )
            : 0
        const brainMaturityScore = clamp(
            (brainEvolution?.snapshot?.currentMonthHead?.trainedSamples ?? 0) / BRAIN_MATURITY_SAMPLE_TARGET,
            0,
            1
        )
        const brainRemainingCurrentMonthExpensesCents = Math.max(
            0,
            brainEvolution?.predictedCurrentMonthRemainingExpensesCents ?? 0
        )
        const overshootAnchorCents = historicalRemainingCurrentMonthExpensesCents ?? fallbackRemainingCurrentMonthExpensesCents
        const overshootRatio = overshootAnchorCents > 0
            ? brainRemainingCurrentMonthExpensesCents / Math.max(overshootAnchorCents, 1)
            : 1
        const allowedOvershootRatio = resolveAllowedBrainOvershootRatio(brainNowcastConfidenceScore)
        const allowedOvershootDeltaCents = Math.max(
            MIN_BRAIN_OVERSHOOT_DELTA_CENTS,
            Math.round(overshootAnchorCents * 0.45)
        )
        const isBrainOutlier = brainNowcastReady
            && overshootAnchorCents > 0
            && brainRemainingCurrentMonthExpensesCents > overshootAnchorCents
            && overshootRatio > allowedOvershootRatio
            && (brainRemainingCurrentMonthExpensesCents - overshootAnchorCents) > allowedOvershootDeltaCents
        const brainBlendWeight = brainNowcastReady
            ? isBrainOutlier
                ? resolveOutlierBrainBlendWeight({
                    confidenceScore: brainNowcastConfidenceScore,
                    maturityScore: brainMaturityScore,
                    overshootRatio,
                    allowedOvershootRatio
                })
                : brainNowcastConfidenceScore >= MIN_BRAIN_NOWCAST_CONFIDENCE
                    ? 1
                    : 0
            : 0
        const predictedRemainingCurrentMonthExpensesCents = brainBlendWeight > 0
            ? Math.max(
                0,
                Math.round(
                    fallbackRemainingCurrentMonthExpensesCents
                    + ((brainRemainingCurrentMonthExpensesCents - fallbackRemainingCurrentMonthExpensesCents) * brainBlendWeight)
                )
            )
            : fallbackRemainingCurrentMonthExpensesCents
        const canUseBrainNowcast = brainBlendWeight >= PRIMARY_BRAIN_BLEND_WEIGHT_THRESHOLD
        const primarySource: AIForecast["primarySource"] = canUseBrainNowcast ? "brain" : "fallback"
        const predictedTotalEstimatedBalanceCents = baseBalanceCents - predictedRemainingCurrentMonthExpensesCents
        const fallbackRiskScore = currentMonthExpensesCents > 0
            ? clamp(
                predictedRemainingCurrentMonthExpensesCents / Math.max(currentMonthExpensesCents, 1),
                0,
                1
            )
            : null
        const brainSignal: AIBrainSignal = {
            isReady: canUseBrainNowcast,
            source: canUseBrainNowcast ? "brain" : "fallback",
            riskScore: canUseBrainNowcast && brainPrediction
                ? clamp(brainPrediction.riskScore, 0, 1)
                : fallbackRiskScore,
            confidenceScore: brainResultIsCurrent
                ? brainNowcastConfidenceScore
                : null
        }

        const now = new Date()
        const {
            subscriptions: detectedSubscriptions,
            totalYearlyCents: subscriptionTotalYearlyCents
        } = detectActiveSubscriptions(subscriptionCandidates, { now })

        // 1. Historical coverage signal (used only for confidence level)
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
        categories,
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
