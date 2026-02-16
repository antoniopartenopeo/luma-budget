import { describe, expect, test } from "vitest"

import { AdvisorFacts } from "@/domain/narration"

import { deriveRealtimeOverlaySignal } from "../realtime-overlay"

function createFacts(overrides: Partial<AdvisorFacts> = {}): AdvisorFacts {
    return {
        baseBalanceCents: 300000,
        predictedRemainingCurrentMonthExpensesCents: 60000,
        predictedTotalEstimatedBalanceCents: 240000,
        primarySource: "brain",
        historicalMonthsCount: 4,
        subscriptionCount: 2,
        subscriptionTotalYearlyCents: 120000,
        ...overrides
    }
}

describe("realtime-overlay", () => {
    test("disables overlay when flag is off", () => {
        const overlay = deriveRealtimeOverlaySignal({
            flagEnabled: false,
            forecast: {
                predictedRemainingCurrentMonthExpensesCents: 40000,
                primarySource: "brain",
                confidence: "high"
            },
            facts: createFacts(),
            brainSignal: { isReady: true },
            avgMonthlyExpensesCents: 100000
        })

        expect(overlay.enabled).toBe(false)
        expect(overlay.capacityFactor).toBe(1)
        expect(overlay.shortTermMonths).toBe(0)
    })

    test("applies prudential reduction under high remaining load", () => {
        const overlay = deriveRealtimeOverlaySignal({
            flagEnabled: true,
            forecast: {
                predictedRemainingCurrentMonthExpensesCents: 120000,
                primarySource: "brain",
                confidence: "high"
            },
            facts: createFacts(),
            brainSignal: { isReady: true },
            avgMonthlyExpensesCents: 100000
        })

        expect(overlay.enabled).toBe(true)
        expect(overlay.capacityFactor).toBeLessThan(1)
    })

    test("allows mild uplift when remaining load is low and confidence is high", () => {
        const overlay = deriveRealtimeOverlaySignal({
            flagEnabled: true,
            forecast: {
                predictedRemainingCurrentMonthExpensesCents: 10000,
                primarySource: "brain",
                confidence: "high"
            },
            facts: createFacts(),
            brainSignal: { isReady: true },
            avgMonthlyExpensesCents: 100000
        })

        expect(overlay.capacityFactor).toBeGreaterThan(1)
        expect(overlay.capacityFactor).toBeLessThanOrEqual(1.05)
    })

    test("falls back to shorter realtime impact strength when source is fallback", () => {
        const brainOverlay = deriveRealtimeOverlaySignal({
            flagEnabled: true,
            forecast: {
                predictedRemainingCurrentMonthExpensesCents: 110000,
                primarySource: "brain",
                confidence: "high"
            },
            facts: createFacts(),
            brainSignal: { isReady: true },
            avgMonthlyExpensesCents: 100000
        })
        const fallbackOverlay = deriveRealtimeOverlaySignal({
            flagEnabled: true,
            forecast: {
                predictedRemainingCurrentMonthExpensesCents: 110000,
                primarySource: "fallback",
                confidence: "high"
            },
            facts: createFacts({ primarySource: "fallback" }),
            brainSignal: { isReady: false },
            avgMonthlyExpensesCents: 100000
        })

        expect(fallbackOverlay.capacityFactor).toBeGreaterThan(brainOverlay.capacityFactor)
        expect(fallbackOverlay.shortTermMonths).toBe(2)
    })

    test("extends window to 3 months only when brain signal is strong", () => {
        const strongBrain = deriveRealtimeOverlaySignal({
            flagEnabled: true,
            forecast: {
                predictedRemainingCurrentMonthExpensesCents: 50000,
                primarySource: "brain",
                confidence: "high"
            },
            facts: createFacts({ historicalMonthsCount: 3 }),
            brainSignal: { isReady: true },
            avgMonthlyExpensesCents: 100000
        })
        const mediumConfidence = deriveRealtimeOverlaySignal({
            flagEnabled: true,
            forecast: {
                predictedRemainingCurrentMonthExpensesCents: 50000,
                primarySource: "brain",
                confidence: "medium"
            },
            facts: createFacts({ historicalMonthsCount: 5 }),
            brainSignal: { isReady: true },
            avgMonthlyExpensesCents: 100000
        })

        expect(strongBrain.shortTermMonths).toBe(3)
        expect(mediumConfidence.shortTermMonths).toBe(2)
    })
})
