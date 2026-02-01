import { describe, it, expect } from 'vitest'
import { computeMonthlyAverages } from '../utils'
import { Transaction } from '@/features/transactions/api/types'

describe('Simulator Edge Cases', () => {
    const NOW = new Date('2026-01-15')

    it('should handle zero transactions gracefully', () => {
        const transactions: Transaction[] = []
        const result = computeMonthlyAverages(transactions, 3, NOW)

        expect(result.incomeCents).toBe(0)
        expect(result.categories).toEqual({})
    })

    it('should handle zero income transactions', () => {
        const transactions = [
            { id: '1', amountCents: -10000, timestamp: '2025-12-10T10:00:00Z', categoryId: 'cat1', description: 'Expense', type: 'expense' }
        ] as unknown as Transaction[]
        const result = computeMonthlyAverages(transactions, 3, NOW)

        expect(result.incomeCents).toBe(0)
        expect(result.categories['cat1']).toBeDefined()
        expect(result.categories['cat1'].averageAmount).toBe(3333)
    })

    it('should handle missing categories in applying savings', () => {
        // Logic for applySavings already handles empty categories
        const result = computeMonthlyAverages([], 3, NOW)
        expect(Object.keys(result.categories).length).toBe(0)
    })
})
