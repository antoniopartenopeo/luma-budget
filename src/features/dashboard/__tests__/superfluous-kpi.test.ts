/**
 * Dashboard KPI "Spese Superflue" Tests
 * 
 * Tests the calculation logic for the superfluous expenses percentage
 * displayed on the dashboard.
 */

import { describe, it, expect } from 'vitest'
import { Transaction } from '@/features/transactions/api/types'

import { calculateSuperfluousMetrics } from '@/features/transactions/utils/transactions-logic'
import { parseCurrencyToCents } from '@/domain/money'

// Helper to create mock transactions
const createMockTransaction = (
    id: string,
    amount: string,
    type: 'expense' | 'income',
    isSuperfluous: boolean = false
): Transaction => {
    const amountCents = parseCurrencyToCents(amount)
    return {
        id,
        amount,
        amountCents,
        date: 'Test date',
        description: 'Test transaction',
        category: 'Test',
        categoryId: 'test',
        type,
        timestamp: Date.now(),
        isSuperfluous,
        classificationSource: 'ruleBased'
    }
}

describe('Dashboard Superfluous KPI Calculation', () => {

    describe('Percentage Calculation', () => {

        it('should calculate correct percentage with 1 superfluous out of 3 expenses', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '-€100.00', 'expense', false),
                createMockTransaction('2', '-€100.00', 'expense', true),  // superfluous
                createMockTransaction('3', '-€100.00', 'expense', false),
            ]

            const result = calculateSuperfluousMetrics(transactions)

            expect(result.superfluousSpentCents).toBe(10000)
            expect(result.totalSpentCents).toBe(30000)
            expect(result.percentage).toBe(33) // 1/3 * 100 = 33.33... rounded to 33
        })

        it('should return 0% when no expenses exist', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '+€1000.00', 'income', false),
            ]

            const result = calculateSuperfluousMetrics(transactions)

            expect(result.superfluousSpentCents).toBe(0)
            expect(result.totalSpentCents).toBe(0)
            expect(result.percentage).toBe(0)
        })

        it('should return 0% when no superfluous expenses exist', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '-€100.00', 'expense', false),
                createMockTransaction('2', '-€200.00', 'expense', false),
            ]

            const result = calculateSuperfluousMetrics(transactions)

            expect(result.superfluousSpentCents).toBe(0)
            expect(result.totalSpentCents).toBe(30000)
            expect(result.percentage).toBe(0)
        })

        it('should return 100% when all expenses are superfluous', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '-€100.00', 'expense', true),
                createMockTransaction('2', '-€200.00', 'expense', true),
            ]

            const result = calculateSuperfluousMetrics(transactions)

            expect(result.superfluousSpentCents).toBe(30000)
            expect(result.totalSpentCents).toBe(30000)
            expect(result.percentage).toBe(100)
        })
    })

    describe('Amount Calculation Consistency', () => {

        it('should correctly sum superfluous expense amounts for numerator', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '-€50.00', 'expense', true),
                createMockTransaction('2', '-€75.50', 'expense', true),
                createMockTransaction('3', '-€100.00', 'expense', false),
            ]

            const result = calculateSuperfluousMetrics(transactions)

            expect(result.superfluousSpentCents).toBe(12550)
        })

        it('should correctly sum all expense amounts for denominator', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '-€50.00', 'expense', true),
                createMockTransaction('2', '-€75.50', 'expense', false),
                createMockTransaction('3', '-€100.00', 'expense', false),
            ]

            const result = calculateSuperfluousMetrics(transactions)

            expect(result.totalSpentCents).toBe(22550)
        })

        it('should ignore income transactions in calculations', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '-€100.00', 'expense', true),
                createMockTransaction('2', '+€1000.00', 'income', false), // should be ignored
                createMockTransaction('3', '-€100.00', 'expense', false),
            ]

            const result = calculateSuperfluousMetrics(transactions)

            expect(result.totalSpentCents).toBe(20000)
            expect(result.superfluousSpentCents).toBe(10000)
            expect(result.percentage).toBe(50)
        })
    })

    describe('Edge Cases', () => {

        it('should handle empty transaction array', () => {
            const result = calculateSuperfluousMetrics([])

            expect(result.superfluousSpentCents).toBe(0)
            expect(result.totalSpentCents).toBe(0)
            expect(result.percentage).toBe(0)
        })

        it('should handle transactions with missing isSuperfluous (treat as false)', () => {
            const transactionWithoutFlag = {
                id: '1',
                amount: '-€100.00',
                amountCents: -10000,
                date: 'Test',
                description: 'Legacy transaction',
                category: 'Test',
                categoryId: 'test',
                type: 'expense' as const,
                timestamp: Date.now(),
                // isSuperfluous is undefined (legacy data)
            } as Transaction

            const result = calculateSuperfluousMetrics([transactionWithoutFlag])

            expect(result.superfluousSpentCents).toBe(0) // undefined treated as falsy
            expect(result.totalSpentCents).toBe(10000)
            expect(result.percentage).toBe(0)
        })
    })
})
