"use client"

// useInsights Hook
// ================
// Composes transactions, categories, and budget data to generate insights

import { useMemo } from "react"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { useCategories } from "@/features/categories/api/use-categories"
import { useBudget } from "@/features/budget/api/use-budget"
import { Insight } from "./types"
import {
    buildBudgetRiskInsight,
    buildCategorySpikeInsights,
    buildTopDriversInsight,
} from "./generators"

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

    const isLoading = transactionsLoading || categoriesLoading || budgetLoading

    const result = useMemo(() => {
        if (isLoading) {
            return { insights: [], isEmpty: true, hasTransactions: false }
        }

        // Build categories map for lookup
        const categoriesMap = new Map(
            categories.map(c => [c.id, { label: c.label }])
        )

        const currentDate = new Date()
        const budgetCents = budgetPlan?.globalBudgetAmount
            ? Math.round(budgetPlan.globalBudgetAmount * 100)
            : null

        const insights: Insight[] = []

        // Generate Budget Risk Insight
        const budgetRisk = buildBudgetRiskInsight({
            transactions,
            budgetCents,
            period,
            currentDate,
        })
        if (budgetRisk) {
            insights.push(budgetRisk)
        }

        // Generate Category Spike Insights
        const categorySpikes = buildCategorySpikeInsights({
            transactions,
            categoriesMap,
            currentPeriod: period,
        })
        insights.push(...categorySpikes)

        // Generate Top Drivers Insight
        const topDrivers = buildTopDriversInsight({
            transactions,
            categoriesMap,
            currentPeriod: period,
        })
        if (topDrivers) {
            insights.push(topDrivers)
        }

        // Check if there are any transactions in the period at all
        const hasTransactions = transactions.some(t => {
            const date = new Date(t.timestamp)
            const [year, month] = period.split("-").map(Number)
            return date.getFullYear() === year && date.getMonth() + 1 === month
        })

        return {
            insights,
            isEmpty: insights.length === 0,
            hasTransactions,
        }
    }, [transactions, categories, budgetPlan, period, isLoading])

    return {
        ...result,
        isLoading,
    }
}
