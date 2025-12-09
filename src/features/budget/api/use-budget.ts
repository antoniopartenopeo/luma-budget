"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchBudget, upsertBudget } from "./mock-data"
import { BudgetPlan, CreateBudgetDTO } from "./types"

// Default user ID for mock
const DEFAULT_USER_ID = "user-1"

// =====================
// QUERY KEYS
// =====================

export const budgetKeys = {
    all: ["budgets"] as const,
    detail: (period: string) => [...budgetKeys.all, period] as const,
}

// =====================
// HOOKS
// =====================

export function useBudget(period: string) {
    return useQuery({
        queryKey: budgetKeys.detail(period),
        queryFn: () => fetchBudget(DEFAULT_USER_ID, period),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useUpsertBudget() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateBudgetDTO) => upsertBudget(DEFAULT_USER_ID, data.period, data),
        onSuccess: (newBudget: BudgetPlan) => {
            // Update the specific budget cache
            queryClient.setQueryData(budgetKeys.detail(newBudget.period), newBudget)
            // Invalidate all budgets to refresh any lists
            queryClient.invalidateQueries({ queryKey: budgetKeys.all })
        }
    })
}
