import {
    STORAGE_KEY_LEGACY_ACTIVE_COMMIT,
    STORAGE_KEY_BUDGET_PLANS,
    STORAGE_KEY_FINLAB_HARD_SWITCH_DONE,
    STORAGE_KEY_LEGACY_PORTFOLIO
} from "@/lib/storage-keys"
import { storage } from "@/lib/storage-utils"

const FINLAB_HARD_SWITCH_MARKER = STORAGE_KEY_FINLAB_HARD_SWITCH_DONE
const LEGACY_PORTFOLIO_KEY = STORAGE_KEY_LEGACY_PORTFOLIO
const LEGACY_COMMIT_KEY = STORAGE_KEY_LEGACY_ACTIVE_COMMIT
const BUDGET_PLANS_KEY = STORAGE_KEY_BUDGET_PLANS

function hasLegacyRhythmState(): boolean {
    const legacyCommit = storage.get<Record<string, unknown> | null>(LEGACY_COMMIT_KEY, null)
    if (legacyCommit) return true

    const legacyPortfolio = storage.get<Record<string, unknown> | null>(LEGACY_PORTFOLIO_KEY, null)
    if (!legacyPortfolio || typeof legacyPortfolio !== "object") return false

    return Boolean(legacyPortfolio.activeRhythm)
}

function hasAnyBudgetPlans(): boolean {
    const budgetPlans = storage.get<Record<string, unknown>>(BUDGET_PLANS_KEY, {})
    return typeof budgetPlans === "object" && Object.keys(budgetPlans).length > 0
}

export async function resetFinancialLabLegacyState(): Promise<boolean> {
    const alreadyMigrated = storage.get<boolean>(FINLAB_HARD_SWITCH_MARKER, false)
    if (alreadyMigrated) return false

    const hasLegacyPortfolio = storage.get<Record<string, unknown> | null>(LEGACY_PORTFOLIO_KEY, null) !== null
    const hasLegacyCommit = storage.get<Record<string, unknown> | null>(LEGACY_COMMIT_KEY, null) !== null
    const shouldClearBudgets = hasLegacyRhythmState() && hasAnyBudgetPlans()
    const didChange =
        hasLegacyPortfolio
        || hasLegacyCommit
        || shouldClearBudgets

    storage.remove(LEGACY_PORTFOLIO_KEY)
    storage.remove(LEGACY_COMMIT_KEY)
    if (shouldClearBudgets) {
        storage.remove(BUDGET_PLANS_KEY)
    }
    storage.set(FINLAB_HARD_SWITCH_MARKER, true)

    return didChange
}
