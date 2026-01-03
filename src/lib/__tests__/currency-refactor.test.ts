import { describe, it, expect } from "vitest"
import { parseCurrencyToCents, getSignedCents, normalizeTransactionAmount, formatCentsSignedFromType } from "../currency-utils"
import { Transaction } from "@/features/transactions/api/types"

describe("Currency Refactor", () => {
    describe("parseCurrencyToCents", () => {
        it("parses diverse formats correctly", () => {
            expect(parseCurrencyToCents("€30,00")).toBe(3000)
            expect(parseCurrencyToCents("€30.00")).toBe(3000)
            expect(parseCurrencyToCents("1.234,56")).toBe(123456)
            expect(parseCurrencyToCents("1,234.56")).toBe(123456)
            expect(parseCurrencyToCents("-€30,00")).toBe(-3000)
            expect(parseCurrencyToCents("15")).toBe(1500)
        })

        it("handles ambiguous cases with heuristics", () => {
            expect(parseCurrencyToCents("1.234")).toBe(123400) // Thousand separator assumption
        })

        it("is robust to garbage input", () => {
            expect(parseCurrencyToCents("abc")).toBe(0)
            expect(parseCurrencyToCents("")).toBe(0)
        })
    })

    describe("getSignedCents", () => {
        it("respects transaction type for sign", () => {
            const expense = { type: "expense", amount: "€10,00", amountCents: 1000 } as Transaction
            expect(getSignedCents(expense)).toBe(-1000)

            const income = { type: "income", amount: "€10,00", amountCents: 1000 } as Transaction
            expect(getSignedCents(income)).toBe(1000)
        })

        it("falls back to parsing if amountCents is missing", () => {
            const expense = { type: "expense", amount: "-€10,00" } as Transaction
            expect(getSignedCents(expense)).toBe(-1000)

            // Even if string is negative, income type forces positive
            const strangeIncome = { type: "income", amount: "-€10,00" } as Transaction
            expect(getSignedCents(strangeIncome)).toBe(1000)
        })
    })

    describe("normalizeTransactionAmount", () => {
        it("backfills amountCents and normalizes string", () => {
            const rawT = {
                id: "1",
                type: "expense",
                amount: "-€ 10.50", // Weird formatting
                // amountCents missing
            } as Transaction

            const normalized = normalizeTransactionAmount(rawT)

            expect(normalized.amountCents).toBe(1050)
            expect(normalized.amount).toBe(formatCentsSignedFromType(1050, "expense")) // Standardized current environment format
        })

        it("prioritizes amountCents if present", () => {
            const rawT = {
                id: "1",
                type: "expense",
                amount: "€0,00", // Wrong string
                amountCents: 500 // Real value
            } as Transaction

            const normalized = normalizeTransactionAmount(rawT)

            expect(normalized.amountCents).toBe(500)
            expect(normalized.amount).toBe(formatCentsSignedFromType(500, "expense")) // String updated to match cents
        })
    })

    describe("Dashboard/Budget Logic Simulation", () => {
        it("calculates salary correctly using integer math", () => {
            const transactions = [
                { type: "income", amountCents: 125033 }, // 1250.33
                { type: "expense", amountCents: 4510 }   // 45.10
            ] as Transaction[]

            const totalIncome = transactions
                .filter(t => t.type === "income")
                .reduce((acc, t) => acc + Math.abs(getSignedCents(t)), 0)

            const totalExpense = transactions
                .filter(t => t.type === "expense")
                .reduce((acc, t) => acc + Math.abs(getSignedCents(t)), 0)

            expect(totalIncome).toBe(125033)
            expect(totalExpense).toBe(4510)

            const balance = (totalIncome - totalExpense) / 100
            expect(balance).toBe(1205.23)
        })
    })
})
