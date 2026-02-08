import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getCategories, __resetCategoriesCache, CATEGORIES_STORAGE_KEY } from '../repository'
import { CategoryIds } from '@/domain/categories'

describe('Category Repository Migration & Deduplication', () => {
    beforeEach(() => {
        __resetCategoriesCache()
        // Mock localStorage
        let store: Record<string, string> = {}
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key) => store[key] || null),
            setItem: vi.fn((key, value) => { store[key] = value }),
            removeItem: vi.fn((key) => { delete store[key] }),
            clear: vi.fn(() => { store = {} }),
        })
    })

    it('should deduplicate categories when multiple legacy IDs map to the same new ID', async () => {
        // "casa" maps to "affitto_mutuo"
        // If storage has both "casa" and "affitto_mutuo", we should only have ONE "affitto_mutuo" in the end
        const legacyData = [
            { id: 'casa', label: 'Old Casa', kind: 'expense', archived: false },
            { id: 'affitto_mutuo', label: 'New Affitto', kind: 'expense', archived: false }
        ]

        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify({
            version: 1,
            categories: legacyData,
            updatedAt: new Date().toISOString()
        }))

        const categories = await getCategories()

        const affittoEntries = categories.filter(c => c.id === CategoryIds.AFFITTO_MUTUO)
        expect(affittoEntries).toHaveLength(1)
    })

    it('should prioritize non-archived versions during deduplication', async () => {
        // Both map to "affitto_mutuo"
        const legacyData = [
            { id: 'casa', label: 'Old Casa', kind: 'expense', archived: true },
            { id: 'affitto_mutuo', label: 'New Affitto', kind: 'expense', archived: false }
        ]

        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify({
            version: 1,
            categories: legacyData,
            updatedAt: new Date().toISOString()
        }))

        const categories = await getCategories()

        const affitto = categories.find(c => c.id === CategoryIds.AFFITTO_MUTUO)
        expect(affitto?.archived).toBe(false)
    })
})
