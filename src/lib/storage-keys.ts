/**
 * Centralized Storage Keys Registry
 * Single source of truth for all localStorage keys used by NUMA Budget.
 * Used by diagnostics, backup/restore, and cross-tab sync.
 */

export interface StorageKeyConfig {
    key: string
    label: string
    /** Optional function to extract a count from the parsed data */
    countFn?: (raw: unknown) => number
    /** Query keys to invalidate when this storage key changes (for cross-tab sync) */
    invalidatesQueries?: string[]
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

function countGoalsInPortfolio(raw: unknown): number {
    if (!raw || typeof raw !== "object") return 0
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.goals)) return obj.goals.length
    return 0
}

function countLegacyGoal(raw: unknown): number {
    if (!raw || typeof raw !== "object") return 0
    return 1
}

export const STORAGE_KEYS_REGISTRY: StorageKeyConfig[] = [
    {
        key: "luma_transactions_v1",
        label: "Transazioni",
        countFn: countTransactions,
        invalidatesQueries: ["transactions", "dashboard-summary", "recent-transactions"],
    },
    {
        key: "luma_budget_plans_v1",
        label: "Piani Budget",
        countFn: countBudgetPlans,
        invalidatesQueries: ["budgets", "dashboard-summary"],
    },
    {
        key: "luma_categories_v1",
        label: "Categorie",
        countFn: countCategories,
        invalidatesQueries: ["categories", "dashboard-summary"],
    },
    {
        key: "luma_settings_v1",
        label: "Impostazioni",
        invalidatesQueries: ["settings", "dashboard-summary"],
    },
    {
        key: "numa_goal_portfolio_v1",
        label: "Portfolio Obiettivi",
        countFn: countGoalsInPortfolio,
    },
    {
        key: "numa_active_goal_v1",
        label: "Goal Attivo (Legacy)",
        countFn: countLegacyGoal,
    },
    {
        key: "insights_smart_advice_signature_v1",
        label: "Firma Insight AI",
    },
    {
        key: "numa_notifications_state_v1",
        label: "Notifiche Beta",
        invalidatesQueries: ["notifications"],
    },
]

/** Helper to get all storage keys as string array */
export function getAllStorageKeys(): string[] {
    return STORAGE_KEYS_REGISTRY.map(c => c.key)
}
