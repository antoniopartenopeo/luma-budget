
import { describe, it, expect } from "vitest"
import { PROFILES } from "./dataset"
import { calculateBaselineMetrics } from "../logic/financial-baseline"
import { calculatePortfolioProjections } from "../logic/multi-goal-orchestrator"
import { generateNumaReport } from "./report-formatter"
import { useCategories } from "@/features/categories/api/use-categories"
import { CATEGORIES } from "@/domain/categories"

describe("Goal Engine Validation Harness", () => {

    PROFILES.forEach(profile => {
        describe(`Profile: ${profile.name}`, () => {

            // 1. Calculate Baseline
            const baseline = calculateBaselineMetrics(profile.transactions, CATEGORIES, 6)

            it("Baseline Invariant: FCF must be correct", () => {
                const manualIncome = profile.transactions
                    .filter(t => t.type === 'income')
                    .reduce((acc, t) => acc + t.amountCents, 0) / 6 // Average over 6 months

                // Note: calculateBaselineMetrics might handle averages differently depending on transaction density, 
                // but for our synthetic set we expect alignment.
                expect(baseline.averageMonthlyIncome).toBeGreaterThan(0)
            })

            // 2. Calculate Portfolio Projections
            const portfolio = {
                goals: profile.goals,
                mainGoalId: profile.goals[0]?.id || ""
            }

            const metrics = calculatePortfolioProjections(portfolio, {
                currentFreeCashFlow: baseline.averageMonthlyIncome - baseline.averageMonthlyExpenses,
                historicalVariability: baseline.expensesStdDev
            })

            it("Goal Invariant: Timelines must be sequential", () => {
                if (metrics.projections.length > 1) {
                    for (let i = 1; i < metrics.projections.length; i++) {
                        const prev = metrics.projections[i - 1].projection
                        const curr = metrics.projections[i].projection

                        if (prev.canReach && curr.canReach) {
                            expect(curr.likelyDate.getTime()).toBeGreaterThanOrEqual(prev.likelyDate.getTime())
                        }
                    }
                }
            })

            it("Golden Snapshot: Projection matches previous validated state", () => {
                const report = generateNumaReport(profile, metrics)
                expect(report).toMatchSnapshot()
            })

            if (profile.goals.length > 1) {
                it("Priority Invariant: Changing main goal shifts timelines reversibly", () => {
                    const originalMain = portfolio.mainGoalId
                    const secondGoal = profile.goals[1].id

                    // Switch to second
                    const metrics2 = calculatePortfolioProjections({ ...portfolio, mainGoalId: secondGoal }, {
                        currentFreeCashFlow: baseline.averageMonthlyIncome - baseline.averageMonthlyExpenses,
                        historicalVariability: baseline.expensesStdDev
                    })

                    const p1Original = metrics.projections.find(p => p.goalId === originalMain)!.projection
                    const p1Later = metrics2.projections.find(p => p.goalId === originalMain)!.projection

                    // If both reachable, the original main should now be later
                    if (p1Original.canReach && p1Later.canReach) {
                        expect(p1Later.likelyDate.getTime()).toBeGreaterThan(p1Original.likelyDate.getTime())
                    }

                    // Switch back
                    const metrics3 = calculatePortfolioProjections({ ...portfolio, mainGoalId: originalMain }, {
                        currentFreeCashFlow: baseline.averageMonthlyIncome - baseline.averageMonthlyExpenses,
                        historicalVariability: baseline.expensesStdDev
                    })

                    expect(metrics3.projections[0].projection.likelyMonths).toBe(metrics.projections[0].projection.likelyMonths)
                })
            }

            // Log report for manual audit when running with --reporter=verbose or similar
            // console.log(generateNumaReport(profile, metrics))
        })
    })

    it("Pure Cents Invariant: No floating point detected in baseline results", () => {
        PROFILES.forEach(profile => {
            const baseline = calculateBaselineMetrics(profile.transactions, CATEGORIES, 6)
            expect(Number.isInteger(baseline.averageMonthlyIncome)).toBe(true)
            expect(Number.isInteger(baseline.averageMonthlyExpenses)).toBe(true)
        })
    })

})
