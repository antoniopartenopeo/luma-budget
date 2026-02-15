import { beforeEach, describe, expect, test } from "vitest"

import { getPortfolio, savePortfolio } from "../goal-repository"
import type { GoalPortfolio } from "../../types"

const PORTFOLIO_KEY = "numa_goal_portfolio_v1"

describe("goal-repository migration safety", () => {
    beforeEach(() => {
        localStorage.clear()
    })

    test("auto-heals missing mainGoalId when goals exist", async () => {
        const brokenPortfolio: GoalPortfolio = {
            goals: [
                {
                    id: "goal-1",
                    title: "Emergenza",
                    targetCents: 50000,
                    createdAt: "2026-01-01T00:00:00.000Z"
                }
            ]
        }

        await savePortfolio(brokenPortfolio)
        const healed = await getPortfolio()

        expect(healed).not.toBeNull()
        expect(healed?.mainGoalId).toBe("goal-1")

        const persisted = JSON.parse(localStorage.getItem(PORTFOLIO_KEY) || "null") as GoalPortfolio | null
        expect(persisted?.mainGoalId).toBe("goal-1")
    })

    test("keeps mainGoalId undefined when portfolio has no goals", async () => {
        const emptyPortfolio = {
            mainGoalId: "stale-id",
            goals: []
        } as GoalPortfolio

        await savePortfolio(emptyPortfolio)
        const healed = await getPortfolio()

        expect(healed).not.toBeNull()
        expect(healed?.goals).toHaveLength(0)
        expect(healed?.mainGoalId).toBeUndefined()
    })
})
