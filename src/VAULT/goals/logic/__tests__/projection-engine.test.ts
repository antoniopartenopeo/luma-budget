
import { projectGoalReachability } from "../projection-engine"
import { ProjectionInput } from "../../types"
import { describe, test, expect } from "vitest"

describe("Projection Engine Logic", () => {

    // Helper to extract months for easier assertions
    const getMonths = (input: ProjectionInput) => {
        const result = projectGoalReachability(input)
        return {
            min: result.minMonths,
            likely: result.likelyMonths,
            max: result.maxMonths,
            reachable: result.canReach
        }
    }

    test("REGRESSION: Small Goal (1000€) with Positive FCF should be reachable", () => {
        // Scenario: 1000€ Goal, 200€ Monthly FCF, Low Variability (50€)
        const input: ProjectionInput = {
            goalTarget: 100000, // 1000€
            currentFreeCashFlow: 20000, // 200€
            historicalVariability: 5000 // 50€
        }

        const res = getMonths(input)

        expect(res.reachable).toBe(true)
        expect(res.likely).toBe(5) // 1000 / 200 = 5 months
        expect(res.max).toBeLessThan(12) // Should definitely not be > 10 years
        expect(res.min).toBeLessThan(res.likely) // Optimistic (200+50=250) -> 4 months
    })

    test("Unreachable if FCF is Zero", () => {
        const input: ProjectionInput = {
            goalTarget: 100000,
            currentFreeCashFlow: 0,
            historicalVariability: 0
        }
        const result = projectGoalReachability(input)
        const res = getMonths(input)
        expect(res.reachable).toBe(false)
        expect(res.likely).toBe(0)
        expect(result.unreachableReason).toContain("nullo o negativo")
    })

    test("Unreachable if FCF is Negative", () => {
        const input: ProjectionInput = {
            goalTarget: 100000,
            currentFreeCashFlow: -5000,
            historicalVariability: 0
        }
        const res = getMonths(input)
        expect(res.reachable).toBe(false)
    })

    test("High Variability should widen the range (Prudent vs Optimistic)", () => {
        const baseInput: ProjectionInput = {
            goalTarget: 100000, // 1000€
            currentFreeCashFlow: 20000, // 200€
            historicalVariability: 0 // No var
        }

        const highVarInput: ProjectionInput = {
            ...baseInput,
            historicalVariability: 10000 // 100€ (50% of FCF!)
        }

        const baseRes = getMonths(baseInput)
        const varRes = getMonths(highVarInput)

        // Likely should be same (average metrics)
        expect(baseRes.likely).toBe(varRes.likely)

        // Optimistic: 200+100=300 -> 3.3 months (4)
        // Prudent: 200-100=100 -> 10 months
        expect(varRes.min).toBeLessThan(baseRes.min) // Faster in best case? 
        // Base: 200 -> 5 months. 
        // HighVar Optimistic: 300 -> 4 months. Correct.

        expect(varRes.max).toBeGreaterThan(baseRes.max) // Slower in worst case
        // Base: 200 -> 5 months.
        // HighVar Prudent: 100 -> 10 months. Correct.
    })

    test("Extreme Case: Prudent Scenario becomes Negative due to Variability", () => {
        // FCF 100, Var 150. Prudent = -50.
        const input: ProjectionInput = {
            goalTarget: 100000,
            currentFreeCashFlow: 10000,
            historicalVariability: 15000
        }

        const res = getMonths(input)

        expect(res.reachable).toBe(true) // Still reachable via likely scenario
        // But max date should be capped or handled safely
        expect(res.max).toBeGreaterThan(res.likely)
        // Logic says if prudent <= 0, max = likely * 2
        expect(res.max).toBe(res.likely * 2)
    })
})
