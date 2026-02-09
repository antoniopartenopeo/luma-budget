"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { __resetTransactionsCache } from "@/features/transactions/api/repository"
import { __resetBudgetsCache } from "@/VAULT/budget/api/repository"
import { __resetCategoriesCache } from "@/features/categories/api/repository"
import { STORAGE_KEYS_REGISTRY } from "@/lib/storage-keys"

const CACHE_RESETTERS: Record<string, () => void> = {
    luma_transactions_v1: __resetTransactionsCache,
    luma_budget_plans_v1: __resetBudgetsCache,
    luma_categories_v1: __resetCategoriesCache,
}

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

            const resetCache = CACHE_RESETTERS[e.key]
            if (resetCache) {
                resetCache()
            }

            const config = STORAGE_KEYS_REGISTRY.find(item => item.key === e.key)
            if (!config?.invalidatesQueries?.length) return

            const queryRoots = new Set(config.invalidatesQueries)
            queryRoots.forEach(root => {
                // Query keys are rooted by the first segment (e.g. ["transactions"], ["dashboard-summary", ...])
                queryClient.invalidateQueries({ queryKey: [root] })
            })
        }

        if (typeof window === "undefined") {
            return () => undefined
        }

        window.addEventListener("storage", handleStorageChange)
        return () => {
            window.removeEventListener("storage", handleStorageChange)
        }
    }, [queryClient])

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
