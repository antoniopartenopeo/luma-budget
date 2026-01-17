import { storage } from "@/lib/storage-utils"
import { Category, CATEGORIES } from "../config"

export const CATEGORIES_STORAGE_KEY = "luma_categories_v1"

export interface CategoriesStorage {
    version: 1
    categories: Category[]
    updatedAt: string
}

// Internal cache
let categoriesCache: Category[] | null = null

export function generateCategoryId(): string {
    if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID()
    }
    return Math.random().toString(36).substring(2, 11)
}

/**
 * Loads categories from storage with migration and seed logic
 */
export async function ensureCategoriesCache(): Promise<Category[]> {
    if (categoriesCache) return categoriesCache

    const stored = storage.get<CategoriesStorage | Category[] | null>(CATEGORIES_STORAGE_KEY, null)
    let finalCategories: Category[] = []
    let needsSync = false

    if (!stored) {
        // SEED: Empty storage
        finalCategories = [...CATEGORIES]
        needsSync = true
    } else if (Array.isArray(stored)) {
        // MIGRATION: Old format (just array)
        finalCategories = stored.map(c => ({
            ...c,
            archived: (c as Partial<Category>).archived ?? false,
            iconName: (c as Partial<Category>).iconName || "helpCircle"
        }) as Category)
        needsSync = true
    } else if (stored.version === 1) {
        // CURRENT: Version 1
        finalCategories = stored.categories

        // Check for missing default categories (safety)
        const existingIds = new Set(finalCategories.map(c => c.id))
        const missingDefaults = CATEGORIES.filter(c => !existingIds.has(c.id))

        if (missingDefaults.length > 0) {
            finalCategories = [...finalCategories, ...missingDefaults]
            needsSync = true
        }
    } else {
        // UNKNOWN VERSION: Fallback to seed
        finalCategories = [...CATEGORIES]
        needsSync = true
    }

    categoriesCache = finalCategories

    if (needsSync) {
        await syncCategoriesToStorage(finalCategories)
    }

    return finalCategories
}

/**
 * Persists categories to storage
 */
async function syncCategoriesToStorage(categories: Category[]): Promise<void> {
    const payload: CategoriesStorage = {
        version: 1,
        categories,
        updatedAt: new Date().toISOString()
    }
    storage.set(CATEGORIES_STORAGE_KEY, payload)
}

/**
 * Public API
 */

export async function getCategories(): Promise<Category[]> {
    return ensureCategoriesCache()
}

export async function upsertCategory(category: Category): Promise<Category[]> {
    const current = await ensureCategoriesCache()
    const index = current.findIndex(c => c.id === category.id)

    let next: Category[]
    if (index >= 0) {
        next = [...current]
        next[index] = { ...category, updatedAt: new Date().toISOString() }
    } else {
        next = [...current, { ...category, archived: false, updatedAt: new Date().toISOString() }]
    }

    categoriesCache = next
    await syncCategoriesToStorage(next)
    return next
}

export async function archiveCategory(id: string): Promise<Category[]> {
    const current = await ensureCategoriesCache()
    const next = current.map(c =>
        c.id === id ? { ...c, archived: true, updatedAt: new Date().toISOString() } : c
    )

    categoriesCache = next
    await syncCategoriesToStorage(next)
    return next
}

export async function unarchiveCategory(id: string): Promise<Category[]> {
    const current = await ensureCategoriesCache()
    const next = current.map(c =>
        c.id === id ? { ...c, archived: false, updatedAt: new Date().toISOString() } : c
    )

    categoriesCache = next
    await syncCategoriesToStorage(next)
    return next
}

export async function resetCategoriesToDefault(): Promise<Category[]> {
    categoriesCache = [...CATEGORIES]
    await syncCategoriesToStorage(categoriesCache)
    return categoriesCache
}

// For cross-tab sync
export function __resetCategoriesCache() {
    categoriesCache = null
}
