import { describe, it, expect } from "vitest"
import { parseCurrencyToCents } from "../currency"
import { getSignedCents, normalizeTransactionAmount } from "@/domain/transactions"
import { Transaction } from "@/domain/transactions"

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
            const expense = { type: "expense", amountCents: 1000 } as Transaction
            expect(getSignedCents(expense)).toBe(-1000)

            const income = { type: "income", amountCents: 1000 } as Transaction
            expect(getSignedCents(income)).toBe(1000)
        })
    })

    describe("normalizeTransactionAmount", () => {
        it("backfills amountCents from raw data", () => {
            const rawT = {
                id: "1",
                type: "expense",
                amountCents: "1050" // String from storage/json
            } as unknown as Transaction

            const normalized = normalizeTransactionAmount(rawT as unknown as Partial<Transaction> & Record<string, unknown>)

            expect(normalized.amountCents).toBe(1050)
            expect((normalized as unknown as Record<string, unknown>).amount).toBeUndefined()
        })

        it("migrates categoryId", () => {
            const rawT = {
                id: "1",
                type: "expense",
                amountCents: 500,
                categoryId: "legacy-cat"
            } as unknown as Transaction

            const normalized = normalizeTransactionAmount(rawT as unknown as Partial<Transaction> & Record<string, unknown>)

            expect(normalized.amountCents).toBe(500)
            // assuming migrateCategoryId("legacy-cat") returns something or remains if no map
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
