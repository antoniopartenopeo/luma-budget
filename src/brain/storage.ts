import { migrateBrainSnapshot } from "./model"
import { NeuralBrainSnapshot } from "./types"

const BRAIN_STORAGE_KEY = "numa_neural_core_v1"

let memorySnapshot: NeuralBrainSnapshot | null = null

function hasLocalStorage(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function migrateInMemorySnapshot(): NeuralBrainSnapshot | null {
    const migrated = migrateBrainSnapshot(memorySnapshot)
    memorySnapshot = migrated
    return migrated
}

export function loadBrainSnapshot(): NeuralBrainSnapshot | null {
    if (!hasLocalStorage()) return migrateInMemorySnapshot()

    try {
        const raw = window.localStorage.getItem(BRAIN_STORAGE_KEY)
        if (!raw) return migrateInMemorySnapshot()

        const parsed = JSON.parse(raw)
        const migrated = migrateBrainSnapshot(parsed)
        if (!migrated) return migrateInMemorySnapshot()

        memorySnapshot = migrated

        const serializedMigrated = JSON.stringify(migrated)
        if (raw !== serializedMigrated) {
            window.localStorage.setItem(BRAIN_STORAGE_KEY, serializedMigrated)
        }

        return migrated
    } catch {
        return migrateInMemorySnapshot()
    }
}

export function saveBrainSnapshot(snapshot: NeuralBrainSnapshot): void {
    memorySnapshot = snapshot
    if (!hasLocalStorage()) return

    try {
        window.localStorage.setItem(BRAIN_STORAGE_KEY, JSON.stringify(snapshot))
    } catch {
        // Ignore quota/storage failures and keep in-memory fallback.
    }
}

export function resetBrainSnapshot(): void {
    memorySnapshot = null
    if (!hasLocalStorage()) return

    try {
        window.localStorage.removeItem(BRAIN_STORAGE_KEY)
    } catch {
        // noop
    }
}
