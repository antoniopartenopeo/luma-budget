import { migrateBrainSnapshot } from "./model"
import { NeuralBrainSnapshot } from "./types"
import { STORAGE_KEY_BRAIN_SNAPSHOT } from "@/lib/storage-keys"
import { STORAGE_MUTATION_EVENT, type StorageMutationDetail } from "@/lib/storage-utils"

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
        const raw = window.localStorage.getItem(STORAGE_KEY_BRAIN_SNAPSHOT)
        if (!raw) return migrateInMemorySnapshot()

        const parsed = JSON.parse(raw)
        const migrated = migrateBrainSnapshot(parsed)
        if (!migrated) return migrateInMemorySnapshot()

        memorySnapshot = migrated

        const serializedMigrated = JSON.stringify(migrated)
        if (raw !== serializedMigrated) {
            window.localStorage.setItem(STORAGE_KEY_BRAIN_SNAPSHOT, serializedMigrated)
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
        window.localStorage.setItem(STORAGE_KEY_BRAIN_SNAPSHOT, JSON.stringify(snapshot))
        window.dispatchEvent(new CustomEvent<StorageMutationDetail>(STORAGE_MUTATION_EVENT, {
            detail: {
                key: STORAGE_KEY_BRAIN_SNAPSHOT,
                operation: "set",
            },
        }))
    } catch {
        // Ignore quota/storage failures and keep in-memory fallback.
    }
}

export function resetBrainSnapshot(): void {
    memorySnapshot = null
    if (!hasLocalStorage()) return

    try {
        window.localStorage.removeItem(STORAGE_KEY_BRAIN_SNAPSHOT)
        window.dispatchEvent(new CustomEvent<StorageMutationDetail>(STORAGE_MUTATION_EVENT, {
            detail: {
                key: STORAGE_KEY_BRAIN_SNAPSHOT,
                operation: "remove",
            },
        }))
    } catch {
        // noop
    }
}
