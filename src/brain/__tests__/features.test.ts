import { describe, expect, it } from "vitest"
import { buildBrainDataset } from "@/brain/features"

function ts(isoDate: string): number {
    return new Date(isoDate).getTime()
}

describe("buildBrainDataset", () => {
    it("builds real monthly samples and inference input from transactions", () => {
        const categories = [
            { id: "rent", spendingNature: "essential" as const },
            { id: "food", spendingNature: "comfort" as const },
            { id: "fun", spendingNature: "superfluous" as const },
        ]

        const transactions = [
            { type: "income" as const, amountCents: 300000, categoryId: "income", timestamp: ts("2026-01-03") },
            { type: "expense" as const, amountCents: 120000, categoryId: "rent", timestamp: ts("2026-01-05") },
            { type: "expense" as const, amountCents: 40000, categoryId: "food", timestamp: ts("2026-01-10") },
            { type: "expense" as const, amountCents: 20000, categoryId: "fun", isSuperfluous: true, timestamp: ts("2026-01-15") },

            { type: "income" as const, amountCents: 305000, categoryId: "income", timestamp: ts("2026-02-03") },
            { type: "expense" as const, amountCents: 125000, categoryId: "rent", timestamp: ts("2026-02-05") },
            { type: "expense" as const, amountCents: 43000, categoryId: "food", timestamp: ts("2026-02-10") },
            { type: "expense" as const, amountCents: 25000, categoryId: "fun", isSuperfluous: true, timestamp: ts("2026-02-16") },

            { type: "income" as const, amountCents: 308000, categoryId: "income", timestamp: ts("2026-03-03") },
            { type: "expense" as const, amountCents: 124000, categoryId: "rent", timestamp: ts("2026-03-05") },
            { type: "expense" as const, amountCents: 41000, categoryId: "food", timestamp: ts("2026-03-11") },
            { type: "expense" as const, amountCents: 28000, categoryId: "fun", isSuperfluous: true, timestamp: ts("2026-03-15") },
        ]

        const dataset = buildBrainDataset(transactions, categories)

        expect(dataset.months).toBe(3)
        expect(dataset.samples).toHaveLength(1)
        expect(dataset.nowcastSamples.length).toBeGreaterThan(0)
        expect(dataset.samples[0].x).toHaveLength(5)
        expect(dataset.inferenceInput?.period).toBe("2026-03")
        expect(dataset.currentMonthInferenceInput?.period).toBe("2026-03")
        expect(dataset.inferenceInput?.values).toHaveLength(5)
        expect(dataset.fingerprint.startsWith("brain-v2-")).toBe(true)
    })

    it("builds bootstrap sample also with a single real month", () => {
        const categories = [
            { id: "food", spendingNature: "comfort" as const },
            { id: "fun", spendingNature: "superfluous" as const },
        ]

        const transactions = [
            { type: "income" as const, amountCents: 220000, categoryId: "income", timestamp: ts("2026-05-03") },
            { type: "expense" as const, amountCents: 50000, categoryId: "food", timestamp: ts("2026-05-11") },
            { type: "expense" as const, amountCents: 12000, categoryId: "fun", isSuperfluous: true, timestamp: ts("2026-05-18") },
        ]

        const dataset = buildBrainDataset(transactions, categories)

        expect(dataset.months).toBe(1)
        expect(dataset.samples).toHaveLength(1)
        expect(dataset.nowcastSamples).toHaveLength(0)
        expect(dataset.inferenceInput?.period).toBe("2026-05")
        expect(dataset.currentMonthInferenceInput?.period).toBe("2026-05")
        expect(dataset.inferenceInput?.values).toHaveLength(5)
    })
})
