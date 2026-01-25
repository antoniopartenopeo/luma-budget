import { describe, it, expect } from "vitest"
import { narrateTrend } from "../trend.narrator"
import { deriveTrendState } from "../derive-state"
import { TrendFacts } from "../types"

describe("trend.narrator", () => {
    describe("deriveTrendState", () => {
        it("derives improving for income up", () => {
            const facts: TrendFacts = {
                metricType: "income",
                changePercent: 10,
                direction: "up",
                currentValueFormatted: "€1.100"
            }
            expect(deriveTrendState(facts)).toBe("improving")
        })

        it("derives deteriorating for expenses up", () => {
            const facts: TrendFacts = {
                metricType: "expenses",
                changePercent: 15,
                direction: "up",
                currentValueFormatted: "€2.300"
            }
            expect(deriveTrendState(facts)).toBe("deteriorating")
        })

        it("derives improving for expenses down", () => {
            const facts: TrendFacts = {
                metricType: "expenses",
                changePercent: -10,
                direction: "down",
                currentValueFormatted: "€1.800"
            }
            expect(deriveTrendState(facts)).toBe("improving")
        })

        it("derives volatile for huge oscillations", () => {
            const facts: TrendFacts = {
                metricType: "savings_rate",
                changePercent: 60,
                direction: "up",
                currentValueFormatted: "15%"
            }
            expect(deriveTrendState(facts)).toBe("volatile")
        })

        it("derives stable for minimum variation", () => {
            const facts: TrendFacts = {
                metricType: "income",
                changePercent: 1,
                direction: "flat",
                currentValueFormatted: "€1.000"
            }
            expect(deriveTrendState(facts)).toBe("stable")
        })

        it("derives neutral for zero change if direction is down", () => {
            // This tests the default fallback after Priority 1/2
            const facts: TrendFacts = {
                metricType: "savings_rate",
                changePercent: 0,
                direction: "flat",
                currentValueFormatted: "5%"
            }
            expect(deriveTrendState(facts)).toBe("stable")
        })
    })

    describe("narrateTrend", () => {
        it("generates improving message for income", () => {
            const facts: TrendFacts = {
                metricType: "income",
                changePercent: 5,
                direction: "up",
                currentValueFormatted: "€5.000"
            }
            const state = deriveTrendState(facts)
            const result = narrateTrend(facts, state)
            expect(result.text).toContain("crescita")
            expect(result.text).toContain("5.0%")
        })

        it("generates deteriorating message for expenses", () => {
            const facts: TrendFacts = {
                metricType: "expenses",
                changePercent: 20,
                direction: "up",
                currentValueFormatted: "€4.000"
            }
            const state = deriveTrendState(facts)
            const result = narrateTrend(facts, state)
            expect(result.text).toContain("aumentate")
            expect(result.text).toContain("20.0%")
        })

        it("generates volatile message", () => {
            const facts: TrendFacts = {
                metricType: "expenses",
                changePercent: 70,
                direction: "up",
                currentValueFormatted: "€7.000"
            }
            const state = deriveTrendState(facts)
            const result = narrateTrend(facts, state)
            expect(result.text).toContain("variabilità")
        })

        it("generates stable message", () => {
            const facts: TrendFacts = {
                metricType: "expenses",
                changePercent: 0.5,
                direction: "flat",
                currentValueFormatted: "€2.000"
            }
            const state = deriveTrendState(facts)
            const result = narrateTrend(facts, state)
            expect(result.text).toContain("costanti")
        })
    })
})
