/**
 * Centralized Storage Keys Registry
 * Single source of truth for all localStorage keys used by LumaBudget.
 * Used by diagnostics, backup/restore, and cross-tab sync.
 */

export interface StorageKeyConfig {
    key: string
    label: string
    /** Optional function to extract a count from the parsed data */
    countFn?: (raw: unknown) => number
}

function countTransactions(raw: unknown): number {
    if (!raw || typeof raw !== "object") return 0
    const obj = raw as Record<string, unknown>
    // V1 format: { version, transactions: [...] } or just array
    if (Array.isArray(obj)) return obj.length
    if ("transactions" in obj && Array.isArray(obj.transactions)) {
        return obj.transactions.length
    }
    // Legacy format: period-keyed object
    let count = 0
    for (const value of Object.values(obj)) {
        if (Array.isArray(value)) count += value.length
    }
    return count
}

function countBudgetPlans(raw: unknown): number {
    if (!raw || typeof raw !== "object") return 0
    if (Array.isArray(raw)) return raw.length
    return Object.keys(raw).length
}

function countCategories(raw: unknown): number {
    if (!raw || typeof raw !== "object") return 0
    const obj = raw as Record<string, unknown>
    // V1 format: { version, categories: [...] }
    if ("categories" in obj && Array.isArray(obj.categories)) {
        return obj.categories.length
    }
    if (Array.isArray(raw)) return raw.length
    return 0
}

export const STORAGE_KEYS_REGISTRY: StorageKeyConfig[] = [
    {
        key: "luma_transactions_v1",
        label: "Transazioni",
        countFn: countTransactions,
    },
    {
        key: "luma_budget_plans_v1",
        label: "Piani Budget",
        countFn: countBudgetPlans,
    },
    {
        key: "luma_categories_v1",
        label: "Categorie",
        countFn: countCategories,
    },
    {
        key: "luma_settings_v1",
        label: "Impostazioni",
    },
]

/** Helper to get all storage keys as string array */
export function getAllStorageKeys(): string[] {
    return STORAGE_KEYS_REGISTRY.map(c => c.key)
}
