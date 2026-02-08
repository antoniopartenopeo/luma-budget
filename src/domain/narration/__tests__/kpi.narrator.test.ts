import { describe, it, expect } from "vitest"
import { narrateKPI } from "../kpi.narrator"
import { deriveKPIState } from "../derive-state"
import { KPIFacts } from "../types"

describe("kpi.narrator", () => {
    describe("deriveKPIState", () => {
        it("derives critical state for negative tone", () => {
            const facts: KPIFacts = {
                kpiId: "balance",
                valueFormatted: "-€100",
                tone: "negative"
            }
            expect(deriveKPIState(facts)).toBe("critical")
        })

        it("derives attention state for warning tone", () => {
            const facts: KPIFacts = {
                kpiId: "superfluous",
                valueFormatted: "15%",
                tone: "warning"
            }
            expect(deriveKPIState(facts)).toBe("attention")
        })

        it("derives good state for positive tone", () => {
            const facts: KPIFacts = {
                kpiId: "budget",
                valueFormatted: "€500",
                tone: "positive"
            }
            expect(deriveKPIState(facts)).toBe("good")
        })

        it("derives neutral state for default", () => {
            const facts: KPIFacts = {
                kpiId: "expenses",
                valueFormatted: "€1.000",
                tone: "neutral"
            }
            expect(deriveKPIState(facts)).toBe("neutral")
        })

        it("derives attention for budget near limit if tone is missing", () => {
            const facts: KPIFacts = {
                kpiId: "budget",
                valueFormatted: "€50",
                percent: 5 // 5% remaining
            }
            expect(deriveKPIState(facts)).toBe("attention")
        })
    })

    describe("narrateKPI", () => {
        it("generates critical message for negative balance", () => {
            const facts: KPIFacts = {
                kpiId: "balance",
                valueFormatted: "-€500",
                tone: "negative"
            }
            const state = deriveKPIState(facts)
            const result = narrateKPI(facts, state)
            expect(result.text).toContain("negativo")
            expect(result.text).toContain("correttiva")
        })

        it("generates attention message for superfluous slightly over target", () => {
            const facts: KPIFacts = {
                kpiId: "superfluous",
                valueFormatted: "12%",
                percent: 12,
                targetPercent: 10,
                tone: "warning"
            }
            const state = deriveKPIState(facts)
            const result = narrateKPI(facts, state)
            expect(result.text).toContain("12%")
            expect(result.text).toContain("10%")
        })

        it("generates good message for controlled budget", () => {
            const facts: KPIFacts = {
                kpiId: "budget",
                valueFormatted: "€800",
                tone: "positive"
            }
            const state = deriveKPIState(facts)
            const result = narrateKPI(facts, state)
            expect(result.text).toContain("margine")
        })

        it("generates neutral message when budget is not configured", () => {
            const facts: KPIFacts = {
                kpiId: "budget",
                valueFormatted: "—",
                tone: "neutral"
            }
            const state = deriveKPIState(facts)
            const result = narrateKPI(facts, state)
            expect(result.text).toContain("Pianifica un budget")
        })
    })
})
