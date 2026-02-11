import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchDashboardSummary } from '../repository'
import { createBatchTransactions, __resetTransactionsCache } from '@/features/transactions/api/repository'
import { calculateDateRangeLocal } from '@/lib/date-ranges'

// Mock dependencies
vi.mock('@/lib/delay', () => ({
    delay: vi.fn(() => Promise.resolve())
}))

// Mock storage to avoid side effects
vi.mock('@/lib/storage-utils', () => ({
    storage: {
        get: vi.fn(() => ({})),
        set: vi.fn()
    }
}))

// Mock Budget repository
vi.mock('@/VAULT/budget/api/repository', () => ({
    fetchBudget: vi.fn(() => Promise.resolve({
        globalBudgetAmount: 1000,
        groups: {}
    }))
}))


describe('Dashboard Calculation Regression Test', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        __resetTransactionsCache()
    })

    it('should include transactions at local month boundaries and exclude outside values', async () => {
        const { startDate, endDate } = calculateDateRangeLocal("2024-01", 1)
        const atStart = new Date(startDate.getTime()).toISOString()
        const atEnd = new Date(endDate.getTime()).toISOString()
        const outOfRange = new Date(endDate.getTime() + 1).toISOString()

        const txs = [
            // Start boundary (inclusive)
            {
                description: 'Start Boundary',
                amountCents: 1000, // 10.00
                type: 'income' as const,
                category: 'Test',
                categoryId: 'test',
                date: atStart,
                classificationSource: 'manual' as const
            },
            // End boundary (inclusive)
            {
                description: 'End Boundary',
                amountCents: 500, // 5.00
                type: 'expense' as const,
                category: 'Test',
                categoryId: 'test',
                date: atEnd,
                classificationSource: 'manual' as const
            },
            // Out of range (exclusive)
            {
                description: 'Out of Range',
                amountCents: 9999,
                type: 'expense' as const,
                category: 'Test',
                categoryId: 'test',
                date: outOfRange,
                classificationSource: 'manual' as const
            }
        ]

        await createBatchTransactions(txs)

        const filter = {
            mode: 'month' as const,
            period: '2024-01'
        }

        const summary = await fetchDashboardSummary(filter)

        // Income: 10.00 (Filtered)
        expect(summary.totalIncome).toBe(10)
        // Spent: 5.00 (Should include End Boundary, Exclude OutOfRange)
        expect(summary.totalSpent).toBe(5)

        // Net Balance is GLOBAL (All Time).
        // 10 (Inc) - 5 (Exp) - 99.99 (Exp Feb 1) = -94.99
        expect(summary.netBalance).toBe(-94.99)
    })

    it('should correctly sum negative expenses (Absolute Storage invariant)', async () => {
        // Ensure that even if we send negative amountCents in DTO (which shouldn't happen but...)
        // createBatchTransactions forces Math.abs().

        await createBatchTransactions([{
            description: 'Negative Input',
            amountCents: -2000,
            type: 'expense',
            category: 'Test',
            categoryId: 'test',
            date: '2024-01-15T12:00:00Z',
            classificationSource: 'manual'
        }])

        const summary = await fetchDashboardSummary({ mode: 'month', period: '2024-01' })

        // Should be +20.00 spent
        expect(summary.totalSpent).toBe(20)
        expect(summary.netBalance).toBe(-20)
    })
})
