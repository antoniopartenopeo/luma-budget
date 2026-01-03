"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { __resetTransactionsCache } from "@/features/transactions/api/repository"
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
                queryClient.invalidateQueries({ queryKey: queryKeys.budget.all })
                // The dashboard might depend on budget vs actuals
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
            }

            if (e.key === "luma_settings_v1") {
                queryClient.invalidateQueries({ queryKey: queryKeys.settings.all })
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
