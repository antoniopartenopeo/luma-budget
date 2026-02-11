import { useMemo } from "react"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { useCategories } from "@/features/categories/api/use-categories"
import { useBudget } from "@/VAULT/budget/api/use-budget"
import { Insight } from "./types"
import {
    buildBudgetRiskInsight,
    buildCategorySpikeInsights,
    buildTopDriversInsight,
} from "./generators"
import { useSettings } from "@/features/settings/api/use-settings"
import { useCurrency } from "@/features/settings/api/use-currency"
import { getInsightThresholds } from "./utils"
import { filterTransactionsByMonth } from "./utils"

interface UseInsightsOptions {
    period: string // YYYY-MM format
}

interface UseInsightsResult {
    insights: Insight[]
    isLoading: boolean
    isEmpty: boolean
    hasTransactions: boolean
}

export function useInsights({ period }: UseInsightsOptions): UseInsightsResult {
    const { data: transactions = [], isLoading: transactionsLoading } = useTransactions()
    const { data: categories = [], isLoading: categoriesLoading } = useCategories({ includeArchived: true })
    const { data: budgetPlan, isLoading: budgetLoading } = useBudget(period)
    const { data: settings, isLoading: settingsLoading } = useSettings()
    const { currency, locale } = useCurrency()

    const isLoading = transactionsLoading || categoriesLoading || budgetLoading || settingsLoading

    const result = useMemo(() => {
        if (isLoading) {
            return { insights: [], isEmpty: true, hasTransactions: false }
        }

        const sensitivity = settings?.insightsSensitivity || "medium"
        const thresholds = getInsightThresholds(sensitivity)

        // Build categories map for lookup
        const categoriesMap = new Map(
            categories.map(c => [c.id, { label: c.label }])
        )

        const currentDate = new Date()
        const budgetCents = budgetPlan?.globalBudgetAmountCents ?? null

        const insights: Insight[] = []

        // Generate Budget Risk Insight
        const budgetRisk = buildBudgetRiskInsight({
            transactions,
            budgetCents,
            period,
            currentDate,
            currency,
            locale,
        }, thresholds)
        if (budgetRisk) {
            insights.push(budgetRisk)
        }

        // Generate Category Spike Insights
        const categorySpikes = buildCategorySpikeInsights({
            transactions,
            categoriesMap,
            currentPeriod: period,
            currency,
            locale,
        }, thresholds)
        insights.push(...categorySpikes)

        // Generate Top Drivers Insight
        const topDrivers = buildTopDriversInsight({
            transactions,
            currentPeriod: period,
            currency,
            locale,
        }, thresholds)
        if (topDrivers) {
            insights.push(topDrivers)
        }

        // Check if there are any transactions in the period at all
        const hasTransactions = filterTransactionsByMonth(transactions, period).length > 0

        return {
            insights,
            isEmpty: insights.length === 0,
            hasTransactions,
        }
    }, [transactions, categories, budgetPlan, period, isLoading, settings?.insightsSensitivity, currency, locale])

    return {
        ...result,
        isLoading,
    }
}
