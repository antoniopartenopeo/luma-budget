/**
 * Safe utility for localStorage access with SSR support and error handling.
 */
export const STORAGE_MUTATION_EVENT = "numa:storage-mutation"

export interface StorageMutationDetail {
    key: string
    operation: "set" | "remove"
}

function emitStorageMutation(detail: StorageMutationDetail): void {
    if (typeof window === "undefined") return
    window.dispatchEvent(new CustomEvent<StorageMutationDetail>(STORAGE_MUTATION_EVENT, { detail }))
}

export const storage = {
    get: <T>(key: string, defaultValue: T): T => {
        if (typeof window === "undefined" || !window.localStorage) {
            return defaultValue
        }
        try {
            const item = localStorage.getItem(key)
            if (item === null) return defaultValue
            return JSON.parse(item) as T
        } catch (e) {
            console.error(`Error reading key "${key}" from localStorage`, e)
            return defaultValue
        }
    },

    set: <T>(key: string, value: T): void => {
        if (typeof window === "undefined" || !window.localStorage) {
            return
        }
        try {
            localStorage.setItem(key, JSON.stringify(value))
            emitStorageMutation({ key, operation: "set" })
        } catch (e) {
            console.error(`Error writing key "${key}" to localStorage`, e)
        }
    },

    remove: (key: string): void => {
        if (typeof window === "undefined" || !window.localStorage) {
            return
        }
        try {
            localStorage.removeItem(key)
            emitStorageMutation({ key, operation: "remove" })
        } catch (e) {
            console.error(`Error removing key "${key}" from localStorage`, e)
        }
    }
}
