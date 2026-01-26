"use client"

import { useState, useMemo } from "react"
import { AlertCircle } from "lucide-react"
import { useBudget, useUpsertBudget } from "@/features/budget/api/use-budget"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { useCategories } from "@/features/categories/api/use-categories"
import { MonthSelector } from "@/features/budget/components/month-selector"
import { GlobalBudgetCard } from "@/features/budget/components/global-budget-card"
import { GroupBudgetCard } from "@/features/budget/components/group-budget-card"
import { getCurrentPeriod, calculateGroupSpending } from "@/features/budget/utils/calculate-budget"
import { BudgetGroupId, BUDGET_GROUP_LABELS, BUDGET_GROUPS } from "@/features/budget/api/types"
import { StateMessage } from "@/components/ui/state-message"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageHeader } from "@/components/ui/page-header"
import { getDaysElapsedInMonth, getDaysInMonth } from "@/lib/date-ranges"

export default function BudgetPage() {
    const [period, setPeriod] = useState(getCurrentPeriod())

    // Fetch budget for selected period
    const { data: budget, isLoading: isBudgetLoading, isError: isBudgetError, refetch } = useBudget(period)

    // Fetch all transactions to calculate spending
    const { data: transactions, isLoading: isTransactionsLoading } = useTransactions()

    // Fetch categories for SpendingNature lookup
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()

    // Mutation for saving budget
    const { mutate: saveBudget, isPending: isSaving } = useUpsertBudget()

    // Calculate spending from transactions
    const spending = useMemo(() => {
        if (!transactions) return { globalSpentCents: 0, groupSpending: [] }
        return calculateGroupSpending(transactions, period, categories)
    }, [transactions, period, categories])

    // Calculate elapsed month ratio (BUDGET-2 Skill: B1-B3)
    const elapsedRatio = useMemo(() => {
        const daysElapsed = getDaysElapsedInMonth(period, new Date())
        const daysInMonth = getDaysInMonth(period)
        return daysElapsed / daysInMonth
    }, [period])

    const isLoading = isBudgetLoading || isTransactionsLoading || isCategoriesLoading

    // Get current group budgets with fallback to 0
    const getGroupBudget = (groupId: BudgetGroupId): number => {
        if (!budget) return 0
        const group = budget.groupBudgets.find(g => g.groupId === groupId)
        return group?.amountCents || 0
    }

    // Get spent amount for a group
    const getGroupSpent = (groupId: BudgetGroupId): number => {
        const group = spending.groupSpending.find(g => g.groupId === groupId)
        return group?.spentCents || 0
    }

    // Calculate if group budgets exceed global budget
    const totalGroupBudgets = useMemo(() => {
        if (!budget) return 0
        return budget.groupBudgets.reduce((sum, g) => sum + g.amountCents, 0)
    }, [budget])

    const showGroupWarning = budget && totalGroupBudgets > budget.globalBudgetAmountCents && budget.globalBudgetAmountCents > 0

    // Handle saving global budget
    const handleSaveGlobalBudget = (amountCents: number) => {
        saveBudget({
            period,
            globalBudgetAmountCents: amountCents,
            groupBudgets: budget?.groupBudgets || BUDGET_GROUPS.map(groupId => ({
                groupId,
                label: BUDGET_GROUP_LABELS[groupId],
                amountCents: 0
            }))
        })
    }

    // Handle saving group budget
    const handleSaveGroupBudget = (groupId: BudgetGroupId, amountCents: number) => {
        const currentGroupBudgets = budget?.groupBudgets || BUDGET_GROUPS.map(gId => ({
            groupId: gId,
            label: BUDGET_GROUP_LABELS[gId],
            amountCents: 0
        }))

        const updatedGroupBudgets = currentGroupBudgets.map(g =>
            g.groupId === groupId ? { ...g, amountCents } : g
        )

        saveBudget({
            period,
            globalBudgetAmountCents: budget?.globalBudgetAmountCents || 0,
            groupBudgets: updatedGroupBudgets
        })
    }

    if (isBudgetError) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
                        <p className="text-muted-foreground">
                            Gestisci il tuo budget mensile.
                        </p>
                    </div>
                    <MonthSelector period={period} onPeriodChange={setPeriod} />
                </div>
                <StateMessage
                    variant="error"
                    title="Errore nel caricamento del budget"
                    description="Si è verificato un problema durante il recupero dei dati. Riprova tra poco."
                    actionLabel="Riprova"
                    onActionClick={() => refetch()}
                />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <PageHeader
                title="Budget"
                description="Gestisci il tuo budget mensile e monitora le spese."
                actions={<MonthSelector period={period} onPeriodChange={setPeriod} />}
            />

            {/* Warning for group budgets exceeding global */}
            {showGroupWarning && (
                <Alert variant="destructive" className="bg-amber-50 text-amber-800 border-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Attenzione: la somma dei budget di gruppo è superiore al budget mensile globale.
                    </AlertDescription>
                </Alert>
            )}

            {/* Global Budget Card */}
            <GlobalBudgetCard
                budgetCents={budget?.globalBudgetAmountCents || 0}
                spentCents={spending.globalSpentCents}
                isLoading={isLoading}
                onSave={handleSaveGlobalBudget}
                isSaving={isSaving}
                elapsedRatio={elapsedRatio}
            />

            {/* Group Budget Cards */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Budget per Gruppi di Spesa</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {BUDGET_GROUPS.map(groupId => (
                        <GroupBudgetCard
                            key={groupId}
                            groupId={groupId}
                            budgetCents={getGroupBudget(groupId)}
                            spentCents={getGroupSpent(groupId)}
                            isLoading={isLoading}
                            onSave={handleSaveGroupBudget}
                            isSaving={isSaving}
                            elapsedRatio={elapsedRatio}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
