import { createNewBrainSnapshot, isSnapshotCompatible } from "./model"
import { loadBrainSnapshot, resetBrainSnapshot, saveBrainSnapshot } from "./storage"
import { NeuralBrainSnapshot } from "./types"

export function getBrainSnapshot(): NeuralBrainSnapshot | null {
    const snapshot = loadBrainSnapshot()
    if (!snapshot) return null
    if (!isSnapshotCompatible(snapshot)) return null
    return snapshot
}

export function initializeBrain(): NeuralBrainSnapshot {
    const existing = getBrainSnapshot()
    if (existing) return existing

    const newborn = createNewBrainSnapshot()
    saveBrainSnapshot(newborn)
    return newborn
}

export function resetBrain(): void {
    resetBrainSnapshot()
}

