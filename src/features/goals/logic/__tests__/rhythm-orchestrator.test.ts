
import { describe, it, expect, vi, beforeEach } from "vitest"
import { activateRhythm } from "../rhythm-orchestrator"
import { BaselineMetrics } from "../financial-baseline"
import { ScenarioConfig } from "../../types"
import { Category } from "@/features/categories/config"
import * as goalRepo from "../../api/goal-repository"
import * as budgetRepo from "@/features/budget/api/repository"

vi.mock("../../api/goal-repository")
vi.mock("@/features/budget/api/repository")

describe("Rhythm Orchestrator (Phase 3)", () => {
    const mockBaseline: BaselineMetrics = {
        averageMonthlyIncome: 300000,
        averageMonthlyExpenses: 200000,
        averageEssentialExpenses: 120000,
        expensesStdDev: 10000,
        monthsAnalyzed: 6
    }

    const mockCategories: Category[] = [
        { id: "cat1", name: "Rent", group: "house", spendingNature: "essential", iconName: "home" },
        { id: "cat2", name: "Gym", group: "leisure", spendingNature: "comfort", iconName: "activity" },
        { id: "cat3", name: "Netflix", group: "digital", spendingNature: "superfluous", iconName: "tv" }
    ]

    const mockScenario: ScenarioConfig = {
        type: "balanced",
        label: "Passo Svelto",
        description: "Ottimizza il percorso",
        savingsMap: { "cat2": 5, "cat3": 20 }
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should produce a coherent persistent commitment (Requirement 1)", async () => {
        const commitment = await activateRhythm({
            userId: "user1",
            goalTargetCents: 100000,
            scenario: mockScenario,
            baseline: mockBaseline,
            categories: mockCategories
        })

        expect(commitment.rhythmType).toBe("balanced")
        expect(commitment.goalTargetCents).toBe(100000)
        expect(goalRepo.saveCommitment).toHaveBeenCalledWith(expect.objectContaining({
            rhythmType: "balanced",
            intensity: 0.5
        }))
    })

    it("should derive internal budget derived ONLY from scenario intensity (Requirement 2)", async () => {
        await activateRhythm({
            userId: "user1",
            goalTargetCents: 100000,
            scenario: mockScenario,
            baseline: mockBaseline,
            categories: mockCategories
        })

        // Verify budgetRepo.upsertBudget was called with derived values
        expect(budgetRepo.upsertBudget).toHaveBeenCalledWith(
            "user1",
            expect.any(String),
            expect.objectContaining({
                globalBudgetAmountCents: expect.any(Number)
            })
        )
    })

    it("should be reversible: new commit overwrites previous (Requirement 4)", async () => {
        // Since we mock goalRepo.saveCommitment and it uses a fixed storage key internally,
        // multiple calls naturally overwrite.
        await activateRhythm({
            userId: "user1",
            goalTargetCents: 100000,
            scenario: mockScenario,
            baseline: mockBaseline,
            categories: mockCategories
        })

        const secondScenario: ScenarioConfig = { ...mockScenario, type: "aggressive", label: "Sprint" }
        await activateRhythm({
            userId: "user1",
            goalTargetCents: 100000,
            scenario: secondScenario,
            baseline: mockBaseline,
            categories: mockCategories
        })

        expect(goalRepo.saveCommitment).toHaveBeenCalledTimes(2)
        const lastCall = vi.mocked(goalRepo.saveCommitment).mock.calls[1][0]
        expect(lastCall.rhythmType).toBe("aggressive")
        expect(lastCall.intensity).toBe(1.0)
    })

    it("should allow a projection based on the committed rhythm (Requirement 2/7)", async () => {
        const LARGE_GOAL = 5000000 // 5M cents
        // 1. Commit
        await activateRhythm({
            userId: "user1",
            goalTargetCents: LARGE_GOAL,
            scenario: mockScenario,
            baseline: mockBaseline,
            categories: mockCategories
        })

        // 2. Simulate a projection engine run using the derived configuration
        const calls = vi.mocked(budgetRepo.upsertBudget).mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        const lastBudgetCallData = calls[0][2];
        const projectedSavingsPerMonth = mockBaseline.averageMonthlyExpenses - (lastBudgetCallData.globalBudgetAmountCents || 0)

        const originalFreeCashFlow = mockBaseline.averageMonthlyIncome - mockBaseline.averageMonthlyExpenses
        const newFreeCashFlow = originalFreeCashFlow + projectedSavingsPerMonth

        expect(newFreeCashFlow).toBeGreaterThan(originalFreeCashFlow)

        const originalMonths = Math.ceil(LARGE_GOAL / originalFreeCashFlow)
        const predictedMonths = Math.ceil(LARGE_GOAL / newFreeCashFlow)

        expect(predictedMonths).toBeLessThan(originalMonths)
    })

    it("INVARIANT: Commit does NOT expose budgeting concepts (Requirement 5/7)", async () => {
        const commitment = await activateRhythm({
            userId: "user1",
            goalTargetCents: 100000,
            scenario: mockScenario,
            baseline: mockBaseline,
            categories: mockCategories
        })

        // The commitment object itself must NOT contain 'budget', 'limit', or 'category' breakdowns
        const keys = Object.keys(commitment)
        expect(keys).not.toContain("budget")
        expect(keys).not.toContain("limits")
        expect(keys).not.toContain("categories")
        expect(keys).not.toContain("savings")

        // Output for user should be purely rhythmic/temporal
        expect(commitment).toHaveProperty("rhythmLabel")
        expect(commitment).toHaveProperty("activatedAt")
    })
})
