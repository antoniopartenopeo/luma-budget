/**
 * Transaction Filter Tests for Superfluous Expenses
 * 
 * Tests the filtering logic used on the Transactions page
 * to filter superfluous expenses.
 */

import { describe, it, expect } from 'vitest'
import { Transaction } from '@/features/transactions/api/types'

// Mock the filtering logic from TransactionsPage
const filterTransactions = (
    transactions: Transaction[],
    filters: {
        searchQuery?: string
        selectedType?: string
        selectedCategory?: string
        isWantsFilter?: boolean
    }
): Transaction[] => {
    const { searchQuery = '', selectedType = 'all', selectedCategory = 'all', isWantsFilter = false } = filters

    return transactions.filter((transaction) => {
        const matchesSearch = transaction.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
            transaction.amount.includes(searchQuery)

        const matchesType =
            selectedType === "all" || transaction.type === selectedType

        const matchesCategory =
            selectedCategory === "all" || transaction.categoryId === selectedCategory

        // "Wants" filter uses isSuperfluous flag
        const matchesWants = !isWantsFilter || !!transaction.isSuperfluous

        if (!matchesWants) return false

        return matchesSearch && matchesType && matchesCategory
    })
}

// Helper to create mock transactions
const createMockTransaction = (
    id: string,
    description: string,
    categoryId: string,
    type: 'expense' | 'income',
    isSuperfluous: boolean = false
): Transaction => ({
    id,
    amount: type === 'expense' ? '-€100.00' : '+€100.00',
    date: 'Test date',
    description,
    category: categoryId,
    categoryId,
    icon: '💰',
    type,
    timestamp: Date.now(),
    isSuperfluous,
    classificationSource: 'ruleBased'
})

describe('Transaction Superfluous Filter', () => {

    const mockTransactions: Transaction[] = [
        createMockTransaction('1', 'Netflix Subscription', 'svago', 'expense', true),
        createMockTransaction('2', 'Grocery Shopping', 'cibo', 'expense', false),
        createMockTransaction('3', 'Cinema Ticket', 'svago', 'expense', true),
        createMockTransaction('4', 'Monthly Salary', 'altro', 'income', false),
        createMockTransaction('5', 'Random Purchase', 'altro', 'expense', true),
    ]

    describe('Solo spese superflue Filter', () => {

        it('should show only transactions with isSuperfluous=true when filter is active', () => {
            const result = filterTransactions(mockTransactions, { isWantsFilter: true })

            expect(result.length).toBe(3)
            expect(result.every(t => t.isSuperfluous)).toBe(true)
        })

        it('should show all transactions when filter is NOT active', () => {
            const result = filterTransactions(mockTransactions, { isWantsFilter: false })

            expect(result.length).toBe(5)
        })
    })

    describe('Combined Filters', () => {

        it('should combine superfluous filter with type filter', () => {
            // Superfluous + expenses only
            const result = filterTransactions(mockTransactions, {
                isWantsFilter: true,
                selectedType: 'expense'
            })

            expect(result.length).toBe(3)
            expect(result.every(t => t.isSuperfluous && t.type === 'expense')).toBe(true)
        })

        it('should combine superfluous filter with category filter', () => {
            // Superfluous + svago category
            const result = filterTransactions(mockTransactions, {
                isWantsFilter: true,
                selectedCategory: 'svago'
            })

            expect(result.length).toBe(2)
            expect(result.every(t => t.isSuperfluous && t.categoryId === 'svago')).toBe(true)
        })

        it('should combine superfluous filter with search query', () => {
            const result = filterTransactions(mockTransactions, {
                isWantsFilter: true,
                searchQuery: 'Netflix'
            })

            expect(result.length).toBe(1)
            expect(result[0].description).toBe('Netflix Subscription')
        })

        it('should combine all filters together', () => {
            const result = filterTransactions(mockTransactions, {
                isWantsFilter: true,
                selectedType: 'expense',
                selectedCategory: 'svago',
                searchQuery: 'Cinema'
            })

            expect(result.length).toBe(1)
            expect(result[0].description).toBe('Cinema Ticket')
        })
    })

    describe('Empty State', () => {

        it('should return empty array when no superfluous transactions exist', () => {
            const nonSuperfluousTransactions = [
                createMockTransaction('1', 'Test 1', 'cibo', 'expense', false),
                createMockTransaction('2', 'Test 2', 'trasporti', 'expense', false),
            ]

            const result = filterTransactions(nonSuperfluousTransactions, { isWantsFilter: true })

            expect(result.length).toBe(0)
        })

        it('should return empty array when filter combination yields no results', () => {
            const result = filterTransactions(mockTransactions, {
                isWantsFilter: true,
                selectedCategory: 'nonexistent'
            })

            expect(result.length).toBe(0)
        })
    })

    describe('Income Transactions', () => {

        it('should not include income transactions even if they somehow have isSuperfluous=true', () => {
            const incomeWithSuperfluous = [
                createMockTransaction('1', 'Bonus', 'altro', 'income', true), // edge case
            ]

            const result = filterTransactions(incomeWithSuperfluous, {
                isWantsFilter: true,
                selectedType: 'expense'
            })

            expect(result.length).toBe(0)
        })
    })
})
