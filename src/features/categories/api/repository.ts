import { storage } from "@/lib/storage-utils"
import { Category, CATEGORIES } from "../config"
import { migrateCategoryId } from "@/domain/categories/migration"

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
    } else {
        let rawCategories: Category[] = []
        if (Array.isArray(stored)) {
            rawCategories = stored
            needsSync = true
        } else if (stored.version === 1) {
            rawCategories = stored.categories
        }

        // Migrate IDs and Sync Metadata with Deduplication
        const migratedMap = new Map<string, Category>()

        rawCategories.forEach(c => {
            const migratedId = migrateCategoryId(c.id)
            if (migratedId !== c.id) needsSync = true

            // Find in current defaults to sync metadata (labels, colors, icons)
            const defaultCat = CATEGORIES.find(d => d.id === migratedId)

            let finalCat: Category
            if (defaultCat) {
                // If it was a system category, ensure it has latest metadata
                finalCat = {
                    ...c,
                    ...defaultCat,
                    id: migratedId,
                    archived: c.archived ?? defaultCat.archived
                }
            } else {
                finalCat = {
                    ...c,
                    id: migratedId,
                    archived: c.archived ?? false,
                    iconName: c.iconName || "helpCircle"
                }
            }

            // Deduplication: If multiple legacy IDs map to same new ID, we keep one.
            // We give priority to non-archived versions if they exist.
            const existing = migratedMap.get(migratedId)
            if (!existing || (existing.archived && !finalCat.archived)) {
                migratedMap.set(migratedId, finalCat)
            }
        })

        finalCategories = Array.from(migratedMap.values())

        // Add missing default categories
        const existingIds = new Set(finalCategories.map(c => c.id))
        const missingDefaults = CATEGORIES.filter(c => !existingIds.has(c.id))

        if (missingDefaults.length > 0) {
            finalCategories = [...finalCategories, ...missingDefaults]
            needsSync = true
        }
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
