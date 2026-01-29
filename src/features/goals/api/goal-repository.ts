import { storage } from "@/lib/storage-utils"
import { ActiveGoalCommitment, GoalPortfolio, NUMAGoal } from "../types"

const PORTFOLIO_KEY = "numa_goal_portfolio_v1"
const LEGACY_COMMIT_KEY = "numa_active_goal_v1"

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
                    activatedAt: legacy.activatedAt
                }
            }
            // Save and clean up
            await savePortfolio(portfolio)
            storage.remove(LEGACY_COMMIT_KEY)
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
    // For now, we manually bridge or mark as deprecated
    storage.set(LEGACY_COMMIT_KEY, commitment)
}

export async function getCommitment(): Promise<ActiveGoalCommitment | null> {
    return storage.get(LEGACY_COMMIT_KEY, null)
}
