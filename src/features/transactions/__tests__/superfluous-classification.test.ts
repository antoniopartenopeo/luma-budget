/**
 * Superfluous Expense Classification Logic Tests
 * 
 * Tests the core logic for determining isSuperfluous and classificationSource
 * when creating or updating transactions.
 */

import { describe, it, expect } from "vitest"
import { CATEGORIES } from '@/features/categories/config'
import { CategoryIds } from "@/domain/categories"

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
            const result = classifyTransaction(CategoryIds.SVAGO_EXTRA, 'expense')

            expect(result.isSuperfluous).toBe(true)
            expect(result.classificationSource).toBe('ruleBased')
        })

        it('should mark expense with spendingNature="essential" as NOT superfluous (ruleBased)', () => {
            const result = classifyTransaction(CategoryIds.CIBO, 'expense')

            expect(result.isSuperfluous).toBe(false)
            expect(result.classificationSource).toBe('ruleBased')
        })

        it('should mark expense with spendingNature="comfort" as NOT superfluous by default (ruleBased)', () => {
            const result = classifyTransaction(CategoryIds.SHOPPING, 'expense')

            expect(result.isSuperfluous).toBe(false)
            expect(result.classificationSource).toBe('ruleBased')
        })

        it('should ALWAYS mark income as NOT superfluous regardless of category', () => {
            const result = classifyTransaction(CategoryIds.SVAGO_EXTRA, 'income')

            expect(result.isSuperfluous).toBe(false)
            expect(result.classificationSource).toBe('ruleBased')
        })
    })

    describe('Manual Override', () => {

        it('should allow manual override to mark non-superfluous category as superfluous', () => {
            const result = classifyTransaction(CategoryIds.CIBO, 'expense', {
                isSuperfluous: true,
                classificationSource: 'manual'
            })

            expect(result.isSuperfluous).toBe(true)
            expect(result.classificationSource).toBe('manual')
        })

        it('should allow manual override to unmark superfluous category', () => {
            const result = classifyTransaction(CategoryIds.SVAGO_EXTRA, 'expense', {
                isSuperfluous: false,
                classificationSource: 'manual'
            })

            expect(result.isSuperfluous).toBe(false)
            expect(result.classificationSource).toBe('manual')
        })
    })

    describe('Legacy/Incomplete Data Handling', () => {

        it('should handle unknown categoryId gracefully (treat as NOT superfluous)', () => {
            const result = classifyTransaction('unknown-category-id', 'expense')

            expect(result.isSuperfluous).toBe(false)
            expect(result.classificationSource).toBe('ruleBased')
        })
    })

    describe('Category spendingNature Configuration', () => {

        it('should have correct spendingNature for essential expense categories', () => {
            const essentialExpenseCategories = [
                CategoryIds.CIBO, CategoryIds.AFFITTO_MUTUO, CategoryIds.UTENZE,
                CategoryIds.TRASPORTI, CategoryIds.AUTO_CARBURANTE, CategoryIds.SALUTE_FARMACIA,
                CategoryIds.ISTRUZIONE, CategoryIds.ASSICURAZIONI, CategoryIds.TASSE,
                CategoryIds.FAMIGLIA, CategoryIds.TELEFONIA_INTERNET, CategoryIds.MANUTENZIONE_CASA,
                CategoryIds.SPESE_CONDOMINIALI, CategoryIds.RATE_PRESTITI, CategoryIds.ALTRO_ESSENZIALE
            ]

            essentialExpenseCategories.forEach(catId => {
                const cat = CATEGORIES.find(c => c.id === catId)
                expect(cat?.spendingNature, `Category ${catId} should be essential`).toBe('essential')
                expect(cat?.kind, `Category ${catId} should be expense`).toBe('expense')
            })
        })

        it('should have correct spendingNature for comfort categories', () => {
            const comfortCategories = [
                CategoryIds.RISTORANTI, CategoryIds.BAR_CAFFE, CategoryIds.ABBONAMENTI,
                CategoryIds.SHOPPING, CategoryIds.VIAGGI, CategoryIds.HOBBY_SPORT,
                CategoryIds.BENESSERE, CategoryIds.ANIMALI, CategoryIds.TECNOLOGIA,
                CategoryIds.REGALI, CategoryIds.CASA_ARREDO, CategoryIds.LIBRI_CULTURA,
                CategoryIds.GIARDINAGGIO, CategoryIds.AUTO_MANUTENZIONE, CategoryIds.ALTRO_COMFORT
            ]

            comfortCategories.forEach(catId => {
                const cat = CATEGORIES.find(c => c.id === catId)
                expect(cat?.spendingNature, `Category ${catId} should be comfort`).toBe('comfort')
                expect(cat?.kind, `Category ${catId} should be expense`).toBe('expense')
            })
        })

        it('should have correct spendingNature for superfluous categories', () => {
            const superfluousCategories = [
                CategoryIds.SVAGO_EXTRA, CategoryIds.MICRO_DIGITALI, CategoryIds.LUSSO,
                CategoryIds.GIOCHI_SCOMMESSE, CategoryIds.EXTRA_IMPULSIVI, CategoryIds.TABACCO_VAPE,
                CategoryIds.LOTTERIE, CategoryIds.ALCOOL_EXTRA, CategoryIds.FAST_FOOD, CategoryIds.ALTRO_SUPERFLUO
            ]

            superfluousCategories.forEach(catId => {
                const cat = CATEGORIES.find(c => c.id === catId)
                expect(cat?.spendingNature, `Category ${catId} should be superfluous`).toBe('superfluous')
                expect(cat?.kind, `Category ${catId} should be expense`).toBe('expense')
            })
        })

        it('should have all income categories with kind income', () => {
            const incomeCategories = [
                CategoryIds.STIPENDIO, CategoryIds.PENSIONE, CategoryIds.FREELANCE,
                CategoryIds.BONUS_PREMI, CategoryIds.AFFITTI_PERCEPITI, CategoryIds.INVESTIMENTI_PROFITTI,
                CategoryIds.VENDITE_USATO, CategoryIds.RIMBORSI, CategoryIds.REGALI_RICEVUTI,
                CategoryIds.CASHBACK_PUNTI, CategoryIds.ENTRATE_OCCASIONALI
            ]

            incomeCategories.forEach(catId => {
                const cat = CATEGORIES.find(c => c.id === catId)
                expect(cat?.kind, `Category ${catId} should be income`).toBe('income')
            })
        })
    })
})
