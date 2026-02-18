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

export const STORAGE_KEY_TRANSACTIONS = "luma_transactions_v1"
// Legacy technical key kept only for backward compatibility of old backups/migrations.
export const STORAGE_KEY_BUDGET_PLANS = "luma_budget_plans_v1"
export const STORAGE_KEY_CATEGORIES = "luma_categories_v1"
export const STORAGE_KEY_SETTINGS = "luma_settings_v1"
export const STORAGE_KEY_LEGACY_PORTFOLIO = "numa_goal_portfolio_v1"
export const STORAGE_KEY_LEGACY_ACTIVE_COMMIT = "numa_active_goal_v1"
export const STORAGE_KEY_NOTIFICATIONS = "numa_notifications_state_v2"
export const STORAGE_KEY_PRIVACY = "numa-privacy-storage"
export const STORAGE_KEY_FINLAB_HARD_SWITCH_DONE = "numa_finlab_hard_switch_v1_done"
export const STORAGE_KEY_BRAIN_ADAPTIVE_POLICY = "numa_brain_adaptive_policy_v1"

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

function countLegacyPortfolioRecords(raw: unknown): number {
    if (!raw || typeof raw !== "object") return 0
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.goals)) return obj.goals.length
    return 0
}

function countLegacyCommitRecord(raw: unknown): number {
    if (!raw || typeof raw !== "object") return 0
    return 1
}

function countPrivacyState(raw: unknown): number {
    if (!raw || typeof raw !== "object") return 0
    return 1
}

export const STORAGE_KEYS_REGISTRY: StorageKeyConfig[] = [
    {
        key: STORAGE_KEY_TRANSACTIONS,
        label: "Transazioni",
        countFn: countTransactions,
        invalidatesQueries: ["transactions", "dashboard-summary", "recent-transactions"],
    },
    {
        key: STORAGE_KEY_CATEGORIES,
        label: "Categorie",
        countFn: countCategories,
        invalidatesQueries: ["categories", "dashboard-summary"],
    },
    {
        key: STORAGE_KEY_SETTINGS,
        label: "Impostazioni",
        invalidatesQueries: ["settings", "dashboard-summary"],
    },
    {
        key: STORAGE_KEY_LEGACY_PORTFOLIO,
        label: "Portfolio Legacy",
        countFn: countLegacyPortfolioRecords,
        invalidatesQueries: ["dashboard-summary"],
    },
    {
        key: STORAGE_KEY_LEGACY_ACTIVE_COMMIT,
        label: "Commit Legacy",
        countFn: countLegacyCommitRecord,
    },
    {
        key: STORAGE_KEY_NOTIFICATIONS,
        label: "Notifiche Beta",
        invalidatesQueries: ["notifications"],
    },
    {
        key: STORAGE_KEY_PRIVACY,
        label: "Privacy Mode",
        countFn: countPrivacyState,
    },
    {
        key: STORAGE_KEY_FINLAB_HARD_SWITCH_DONE,
        label: "Financial Lab Hard Switch Marker",
    },
    {
        key: STORAGE_KEY_BRAIN_ADAPTIVE_POLICY,
        label: "Policy adattiva Brain",
    },
]

/** Helper to get all storage keys as string array */
export function getAllStorageKeys(): string[] {
    return STORAGE_KEYS_REGISTRY.map(c => c.key)
}
