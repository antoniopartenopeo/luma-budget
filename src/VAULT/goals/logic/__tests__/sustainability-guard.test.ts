
import { checkScenarioSustainability } from "../sustainability-guard"

import { describe, test, expect } from "vitest"

describe("Sustainability Guard Logic (Granular)", () => {
    // Standard inputs
    const income = 200000 // 2000€
    const essential = 100000 // 1000€
    const essentialSavings = 0 // Not testing reductions here, testing FCF

    test("SECURE: Should be secure if buffer > 20%", () => {
        // Essential 1000, Total Expenses 1500 (Goal needs 0 for this check, looking at FCF)
        // FCF = 500 (25% of 2000)

        const result = checkScenarioSustainability(
            income,
            essential,
            essentialSavings,
            150000
        )

        expect(result.status).toBe("secure")
        expect(result.isSustainable).toBe(true)
        expect(result.reason).toBeNull()
    })

    test("SUSTAINABLE: Should be sustainable if buffer between 10% and 20%", () => {
        // FCF = 300 (15% of 2000) -> Expenses 1700
        const result = checkScenarioSustainability(
            income,
            essential,
            essentialSavings,
            170000
        )

        expect(result.status).toBe("sustainable")
        expect(result.isSustainable).toBe(true)
    })

    test("FRAGILE: Should be fragile if buffer < 10% but positive", () => {
        // FCF = 100 (5% of 2000) -> Expenses 1900
        const result = checkScenarioSustainability(
            income,
            essential,
            essentialSavings,
            190000
        )

        expect(result.status).toBe("fragile")
        // In Phase 2 requirements: Orientation calculated (so technically workable), 
        // but strictly "isSustainable" flag might define if we recommend it.
        // User requirements say "Sustainability protects but doesn't judge".
        // The type definition says isSustainable is true only for secure/sustainable.
        expect(result.isSustainable).toBe(false)
        expect(result.reason).toContain("ridotto")
    })

    test("UNSAFE: Should be unsafe if Free Cash Flow is negative", () => {
        // Expenses 2100 -> FCF -100
        const result = checkScenarioSustainability(
            income,
            essential,
            essentialSavings,
            210000
        )

        expect(result.status).toBe("unsafe")
        expect(result.isSustainable).toBe(false)
    })
})
