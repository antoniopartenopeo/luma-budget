import { describe, it, expect } from "vitest"
import { calculatePortfolioProjections } from "../multi-goal-orchestrator"
import { GoalPortfolio, ProjectionInput } from "../../types"
import { addMonths, format } from "date-fns"

describe("Multi-Goal Orchestrator", () => {
    const mockBaseline: Omit<ProjectionInput, "goalTarget" | "startDate"> = {
        currentFreeCashFlow: 1000,
        historicalVariability: 200
    }

    const portfolio: GoalPortfolio = {
        mainGoalId: "goal-1",
        goals: [
            {
                id: "goal-1",
                title: "Obiettivo 1",
                targetCents: 5000,
                createdAt: "2026-01-01T10:00:00Z"
            },
            {
                id: "goal-2",
                title: "Obiettivo 2",
                targetCents: 5000,
                createdAt: "2026-01-02T10:00:00Z"
            }
        ]
    }

    it("should calculate goals sequentially (Competition for Time)", () => {
        const result = calculatePortfolioProjections(portfolio, mockBaseline)

        expect(result.projections).toHaveLength(2)

        const p1 = result.projections.find(p => p.goalId === "goal-1")!
        const p2 = result.projections.find(p => p.goalId === "goal-2")!

        // Goal 1 should start now
        // target 5000 / capacity 1000 = 5 months
        expect(p1.projection.likelyMonths).toBe(5)

        // Goal 2 should start after Goal 1 ends
        // So Goal 2 likelyDate should be 5 months after Goal 1's starting today
        // And Goal 2 itself needs 5 months, so total 10 months from now
        expect(p2.projection.likelyMonths).toBe(5)

        const expectedP2Date = addMonths(p1.projection.likelyDate, 5)
        expect(format(p2.projection.likelyDate, "yyyy-MM")).toBe(format(expectedP2Date, "yyyy-MM"))

        expect(result.totalMonths).toBe(10)
    })

    it("should shift timelines when changing Main Goal", () => {
        const prioritizedPortfolio: GoalPortfolio = {
            ...portfolio,
            mainGoalId: "goal-2"
        }

        const result = calculatePortfolioProjections(prioritizedPortfolio, mockBaseline)

        const p1 = result.projections.find(p => p.goalId === "goal-1")!
        const p2 = result.projections.find(p => p.goalId === "goal-2")!

        // Now Goal 2 is first
        expect(format(p2.projection.likelyDate, "yyyy-MM")).toBe(format(addMonths(new Date(), 5), "yyyy-MM"))

        // Goal 1 is second
        expect(format(p1.projection.likelyDate, "yyyy-MM")).toBe(format(addMonths(new Date(), 10), "yyyy-MM"))
    })

    it("should handle reached goals by omitting them from sequential time accumulation", () => {
        const partiallyReachedPortfolio: GoalPortfolio = {
            ...portfolio,
            goals: [
                { ...portfolio.goals[0], reachedAt: "2026-01-20T10:00:00Z" },
                portfolio.goals[1]
            ]
        }

        const result = calculatePortfolioProjections(partiallyReachedPortfolio, mockBaseline)

        const p1 = result.projections.find(p => p.goalId === "goal-1")!
        const p2 = result.projections.find(p => p.goalId === "goal-2")!

        expect(p1.projection.likelyMonths).toBe(0)
        // Goal 2 should start NOW (since goal 1 is reached)
        expect(p2.projection.likelyMonths).toBe(5)
        expect(format(p2.projection.likelyDate, "yyyy-MM")).toBe(format(addMonths(new Date(), 5), "yyyy-MM"))
    })
})
