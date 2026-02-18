import { beforeEach, describe, expect, it } from "vitest"
import { loadBrainSnapshot, resetBrainSnapshot } from "@/brain/storage"

const STORAGE_KEY = "numa_neural_core_v1"

describe("brain storage migration", () => {
    beforeEach(() => {
        resetBrainSnapshot()
        window.localStorage.clear()
    })

    it("migrates legacy snapshot by adding currentMonthHead", () => {
        const legacySnapshot = {
            version: 1,
            featureSchemaVersion: 1,
            weights: [0.1, -0.05, 0.02, 0, 0.03],
            bias: 0.2,
            learningRate: 0.03,
            trainedSamples: 22,
            lossEma: 0.09,
            dataFingerprint: "brain-v1-legacy",
            updatedAt: "2026-02-01T12:00:00.000Z",
        }

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(legacySnapshot))
        const migrated = loadBrainSnapshot()

        expect(migrated).not.toBeNull()
        expect(migrated?.version).toBe(2)
        expect(migrated?.weights).toEqual([...legacySnapshot.weights, 0, 0, 0])
        expect(migrated?.trainedSamples).toBe(legacySnapshot.trainedSamples)
        expect(migrated?.absErrorEma).toBe(0)
        expect(migrated?.currentMonthHead).toBeDefined()
        expect(migrated?.currentMonthHead.trainedSamples).toBe(0)
        expect(migrated?.currentMonthHead.weights).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
        expect(migrated?.currentMonthHead.absErrorEma).toBe(0)

        const persisted = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}")
        expect(persisted.currentMonthHead).toBeDefined()
        expect(persisted.version).toBe(2)
    })
})
