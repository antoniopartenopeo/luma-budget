/**
 * Superfluous Expense Classification Logic Tests
 * 
 * Tests the core logic for determining isSuperfluous and classificationSource
 * when creating or updating transactions.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { CATEGORIES } from '@/features/categories/config'

// Helper function extracted from mock-data.ts for testing
const isSuperfluousRule = (categoryId: string, type: "income" | "expense"): boolean => {
    if (type === "income") return false
    const cat = CATEGORIES.find(c => c.id === categoryId)
    return cat?.spendingNature === "superfluous"
}

// Simulate the classification logic from createTransaction
const classifyTransaction = (
    categoryId: string,
    type: "income" | "expense",
    manualOverride?: { isSuperfluous: boolean; classificationSource: "manual" }
): { isSuperfluous: boolean; classificationSource: "ruleBased" | "manual" } => {
    // If manual override passed, respect it
    if (manualOverride?.classificationSource === "manual" && manualOverride.isSuperfluous !== undefined) {
        return {
            isSuperfluous: manualOverride.isSuperfluous,
            classificationSource: "manual"
        }
    }

    // Apply rule-based classification
    return {
        isSuperfluous: isSuperfluousRule(categoryId, type),
        classificationSource: "ruleBased"
    }
}

describe('Superfluous Expense Classification Logic', () => {

    describe('Transaction Type Classification', () => {

        it('should mark expense with spendingNature="superfluous" as superfluous (ruleBased)', () => {
            // "svago" has spendingNature: "superfluous"
            const result = classifyTransaction('svago', 'expense')

            expect(result.isSuperfluous).toBe(true)
            expect(result.classificationSource).toBe('ruleBased')
        })

        it('should mark expense with spendingNature="essential" as NOT superfluous (ruleBased)', () => {
            // "cibo" has spendingNature: "essential"
            const result = classifyTransaction('cibo', 'expense')

            expect(result.isSuperfluous).toBe(false)
            expect(result.classificationSource).toBe('ruleBased')
        })

        it('should mark expense with spendingNature="comfort" as NOT superfluous by default (ruleBased)', () => {
            // "shopping" has spendingNature: "comfort"
            const result = classifyTransaction('shopping', 'expense')

            expect(result.isSuperfluous).toBe(false)
            expect(result.classificationSource).toBe('ruleBased')
        })

        it('should ALWAYS mark income as NOT superfluous regardless of category', () => {
            // Even if category has spendingNature: "superfluous", income should never be superfluous
            const result = classifyTransaction('svago', 'income')

            expect(result.isSuperfluous).toBe(false)
            expect(result.classificationSource).toBe('ruleBased')
        })

        it('should mark income with essential category as NOT superfluous', () => {
            const result = classifyTransaction('cibo', 'income')

            expect(result.isSuperfluous).toBe(false)
            expect(result.classificationSource).toBe('ruleBased')
        })
    })

    describe('Manual Override', () => {

        it('should allow manual override to mark non-superfluous category as superfluous', () => {
            // "cibo" is essential, but user manually marks as superfluous
            const result = classifyTransaction('cibo', 'expense', {
                isSuperfluous: true,
                classificationSource: 'manual'
            })

            expect(result.isSuperfluous).toBe(true)
            expect(result.classificationSource).toBe('manual')
        })

        it('should allow manual override to unmark superfluous category', () => {
            // "svago" is superfluous, but user manually unmarks
            const result = classifyTransaction('svago', 'expense', {
                isSuperfluous: false,
                classificationSource: 'manual'
            })

            expect(result.isSuperfluous).toBe(false)
            expect(result.classificationSource).toBe('manual')
        })

        it('should respect manual override even for comfort categories', () => {
            // "shopping" is comfort, user marks as superfluous
            const result = classifyTransaction('shopping', 'expense', {
                isSuperfluous: true,
                classificationSource: 'manual'
            })

            expect(result.isSuperfluous).toBe(true)
            expect(result.classificationSource).toBe('manual')
        })
    })

    describe('Legacy/Incomplete Data Handling', () => {

        it('should handle unknown categoryId gracefully (treat as NOT superfluous)', () => {
            const result = classifyTransaction('unknown-category-id', 'expense')

            expect(result.isSuperfluous).toBe(false)
            expect(result.classificationSource).toBe('ruleBased')
        })

        it('should handle empty categoryId (treat as NOT superfluous)', () => {
            const result = classifyTransaction('', 'expense')

            expect(result.isSuperfluous).toBe(false)
            expect(result.classificationSource).toBe('ruleBased')
        })
    })

    describe('Category spendingNature Configuration', () => {

        it('should have correct spendingNature for essential categories', () => {
            const essentialCategories = ['cibo', 'trasporti', 'casa', 'salute', 'istruzione']

            essentialCategories.forEach(catId => {
                const cat = CATEGORIES.find(c => c.id === catId)
                expect(cat?.spendingNature).toBe('essential')
            })
        })

        it('should have correct spendingNature for comfort categories', () => {
            const comfortCategories = ['shopping', 'viaggi', 'investimenti']

            comfortCategories.forEach(catId => {
                const cat = CATEGORIES.find(c => c.id === catId)
                expect(cat?.spendingNature).toBe('comfort')
            })
        })

        it('should have correct spendingNature for superfluous categories', () => {
            const superfluousCategories = ['svago', 'altro']

            superfluousCategories.forEach(catId => {
                const cat = CATEGORIES.find(c => c.id === catId)
                expect(cat?.spendingNature).toBe('superfluous')
            })
        })
    })
})
