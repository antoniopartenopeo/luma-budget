"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { __resetTransactionsCache } from "@/features/transactions/api/repository"
import { __resetBudgetsCache } from "@/VAULT/budget/api/repository"
// import { useBudget } from "@/VAULT/budget/api/use-budget" // Logic only now?
// If this was prefetching, we might want to keep it or remove it if no UI needs it immediately.
// Let's assume we keep it for data readiness.

import { __resetCategoriesCache, CATEGORIES_STORAGE_KEY } from "@/features/categories/api/repository"
import { queryKeys } from "@/lib/query-keys"

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
            },
        },
    }))

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (!e.key || e.storageArea !== window.localStorage) return

            if (e.key === "luma_transactions_v1") {
                // Clear the in-memory cache first
                __resetTransactionsCache()
                // Invalidate all transaction related queries
                queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
                queryClient.invalidateQueries({ queryKey: queryKeys.transactions.recent })
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
            }

            if (e.key === "luma_budget_plans_v1") {
                // Invalidate all budget plans
                __resetBudgetsCache() // Ensure we reset cache for budgets too
                queryClient.invalidateQueries({ queryKey: queryKeys.budget.all })
                // The dashboard might depend on budget vs actuals
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
            }

            if (e.key === "luma_settings_v1") {
                queryClient.invalidateQueries({ queryKey: queryKeys.settings() })
            }

            if (e.key === CATEGORIES_STORAGE_KEY) {
                __resetCategoriesCache()
                queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() })
                queryClient.invalidateQueries({ queryKey: queryKeys.categories.active() })
                // Also invalidating things that might depend on category labels/icons
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
                queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
            }
        }

        window.addEventListener("storage", handleStorageChange)
        return () => window.removeEventListener("storage", handleStorageChange)
    }, [queryClient])

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
