import { describe, it, expect } from "vitest"
import { narrateTrend } from "../trend.narrator"
import { TrendFacts, OrchestrationContext } from "../types"

describe("trend.narrator (Contextualization)", () => {

    // Helper to create valid facts for Improving Savings Rate
    const createImprovingFacts = (): TrendFacts => ({
        metricType: "savings_rate",
        metricId: "savings_rate",
        changePercent: 10,
        direction: "up",
        currentValueFormatted: "15%",
        isSavingsRateNegative: false,
        savingsRateValue: 0.15
    })

    const createDeterioratingFacts = (): TrendFacts => ({
        metricType: "savings_rate",
        metricId: "savings_rate",
        changePercent: -10,
        direction: "down",
        currentValueFormatted: "5%",
        isSavingsRateNegative: false,
        savingsRateValue: 0.05
    })

    it("Scenario: Improving Trend + NO Crisis -> Standard Positive Message", () => {
        const facts = createImprovingFacts()
        const context: OrchestrationContext = { hasHighSeverityCurrentIssue: false }

        const result = narrateTrend(facts, "improving", context)

        expect(result.text).toContain("tasso di risparmio è in aumento")
        expect(result.text).not.toContain("disavanzo") // No warning
    })

    it("Scenario: Improving Trend + HIGH SEVERITY Crisis -> Positive + Warning Context", () => {
        const facts = createImprovingFacts()
        const context: OrchestrationContext = { hasHighSeverityCurrentIssue: true }

        const result = narrateTrend(facts, "improving", context)

        // Main positive message kept
        expect(result.text).toContain("tasso di risparmio è in aumento")
        // Context added
        expect(result.text).toContain("Questo mese però mostra un disavanzo")
        expect(result.text).toContain("priorità è rientrare")
    })

    it("Scenario: Deteriorating Trend + HIGH SEVERITY Crisis -> Negative Message (No added context needed)", () => {
        // If everything is bad, we don't need to say "BUT this month is bad". It's redundant or handled by Deteriorating logic.
        const facts = createDeterioratingFacts()
        const context: OrchestrationContext = { hasHighSeverityCurrentIssue: true }

        const result = narrateTrend(facts, "deteriorating", context)

        // Check filtering: logic shouldn't append the "However..." clause because it's only for improving.
        expect(result.text).not.toContain("Questo mese però mostra un disavanzo")
    })
})
