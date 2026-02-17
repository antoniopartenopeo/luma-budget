import { STORAGE_KEY_ACTIVE_GOAL_LEGACY, STORAGE_KEY_GOAL_PORTFOLIO } from "@/lib/storage-keys"
import { storage } from "@/lib/storage-utils"
import { ActiveGoalCommitment, GoalPortfolio, NUMAGoal } from "../types"

const PORTFOLIO_KEY = STORAGE_KEY_GOAL_PORTFOLIO
const LEGACY_COMMIT_KEY = STORAGE_KEY_ACTIVE_GOAL_LEGACY

export async function savePortfolio(portfolio: GoalPortfolio): Promise<void> {
    storage.set(PORTFOLIO_KEY, portfolio)
}

export async function getPortfolio(): Promise<GoalPortfolio | null> {
    let portfolio = storage.get<GoalPortfolio | null>(PORTFOLIO_KEY, null)

    // Migration logic
    if (!portfolio) {
        const legacy = storage.get<ActiveGoalCommitment | null>(LEGACY_COMMIT_KEY, null)
        if (legacy) {
            const initialGoal: NUMAGoal = {
                id: legacy.id,
                title: "Obiettivo Iniziale", // Fallback label
                targetCents: legacy.goalTargetCents,
                createdAt: legacy.activatedAt || new Date().toISOString()
            }
            portfolio = {
                mainGoalId: initialGoal.id,
                goals: [initialGoal],
                activeRhythm: {
                    type: legacy.rhythmType,
                    label: legacy.rhythmLabel,
                    intensity: legacy.intensity,
                    benefitCents: 0,
                    activatedAt: legacy.activatedAt
                }
            }
            // Save and clean up
            await savePortfolio(portfolio)
            storage.remove(LEGACY_COMMIT_KEY)
        }
    }

    if (portfolio) {
        let shouldPersistHeal = false

        if (portfolio.goals.length === 0) {
            if (portfolio.mainGoalId !== undefined) {
                portfolio = { ...portfolio, mainGoalId: undefined }
                shouldPersistHeal = true
            }
        } else {
            const currentMainId = portfolio.mainGoalId
            const hasCurrentMain = currentMainId
                ? portfolio.goals.some((goal) => goal.id === currentMainId)
                : false

            if (!hasCurrentMain) {
                portfolio = { ...portfolio, mainGoalId: portfolio.goals[0].id }
                shouldPersistHeal = true
            }
        }

        if (shouldPersistHeal) {
            await savePortfolio(portfolio)
        }
    }

    return portfolio
}

export async function clearPortfolio(): Promise<void> {
    storage.remove(PORTFOLIO_KEY)
    storage.remove(LEGACY_COMMIT_KEY)
}

export async function clearCommitment(): Promise<void> {
    await clearPortfolio()
}

// Keeping these for potential backward compatibility or internal usage during transition
export async function saveCommitment(commitment: ActiveGoalCommitment): Promise<void> {
    // Legacy bridge kept for compatibility during transition
    storage.set(LEGACY_COMMIT_KEY, commitment)
}

export async function getCommitment(): Promise<ActiveGoalCommitment | null> {
    return storage.get(LEGACY_COMMIT_KEY, null)
}
