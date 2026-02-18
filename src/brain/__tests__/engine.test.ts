import { afterEach, describe, expect, it } from "vitest"
import { evolveBrainFromHistory } from "@/brain/engine"
import { initializeBrain, resetBrain } from "@/brain/core"

function ts(isoDate: string): number {
    return new Date(isoDate).getTime()
}

const categories = [
    { id: "rent", spendingNature: "essential" as const },
    { id: "food", spendingNature: "comfort" as const },
    { id: "fun", spendingNature: "superfluous" as const },
]

const transactions = [
    { type: "income" as const, amountCents: 300000, categoryId: "income", timestamp: ts("2026-01-03") },
    { type: "expense" as const, amountCents: 120000, categoryId: "rent", timestamp: ts("2026-01-05") },
    { type: "expense" as const, amountCents: 42000, categoryId: "food", timestamp: ts("2026-01-12") },
    { type: "expense" as const, amountCents: 20000, categoryId: "fun", isSuperfluous: true, timestamp: ts("2026-01-18") },

    { type: "income" as const, amountCents: 302000, categoryId: "income", timestamp: ts("2026-02-03") },
    { type: "expense" as const, amountCents: 121000, categoryId: "rent", timestamp: ts("2026-02-05") },
    { type: "expense" as const, amountCents: 41000, categoryId: "food", timestamp: ts("2026-02-12") },
    { type: "expense" as const, amountCents: 22000, categoryId: "fun", isSuperfluous: true, timestamp: ts("2026-02-18") },

    { type: "income" as const, amountCents: 306000, categoryId: "income", timestamp: ts("2026-03-03") },
    { type: "expense" as const, amountCents: 122000, categoryId: "rent", timestamp: ts("2026-03-05") },
    { type: "expense" as const, amountCents: 44000, categoryId: "food", timestamp: ts("2026-03-12") },
    { type: "expense" as const, amountCents: 25000, categoryId: "fun", isSuperfluous: true, timestamp: ts("2026-03-18") },

    { type: "income" as const, amountCents: 307000, categoryId: "income", timestamp: ts("2026-04-03") },
    { type: "expense" as const, amountCents: 123000, categoryId: "rent", timestamp: ts("2026-04-05") },
    { type: "expense" as const, amountCents: 43000, categoryId: "food", timestamp: ts("2026-04-12") },
    { type: "expense" as const, amountCents: 24000, categoryId: "fun", isSuperfluous: true, timestamp: ts("2026-04-18") },
]

function generateDenseHistory(startYear: number, startMonth: number, monthCount: number) {
    const dense: Array<{
        type: "income" | "expense"
        amountCents: number
        categoryId: string
        timestamp: number
        isSuperfluous?: boolean
    }> = []

    for (let offset = 0; offset < monthCount; offset++) {
        const monthDate = new Date(startYear, startMonth - 1 + offset, 1)
        const year = monthDate.getFullYear()
        const month = monthDate.getMonth() + 1
        const mm = String(month).padStart(2, "0")

        dense.push({
            type: "income",
            amountCents: 320000 + offset * 2500,
            categoryId: "income",
            timestamp: ts(`${year}-${mm}-02`),
        })

        for (let i = 0; i < 12; i++) {
            const day = String(4 + i * 2).padStart(2, "0")
            dense.push({
                type: "expense",
                amountCents: 9000 + (i % 4) * 1500 + offset * 90,
                categoryId: i % 3 === 0 ? "rent" : i % 3 === 1 ? "food" : "fun",
                isSuperfluous: i % 3 === 2,
                timestamp: ts(`${year}-${mm}-${day}`),
            })
        }
    }

    return dense
}

describe("evolveBrainFromHistory", () => {
    afterEach(() => {
        resetBrain()
    })

    it("trains on real historical dataset and persists a learned snapshot", async () => {
        initializeBrain()
        const result = await evolveBrainFromHistory(transactions, categories)

        expect(result.reason).toBe("trained")
        expect(result.didTrain).toBe(true)
        expect(result.epochsRun).toBeGreaterThan(0)
        expect(result.sampleCount).toBeGreaterThanOrEqual(2)
        expect(result.snapshot).not.toBeNull()
        expect(result.snapshot?.trainedSamples).toBeGreaterThan(0)
        expect(result.snapshot?.currentMonthHead).toBeDefined()
        expect(result.monthsAnalyzed).toBe(4)
        expect(result.predictedCurrentMonthRemainingExpensesCents).toBeGreaterThanOrEqual(0)
        expect(result.currentMonthNowcastConfidence).toBeGreaterThanOrEqual(0)
        expect(result.currentMonthNowcastReady).toBeTypeOf("boolean")
        expect(result.nextMonthReliability.sampleCount).toBeGreaterThanOrEqual(0)
        expect(result.nowcastReliability.sampleCount).toBeGreaterThanOrEqual(0)
        expect(result.nextMonthReliability.mae).toBeGreaterThanOrEqual(0)
        expect(result.nowcastReliability.mae).toBeGreaterThanOrEqual(0)
    })

    it("skips training when fingerprint is unchanged", async () => {
        initializeBrain()
        await evolveBrainFromHistory(transactions, categories)
        const second = await evolveBrainFromHistory(transactions, categories)

        expect(second.reason).toBe("no-new-data")
        expect(second.didTrain).toBe(false)
        expect(second.predictedCurrentMonthRemainingExpensesCents).toBeGreaterThanOrEqual(0)
    })

    it("returns uninitialized when core is missing", async () => {
        const result = await evolveBrainFromHistory(transactions, categories)
        expect(result.reason).toBe("uninitialized")
        expect(result.snapshot).toBeNull()
        expect(result.currentMonthNowcastReady).toBe(false)
        expect(result.nextMonthReliability.sampleCount).toBe(0)
        expect(result.nowcastReliability.sampleCount).toBe(0)
    })

    it("can train with sparse but real data (single-month bootstrap)", async () => {
        initializeBrain()
        const sparseTransactions = [
            { type: "income" as const, amountCents: 180000, categoryId: "income", timestamp: ts("2026-06-03") },
            { type: "expense" as const, amountCents: 70000, categoryId: "rent", timestamp: ts("2026-06-05") },
            { type: "expense" as const, amountCents: 18000, categoryId: "fun", isSuperfluous: true, timestamp: ts("2026-06-12") },
        ]

        const result = await evolveBrainFromHistory(sparseTransactions, categories)

        expect(result.reason).toBe("trained")
        expect(result.didTrain).toBe(true)
        expect(result.sampleCount).toBe(1)
        expect(result.monthsAnalyzed).toBe(1)
        expect(result.currentMonthNowcastReady).toBe(false)
    })

    it("marks current-month nowcast as ready only with sufficient months, samples and confidence", async () => {
        initializeBrain()
        const denseTransactions = generateDenseHistory(2025, 1, 8)

        const result = await evolveBrainFromHistory(denseTransactions, categories)

        expect(result.reason).toBe("trained")
        expect(result.monthsAnalyzed).toBeGreaterThanOrEqual(2)
        expect(result.snapshot?.currentMonthHead.trainedSamples ?? 0).toBeGreaterThanOrEqual(16)
        expect(result.currentMonthNowcastConfidence).toBeGreaterThanOrEqual(0.55)
        expect(result.currentMonthNowcastReady).toBe(true)
        expect(result.predictedCurrentMonthRemainingExpensesCents).toBeGreaterThanOrEqual(0)
    })
})
