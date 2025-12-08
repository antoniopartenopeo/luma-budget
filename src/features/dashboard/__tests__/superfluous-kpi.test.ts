/**
 * Dashboard KPI "Spese Superflue" Tests
 * 
 * Tests the calculation logic for the superfluous expenses percentage
 * displayed on the dashboard.
 */

import { describe, it, expect } from 'vitest'
import { Transaction } from '@/features/transactions/api/types'

// Mock the KPI calculation logic extracted from dashboard mock-data
const calculateSuperfluousKPI = (transactions: Transaction[]): {
    uselessSpent: number
    totalSpent: number
    uselessSpendPercent: number
} => {
    // Calculate total expenses
    const totalSpent = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g, ""))
            return acc + Math.abs(amount)
        }, 0)

    // Calculate superfluous expenses (using isSuperfluous flag)
    const uselessSpent = transactions
        .filter(t => t.type === 'expense' && t.isSuperfluous)
        .reduce((acc, t) => acc + Math.abs(parseFloat(t.amount.replace(/[^0-9.-]+/g, ""))), 0)

    // Calculate percentage
    const uselessSpendPercent = totalSpent > 0 ? Math.round((uselessSpent / totalSpent) * 100) : 0

    return { uselessSpent, totalSpent, uselessSpendPercent }
}

// Helper to create mock transactions
const createMockTransaction = (
    id: string,
    amount: string,
    type: 'expense' | 'income',
    isSuperfluous: boolean = false
): Transaction => ({
    id,
    amount,
    date: 'Test date',
    description: 'Test transaction',
    category: 'Test',
    categoryId: 'test',
    icon: '💰',
    type,
    timestamp: Date.now(),
    isSuperfluous,
    classificationSource: 'ruleBased'
})

describe('Dashboard Superfluous KPI Calculation', () => {

    describe('Percentage Calculation', () => {

        it('should calculate correct percentage with 1 superfluous out of 3 expenses', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '-€100.00', 'expense', false),
                createMockTransaction('2', '-€100.00', 'expense', true),  // superfluous
                createMockTransaction('3', '-€100.00', 'expense', false),
            ]

            const result = calculateSuperfluousKPI(transactions)

            expect(result.uselessSpent).toBe(100)
            expect(result.totalSpent).toBe(300)
            expect(result.uselessSpendPercent).toBe(33) // 1/3 * 100 = 33.33... rounded to 33
        })

        it('should return 0% when no expenses exist', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '+€1000.00', 'income', false),
            ]

            const result = calculateSuperfluousKPI(transactions)

            expect(result.uselessSpent).toBe(0)
            expect(result.totalSpent).toBe(0)
            expect(result.uselessSpendPercent).toBe(0)
        })

        it('should return 0% when no superfluous expenses exist', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '-€100.00', 'expense', false),
                createMockTransaction('2', '-€200.00', 'expense', false),
            ]

            const result = calculateSuperfluousKPI(transactions)

            expect(result.uselessSpent).toBe(0)
            expect(result.totalSpent).toBe(300)
            expect(result.uselessSpendPercent).toBe(0)
        })

        it('should return 100% when all expenses are superfluous', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '-€100.00', 'expense', true),
                createMockTransaction('2', '-€200.00', 'expense', true),
            ]

            const result = calculateSuperfluousKPI(transactions)

            expect(result.uselessSpent).toBe(300)
            expect(result.totalSpent).toBe(300)
            expect(result.uselessSpendPercent).toBe(100)
        })
    })

    describe('Amount Calculation Consistency', () => {

        it('should correctly sum superfluous expense amounts for numerator', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '-€50.00', 'expense', true),
                createMockTransaction('2', '-€75.50', 'expense', true),
                createMockTransaction('3', '-€100.00', 'expense', false),
            ]

            const result = calculateSuperfluousKPI(transactions)

            expect(result.uselessSpent).toBe(125.50)
        })

        it('should correctly sum all expense amounts for denominator', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '-€50.00', 'expense', true),
                createMockTransaction('2', '-€75.50', 'expense', false),
                createMockTransaction('3', '-€100.00', 'expense', false),
            ]

            const result = calculateSuperfluousKPI(transactions)

            expect(result.totalSpent).toBe(225.50)
        })

        it('should ignore income transactions in calculations', () => {
            const transactions: Transaction[] = [
                createMockTransaction('1', '-€100.00', 'expense', true),
                createMockTransaction('2', '+€1000.00', 'income', false), // should be ignored
                createMockTransaction('3', '-€100.00', 'expense', false),
            ]

            const result = calculateSuperfluousKPI(transactions)

            expect(result.totalSpent).toBe(200)
            expect(result.uselessSpent).toBe(100)
            expect(result.uselessSpendPercent).toBe(50)
        })
    })

    describe('Edge Cases', () => {

        it('should handle empty transaction array', () => {
            const result = calculateSuperfluousKPI([])

            expect(result.uselessSpent).toBe(0)
            expect(result.totalSpent).toBe(0)
            expect(result.uselessSpendPercent).toBe(0)
        })

        it('should handle transactions with missing isSuperfluous (treat as false)', () => {
            const transactionWithoutFlag = {
                id: '1',
                amount: '-€100.00',
                date: 'Test',
                description: 'Legacy transaction',
                category: 'Test',
                categoryId: 'test',
                icon: '💰',
                type: 'expense' as const,
                timestamp: Date.now(),
                // isSuperfluous is undefined (legacy data)
            } as Transaction

            const result = calculateSuperfluousKPI([transactionWithoutFlag])

            expect(result.uselessSpent).toBe(0) // undefined treated as falsy
            expect(result.totalSpent).toBe(100)
            expect(result.uselessSpendPercent).toBe(0)
        })
    })
})
