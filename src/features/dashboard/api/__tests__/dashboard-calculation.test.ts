import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchDashboardSummary } from '../repository'
import { createBatchTransactions, __resetTransactionsCache, createTransaction } from '@/features/transactions/api/repository'
import { BudgetPlan } from "@/VAULT/budget/api/types"

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

    it('should include transactions at the very edges of the month (UTC)', async () => {
        // Test Period: Jan 2024 (2024-01)
        // Range: 2024-01-01 00:00:00 UTC to 2024-01-31 23:59:59.999 UTC

        const txs = [
            // Start Boundary: Jan 1st 00:00:00 UTC
            {
                description: 'Start Boundary',
                amountCents: 1000, // 10.00
                type: 'income' as const,
                category: 'Test',
                categoryId: 'test',
                date: '2024-01-01T00:00:00.000Z',
                classificationSource: 'manual' as const
            },
            // End Boundary: Jan 31st 23:59:59 UTC
            {
                description: 'End Boundary',
                amountCents: 500, // 5.00
                type: 'expense' as const,
                category: 'Test',
                categoryId: 'test',
                date: '2024-01-31T23:59:59.000Z',
                classificationSource: 'manual' as const
            },
            // Out of Range: Feb 1st 00:00:01
            {
                description: 'Out of Range',
                amountCents: 9999,
                type: 'expense' as const,
                category: 'Test',
                categoryId: 'test',
                date: '2024-02-01T00:00:01.000Z',
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
