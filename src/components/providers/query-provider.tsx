"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { __resetTransactionsCache } from "@/features/transactions/api/repository"

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
                queryClient.invalidateQueries({ queryKey: ["transactions"] })
                queryClient.invalidateQueries({ queryKey: ["recent-transactions"] })
                queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
            }

            if (e.key === "luma_budget_plans_v1") {
                // Invalidate all budget plans
                queryClient.invalidateQueries({ queryKey: ["budgets"] })
                // The dashboard might depend on budget vs actuals
                queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
            }

            if (e.key === "luma_settings_v1") {
                queryClient.invalidateQueries({ queryKey: ["settings"] })
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
