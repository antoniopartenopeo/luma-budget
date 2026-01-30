"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchBudget, upsertBudget } from "./repository"
import { BudgetPlan, CreateBudgetDTO } from "./types"
import { queryKeys } from "@/lib/query-keys"

// Default user ID for mock
const DEFAULT_USER_ID = "user-1"


// =====================
// HOOKS
// =====================

export function useBudget(period: string) {
    return useQuery({
        queryKey: queryKeys.budget.detail(period),
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
            queryClient.setQueryData(queryKeys.budget.detail(newBudget.period), newBudget)
            // Invalidate all budgets to refresh any lists
            queryClient.invalidateQueries({ queryKey: queryKeys.budget.all })
        }
    })
}
