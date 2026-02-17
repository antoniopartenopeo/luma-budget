import { clearAllBudgets } from "@/VAULT/budget/api/repository"
import {
    STORAGE_KEY_ACTIVE_GOAL_LEGACY,
    STORAGE_KEY_BUDGET_PLANS,
    STORAGE_KEY_FINLAB_HARD_SWITCH_DONE,
    STORAGE_KEY_GOAL_PORTFOLIO
} from "@/lib/storage-keys"
import { storage } from "@/lib/storage-utils"

const FINLAB_HARD_SWITCH_MARKER = STORAGE_KEY_FINLAB_HARD_SWITCH_DONE
const GOAL_PORTFOLIO_KEY = STORAGE_KEY_GOAL_PORTFOLIO
const LEGACY_COMMIT_KEY = STORAGE_KEY_ACTIVE_GOAL_LEGACY
const BUDGET_PLANS_KEY = STORAGE_KEY_BUDGET_PLANS

function hasLegacyRhythmState(): boolean {
    const legacyCommit = storage.get<Record<string, unknown> | null>(LEGACY_COMMIT_KEY, null)
    if (legacyCommit) return true

    const legacyPortfolio = storage.get<Record<string, unknown> | null>(GOAL_PORTFOLIO_KEY, null)
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

    const shouldClearBudgets = hasLegacyRhythmState() && hasAnyBudgetPlans()

    storage.remove(GOAL_PORTFOLIO_KEY)
    storage.remove(LEGACY_COMMIT_KEY)
    if (shouldClearBudgets) {
        await clearAllBudgets()
    }
    storage.set(FINLAB_HARD_SWITCH_MARKER, true)

    return true
}
