import { describe, it, expect } from "vitest"
import { calculateSharePct, calculateGrowthPct, calculateUtilizationPct, sumExpensesInCents } from "../math"
import { Transaction } from "@/domain/transactions"

describe("financial-math", () => {
    describe("calculateSharePct", () => {
        it("calcs correct percentage", () => {
            expect(calculateSharePct(50, 200)).toBe(25)
            expect(calculateSharePct(1, 3)).toBe(33) // 33.33 -> 33
        })
        it("handles zero total", () => {
            expect(calculateSharePct(100, 0)).toBe(0)
        })
    })

    describe("calculateGrowthPct", () => {
        it("calcs positive growth", () => {
            expect(calculateGrowthPct(150, 100)).toBe(50)
        })
        it("calcs negative growth", () => {
            expect(calculateGrowthPct(80, 100)).toBe(-20)
        })
        it("handles zero baseline", () => {
            expect(calculateGrowthPct(100, 0)).toBe(100)
            expect(calculateGrowthPct(0, 0)).toBe(0)
        })
    })

    describe("calculateUtilizationPct", () => {
        it("calcs budget usage", () => {
            expect(calculateUtilizationPct(5000, 10000)).toBe(50)
        })
        it("handles zero budget", () => {
            expect(calculateUtilizationPct(5000, 0)).toBe(0)
        })
    })

    describe("sumExpensesInCents", () => {
        const txs = [
            { type: "expense", amountCents: 1000 },
            { type: "expense", amountCents: -500 }, // Should treat absolute
            { type: "income", amountCents: 2000 },  // Should ignore
            { type: "expense", amountCents: 250 },
        ] as Transaction[]

        it("sums absolute values of expenses only", () => {
            expect(sumExpensesInCents(txs)).toBe(1750) // 1000 + 500 + 250
        })
    })
})
