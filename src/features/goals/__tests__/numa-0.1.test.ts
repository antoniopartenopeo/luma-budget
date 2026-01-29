
import { describe, it, expect, beforeEach, vi } from "vitest"
import { generateScenarios } from "../logic/scenario-generator"
import { calculatePortfolioProjections } from "../logic/multi-goal-orchestrator"
import { CATEGORIES } from "@/domain/categories"
import { BaselineMetrics } from "../logic/financial-baseline"

describe("NUMA 0.1 Principles Validation", () => {

    const mockBaseline: BaselineMetrics = {
        averageMonthlyIncome: 300000,
        averageMonthlyExpenses: 200000,
        averageEssentialExpenses: 150000,
        expensesStdDev: 10000,
        monthsAnalyzed: 6
    }

    it("Requirement 1: Selection of a path changes the future output", () => {
        const scenarios = generateScenarios(mockBaseline, CATEGORIES)
        const baseline = scenarios.find(s => s.type === 'baseline')!
        const rapido = scenarios.find(s => s.type === 'aggressive')!

        const portfolioBaseline = {
            mainGoalId: "g1",
            goals: [{ id: "g1", title: "Test", targetCents: 1000000, createdAt: "" }],
            activeRhythm: {
                type: baseline.type,
                label: baseline.label,
                intensity: 0,
                benefitCents: 0,
                activatedAt: ""
            }
        }

        const portfolioRapido = {
            ...portfolioBaseline,
            activeRhythm: {
                type: rapido.type,
                label: rapido.label,
                intensity: 1.0,
                benefitCents: 50000, // +500€ benefit
                activatedAt: ""
            }
        }

        const metricsBaseline = calculatePortfolioProjections(portfolioBaseline, {
            currentFreeCashFlow: mockBaseline.averageMonthlyIncome - mockBaseline.averageMonthlyExpenses,
            historicalVariability: mockBaseline.expensesStdDev
        })

        const metricsRapido = calculatePortfolioProjections(portfolioRapido, {
            currentFreeCashFlow: mockBaseline.averageMonthlyIncome - mockBaseline.averageMonthlyExpenses,
            historicalVariability: mockBaseline.expensesStdDev
        })

        expect(metricsRapido.projections[0].projection.likelyDate.getTime())
            .toBeLessThan(metricsBaseline.projections[0].projection.likelyDate.getTime())
    })

    it("Requirement 3: No budgeting concepts are exposed in labels/descriptions", () => {
        const scenarios = generateScenarios(mockBaseline, CATEGORIES)
        const forbiddenWords = ["budget", "risparmio", "savings", "percentuale", "%", "taglio", "cut", "spesa mensile", "fcf", "surplus"]

        scenarios.forEach(s => {
            const text = `${s.label} ${s.description}`.toLowerCase()
            forbiddenWords.forEach(word => {
                expect(text).not.toContain(word)
            })
        })
    })
})
