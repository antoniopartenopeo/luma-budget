import { describe, it, expect } from "vitest"
import { CategoryIds } from "../types"
import { CATEGORIES } from "../defaults"
import { migrateCategoryId, LEGACY_CATEGORY_ID_MAP } from "../migration"

describe("Category Registry Integrity", () => {
    it("should have a default entry for every CategoryId", () => {
        const registeredIds = new Set(Object.values(CategoryIds))
        const definedIds = new Set(CATEGORIES.map(c => c.id))

        registeredIds.forEach(id => {
            expect(definedIds.has(id)).toBe(true)
        })
    })

    it("should not have duplicate category IDs in defaults", () => {
        const ids = CATEGORIES.map(c => c.id)
        const uniqueIds = new Set(ids)
        expect(ids.length).toBe(uniqueIds.size)
    })

    it("should not have duplicate category labels in defaults", () => {
        const labels = CATEGORIES.map(c => c.label)
        const uniqueLabels = new Set(labels)
        expect(labels.length).toBe(uniqueLabels.size)
    })

    it("should have valid spendingNature for all expenses", () => {
        CATEGORIES.filter(c => c.kind === "expense").forEach(c => {
            expect(["essential", "comfort", "superfluous"]).toContain(c.spendingNature)
        })
    })
})

describe("Category Migration Integrity", () => {
    it("should be idempotent (migrating a new ID returns itself)", () => {
        Object.values(CategoryIds).forEach(id => {
            expect(migrateCategoryId(id)).toBe(id)
        })
    })

    it("should map all legacy IDs to existing current IDs", () => {
        const currentIds = new Set(Object.values(CategoryIds))

        Object.entries(LEGACY_CATEGORY_ID_MAP).forEach(([legacyId, newId]) => {
            expect(currentIds.has(newId as any)).toBe(true)
            expect(legacyId).not.toBe(newId)
        })
    })
})
