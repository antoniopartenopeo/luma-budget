
import { describe, it, expect, vi, beforeEach } from "vitest"
import { activateRhythm } from "../rhythm-orchestrator"
import { BaselineMetrics } from "../financial-baseline"
import { ScenarioConfig } from "../../types"
import * as goalRepo from "../../api/goal-repository"
import * as budgetRepo from "@/VAULT/budget/api/repository"


vi.mock("../../api/goal-repository")
vi.mock("@/VAULT/budget/api/repository")

describe("Rhythm Orchestrator (Phase 3)", () => {
    const mockBaseline: BaselineMetrics = {
        averageMonthlyIncome: 300000,
        averageMonthlyExpenses: 200000,
        averageEssentialExpenses: 120000,
        averageSuperfluousExpenses: 50000,
        averageComfortExpenses: 30000,
        expensesStdDev: 10000,
        freeCashFlowStdDev: 10000,
        monthsAnalyzed: 6,
        activeMonths: 6,
        activityCoverageRatio: 1
    }

    const mockScenario: ScenarioConfig = {
        type: "balanced",
        label: "Passo Svelto",
        description: "Ottimizza il percorso",
        applicationMap: { "cat2": 5, "cat3": 20 },
        savingsMap: { superfluous: 20, comfort: 5 }
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should produce a coherent persistent commitment (Requirement 1)", async () => {
        const commitment = await activateRhythm({
            userId: "user1",
            goalTargetCents: 100000,
            scenario: mockScenario,
            baseline: mockBaseline
        })

        expect(commitment.rhythmType).toBe("balanced")
        expect(commitment.goalTargetCents).toBe(100000)

        // Use savePortfolio
        expect(goalRepo.savePortfolio).toHaveBeenCalledWith(expect.objectContaining({
            activeRhythm: expect.objectContaining({
                type: "balanced",
                intensity: 0.5
            })
        }))
    })

    it("should derive internal budget derived ONLY from scenario intensity (Requirement 2)", async () => {
        await activateRhythm({
            userId: "user1",
            goalTargetCents: 100000,
            scenario: mockScenario,
            baseline: mockBaseline
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
        // Since we mock goalRepo.savePortfolio...
        await activateRhythm({
            userId: "user1",
            goalTargetCents: 100000,
            scenario: mockScenario,
            baseline: mockBaseline
        })

        const secondScenario: ScenarioConfig = { ...mockScenario, type: "aggressive", label: "Sprint" }
        await activateRhythm({
            userId: "user1",
            goalTargetCents: 100000,
            scenario: secondScenario,
            baseline: mockBaseline
        })

        expect(goalRepo.savePortfolio).toHaveBeenCalledTimes(2)
        const lastCall = vi.mocked(goalRepo.savePortfolio).mock.calls[1][0]
        expect(lastCall.activeRhythm?.type).toBe("aggressive")
        expect(lastCall.activeRhythm?.intensity).toBe(1.0)
    })

    it("should allow a projection based on the committed rhythm (Requirement 2/7)", async () => {
        const LARGE_GOAL = 5000000 // 5M cents
        // 1. Commit
        await activateRhythm({
            userId: "user1",
            goalTargetCents: LARGE_GOAL,
            scenario: mockScenario,
            baseline: mockBaseline
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
            baseline: mockBaseline
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

    it("should not crash when savingsMap is missing (legacy scenario payload)", async () => {
        const legacyScenario = {
            ...mockScenario,
            savingsMap: undefined
        } as unknown as ScenarioConfig

        await expect(
            activateRhythm({
                userId: "user1",
                goalTargetCents: 100000,
                scenario: legacyScenario,
                baseline: mockBaseline
            })
        ).resolves.toBeDefined()
    })
})
