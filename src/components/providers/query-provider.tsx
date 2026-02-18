"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { __resetTransactionsCache } from "@/features/transactions/api/repository"
import { __resetBudgetsCache } from "@/VAULT/budget/api/repository"
import { __resetCategoriesCache } from "@/features/categories/api/repository"
import {
    STORAGE_KEY_BUDGET_PLANS,
    STORAGE_KEY_CATEGORIES,
    STORAGE_KEYS_REGISTRY,
    STORAGE_KEY_TRANSACTIONS
} from "@/lib/storage-keys"

const CACHE_RESETTERS: Record<string, () => void> = {
    [STORAGE_KEY_TRANSACTIONS]: __resetTransactionsCache,
    [STORAGE_KEY_BUDGET_PLANS]: __resetBudgetsCache,
    [STORAGE_KEY_CATEGORIES]: __resetCategoriesCache,
}

const STORAGE_KEY_TO_QUERY_ROOTS: ReadonlyMap<string, ReadonlySet<string>> = new Map(
    STORAGE_KEYS_REGISTRY.flatMap(config => {
        if (!config.invalidatesQueries?.length) {
            return []
        }
        return [[config.key, new Set(config.invalidatesQueries)] as const]
    })
)

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
            if (!e.key || e.storageArea !== window.localStorage || e.oldValue === e.newValue) return

            const resetCache = CACHE_RESETTERS[e.key]
            if (resetCache) {
                resetCache()
            }

            const queryRoots = STORAGE_KEY_TO_QUERY_ROOTS.get(e.key)
            if (!queryRoots?.size) return

            void queryClient.invalidateQueries({
                predicate: query => {
                    const root = query.queryKey[0]
                    return typeof root === "string" && queryRoots.has(root)
                },
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
