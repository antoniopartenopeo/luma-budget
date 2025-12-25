/**
 * Superfluous Expense Classification Logic Tests
 * 
 * Tests the core logic for determining isSuperfluous and classificationSource
 * when creating or updating transactions.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { CATEGORIES } from '@/features/categories/config'

// Helper function extracted for testing
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

        it('should have correct spendingNature for essential expense categories', () => {
            const essentialExpenseCategories = [
                // Original essential categories
                'cibo', 'trasporti', 'casa', 'salute', 'istruzione',
                // New essential expense categories
                'utenze', 'auto', 'assicurazioni', 'tasse', 'famiglia',
                'servizi-domestici', 'lavoro-essenziale'
            ]

            essentialExpenseCategories.forEach(catId => {
                const cat = CATEGORIES.find(c => c.id === catId)
                expect(cat?.spendingNature, `Category ${catId} should be essential`).toBe('essential')
            })
        })

        it('should have correct spendingNature for comfort categories', () => {
            const comfortCategories = [
                // Original comfort categories
                'shopping', 'viaggi', 'investimenti',
                // New comfort categories
                'ristoranti', 'benessere', 'hobby-sport', 'abbonamenti',
                'animali', 'tecnologia', 'regali', 'arredo', 'formazione-extra'
            ]

            comfortCategories.forEach(catId => {
                const cat = CATEGORIES.find(c => c.id === catId)
                expect(cat?.spendingNature, `Category ${catId} should be comfort`).toBe('comfort')
            })
        })

        it('should have correct spendingNature for superfluous categories', () => {
            const superfluousCategories = [
                // Original superfluous categories
                'svago', 'altro',
                // New superfluous categories
                'micro-digitali', 'lusso', 'giochi-scommesse', 'extra-impulsivi'
            ]

            superfluousCategories.forEach(catId => {
                const cat = CATEGORIES.find(c => c.id === catId)
                expect(cat?.spendingNature, `Category ${catId} should be superfluous`).toBe('superfluous')
            })
        })

        it('should have all income categories with spendingNature essential', () => {
            const incomeCategories = [
                'stipendio', 'pensione', 'freelance', 'bonus', 'affitti',
                'rendite', 'vendite', 'rimborsi', 'regali-ricevuti',
                'cashback', 'entrate-occasionali'
            ]

            incomeCategories.forEach(catId => {
                const cat = CATEGORIES.find(c => c.id === catId)
                expect(cat?.spendingNature, `Income category ${catId} should be essential`).toBe('essential')
                expect(cat?.kind, `Category ${catId} should be income`).toBe('income')
            })
        })

        it('should have all expense categories with kind expense', () => {
            const expenseCategories = [
                // Original
                'cibo', 'trasporti', 'casa', 'svago', 'salute', 'shopping',
                'viaggi', 'istruzione', 'investimenti', 'altro',
                // New essential
                'utenze', 'auto', 'assicurazioni', 'tasse', 'famiglia',
                'servizi-domestici', 'lavoro-essenziale',
                // New comfort
                'ristoranti', 'benessere', 'hobby-sport', 'abbonamenti',
                'animali', 'tecnologia', 'regali', 'arredo', 'formazione-extra',
                // New superfluous
                'micro-digitali', 'lusso', 'giochi-scommesse', 'extra-impulsivi'
            ]

            expenseCategories.forEach(catId => {
                const cat = CATEGORIES.find(c => c.id === catId)
                expect(cat?.kind, `Category ${catId} should be expense`).toBe('expense')
            })
        })
    })
})
