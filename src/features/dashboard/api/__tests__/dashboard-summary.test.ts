import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchDashboardSummary } from '../repository'
import { __resetTransactionsCache, createTransaction } from '../../../transactions/api/repository'
import { getCurrentPeriod } from "@/VAULT/budget/utils/calculate-budget"
import { upsertBudget, __resetBudgetsCache } from "@/VAULT/budget/api/repository"
import { __resetCategoriesCache } from '../../../categories/api/repository'
import { CategoryIds } from '@/domain/categories'

const DEFAULT_USER_ID = 'user-1'

// Mock storage just in case, though we will rely on repository methods which use storage utils
// We want to ensure clean state.
describe('Dashboard Summary (Real Wiring)', () => {
    // Fixed date: 2025-05-15
    // so "current month" is May 2025 (2025-05)
    // "previous month" is April 2025 (2025-04)
    const FIXED_DATE = new Date(2025, 4, 15, 12, 0, 0) // Month is 0-indexed: 4 = May

    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(FIXED_DATE)
        __resetTransactionsCache()
        __resetBudgetsCache()
        __resetCategoriesCache()

        // Mock localStorage to be an in-memory map for speed and isolation
        let store: Record<string, string> = {}
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key) => store[key] || null),
            setItem: vi.fn((key, value) => { store[key] = value }),
            removeItem: vi.fn((key) => { delete store[key] }),
            clear: vi.fn(() => { store = {} }),
        })
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should calculate summary with real budget and transactions for current month', async () => {
        const currentPeriod = getCurrentPeriod() // Should be "2025-05" due to fake timer

        // 1. Setup real budget (1000€) via Repository
        await upsertBudget(DEFAULT_USER_ID, currentPeriod, {
            period: currentPeriod,
            globalBudgetAmountCents: 100000,
            groupBudgets: []
        })

        // 2. Setup transactions via Repository (triggers logic + backfill implicitly)
        // May 2025 (Current)
        await createTransaction({
            description: 'Expense current month',
            amount: 250.00,
            amountCents: 25000,
            type: 'expense',
            categoryId: CategoryIds.CIBO,
            category: 'Cibo',
            isSuperfluous: false,
            classificationSource: 'manual'
        })

        await createTransaction({
            description: 'Income current month',
            amount: 100.00,
            amountCents: 10000,
            type: 'income',
            categoryId: CategoryIds.ENTRATE_OCCASIONALI,
            category: 'Altro',
            isSuperfluous: false,
            classificationSource: 'manual'
        })

        // April 2025 (Previous)
        vi.setSystemTime(new Date(2025, 3, 15)) // April 15
        await createTransaction({
            description: 'Expense prev month',
            amount: 500.00,
            amountCents: 50000,
            type: 'expense',
            categoryId: CategoryIds.CIBO,
            category: 'Cibo',
            isSuperfluous: false,
            classificationSource: 'manual'
        })

        // Return to "Current"
        vi.setSystemTime(FIXED_DATE)

        // Fetch with filter for CURRENT MONTH
        const summary = await fetchDashboardSummary({ mode: 'month', period: currentPeriod })

        // totalSpent: only current month expense (250)
        expect(summary.totalSpent).toBe(250)
        // totalIncome: only current month income (100)
        expect(summary.totalIncome).toBe(100)

        // netBalance (ALL TIME): income(100) - expenses(250 + 500) = 100 - 750 = -650
        expect(summary.netBalance).toBe(-650)

        // budgetTotal: from budgetPlan (1000)
        expect(summary.budgetTotal).toBe(1000)
        // budgetRemaining: budget (1000) - expenses (250) = 750
        expect(summary.budgetRemaining).toBe(750)
    })

    it('should handle missing budget plan gracefully (budgetTotal = 0)', async () => {
        const currentPeriod = getCurrentPeriod()
        const summary = await fetchDashboardSummary({ mode: 'month', period: currentPeriod })

        expect(summary.budgetTotal).toBe(0)
        expect(summary.budgetRemaining).toBe(0)
        expect(summary.netBalance).toBe(0)
    })

    it('should calculate useless spend percentage correctly for current month', async () => {
        const currentPeriod = getCurrentPeriod()

        await createTransaction({
            description: 'Useful',
            amount: 100.00,
            amountCents: 10000,
            type: 'expense',
            categoryId: CategoryIds.CIBO,
            category: 'Cibo',
            isSuperfluous: false,
            classificationSource: 'manual'
        })

        await createTransaction({
            description: 'Useless',
            amount: 100.00,
            amountCents: 10000,
            type: 'expense',
            categoryId: CategoryIds.SVAGO_EXTRA,
            category: 'Svago',
            isSuperfluous: true,
            classificationSource: 'manual'
        })

        const summary = await fetchDashboardSummary({ mode: 'month', period: currentPeriod })

        // totalSpent = 200, uselessSpent = 100 => 50%
        expect(summary.totalSpent).toBe(200)
        expect(summary.uselessSpendPercent).toBe(50)
    })

    it('should support range filter', async () => {
        const currentPeriod = getCurrentPeriod() // 2025-05

        // T1: May (Current) = 100
        await createTransaction({ amount: 100.00, amountCents: 10000, type: 'expense', description: 'May', categoryId: 'c1', category: 'C1' })

        // T2: April (Prev) = 200
        vi.setSystemTime(new Date(2025, 3, 15))
        await createTransaction({ amount: 200.00, amountCents: 20000, type: 'expense', description: 'Apr', categoryId: 'c1', category: 'C1' })

        // T3: March (Prev-Prev) = 300
        vi.setSystemTime(new Date(2025, 2, 15))
        await createTransaction({ amount: 300.00, amountCents: 30000, type: 'expense', description: 'Mar', categoryId: 'c1', category: 'C1' })

        // T4: January (Exclude from 3M range [Mar, Apr, May]) = 500
        vi.setSystemTime(new Date(2025, 0, 15))
        await createTransaction({ amount: 500.00, amountCents: 50000, type: 'expense', description: 'Jan', categoryId: 'c1', category: 'C1' })

        // Reset to Current
        vi.setSystemTime(FIXED_DATE)

        // Filter: 3M range ending in currentPeriod (May) -> [Mar, Apr, May]
        const summary = await fetchDashboardSummary({ mode: 'range', period: currentPeriod, months: 3 })

        // Should include T1(100)+T2(200)+T3(300) = 600
        expect(summary.totalSpent).toBe(600)

        // Net Balance is all time (100+200+300+500 = 1100 -> -1100)
        expect(summary.netBalance).toBe(-1100)
    })
})
