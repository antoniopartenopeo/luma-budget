import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchDashboardSummary } from '../repository'
import { __resetTransactionsCache, seedTransactions } from '../../../transactions/api/repository'
import { getCurrentPeriod } from '../../../budget/utils/calculate-budget'

const TX_STORAGE_KEY = 'luma_transactions_v1'
const BUDGET_STORAGE_KEY = 'luma_budget_plans_v1'
const DEFAULT_USER_ID = 'user-1'

describe('Dashboard Summary (Real Wiring)', () => {
    let storage: Record<string, string> = {}

    beforeEach(() => {
        __resetTransactionsCache()
        storage = {}
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key) => storage[key] || null),
            setItem: vi.fn((key, value) => { storage[key] = value }),
            removeItem: vi.fn((key) => { delete storage[key] }),
            clear: vi.fn(() => { storage = {} }),
        })
    })

    it('should calculate summary with real budget and transactions for current month', async () => {
        const currentPeriod = getCurrentPeriod()

        // 1. Setup real budget (1000€)
        const budgetData = {
            [`${DEFAULT_USER_ID}:${currentPeriod}`]: {
                id: 'b1',
                userId: DEFAULT_USER_ID,
                period: currentPeriod,
                globalBudgetAmount: 1000,
                groupBudgets: [],
                currency: 'EUR'
            }
        }
        localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetData))

        // 2. Setup transactions
        const [year, month] = currentPeriod.split('-').map(Number)
        const currentMonthTimestamp = new Date(year, month - 1, 15).getTime()
        const otherMonthTimestamp = new Date(year, month - 2, 15).getTime()

        const transactions = [
            {
                id: 't1',
                amount: '-€250.00',
                description: 'Expense current month',
                type: 'expense',
                timestamp: currentMonthTimestamp,
                categoryId: 'cibo',
                isSuperfluous: false
            },
            {
                id: 't2',
                amount: '+€100.00',
                description: 'Income current month',
                type: 'income',
                timestamp: currentMonthTimestamp,
                categoryId: 'altro',
                isSuperfluous: false
            },
            {
                id: 't3',
                amount: '-€500.00',
                description: 'Expense other month',
                type: 'expense',
                timestamp: otherMonthTimestamp,
                categoryId: 'cibo',
                isSuperfluous: false
            }
        ]
        localStorage.setItem(TX_STORAGE_KEY, JSON.stringify({ [DEFAULT_USER_ID]: transactions }))

        // Fetch with filter for CURRENT MONTH
        const summary = await fetchDashboardSummary({ mode: 'month', period: currentPeriod })

        // totalSpent: only t1 (250)
        expect(summary.totalSpent).toBe(250)
        // totalIncome: only t2 (100)
        expect(summary.totalIncome).toBe(100)

        // netBalance (ALL TIME): income(100) - expenses(250 + 500) = 100 - 750 = -650
        expect(summary.netBalance).toBe(-650)

        // budgetTotal: from budgetPlan (1000)
        expect(summary.budgetTotal).toBe(1000)
        // budgetRemaining: budget (1000) - expenses (250) = 750 (NOT 850!)
        expect(summary.budgetRemaining).toBe(750)
    })

    it('should handle missing budget plan gracefully (budgetTotal = 0)', async () => {
        const currentPeriod = getCurrentPeriod()
        // Empty storage
        localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify({}))
        localStorage.setItem(TX_STORAGE_KEY, JSON.stringify({ [DEFAULT_USER_ID]: [] }))

        const summary = await fetchDashboardSummary({ mode: 'month', period: currentPeriod })

        expect(summary.budgetTotal).toBe(0)
        expect(summary.budgetRemaining).toBe(0)
    })

    it('should calculate useless spend percentage correctly for current month', async () => {
        const currentPeriod = getCurrentPeriod()
        const [year, month] = currentPeriod.split('-').map(Number)
        const ts = new Date(year, month - 1, 10).getTime()

        const transactions = [
            {
                id: 't1',
                amount: '-€100.00',
                type: 'expense',
                timestamp: ts,
                categoryId: 'cibo',
                isSuperfluous: false
            },
            {
                id: 't2',
                amount: '-€100.00',
                type: 'expense',
                timestamp: ts,
                categoryId: 'svago',
                isSuperfluous: true // Superfluous!
            }
        ]
        localStorage.setItem(TX_STORAGE_KEY, JSON.stringify({ [DEFAULT_USER_ID]: transactions }))

        const summary = await fetchDashboardSummary({ mode: 'month', period: currentPeriod })

        // totalSpent = 200, uselessSpent = 100 => 50%
        expect(summary.totalSpent).toBe(200)
        expect(summary.uselessSpendPercent).toBe(50)
    })

    it('should support range filter', async () => {
        const currentPeriod = getCurrentPeriod()
        const [year, month] = currentPeriod.split('-').map(Number)

        // T1: Current month (included)
        const ts1 = new Date(year, month - 1, 15).getTime()
        // T2: Previous month (included in 3M)
        const ts2 = new Date(year, month - 2, 15).getTime()
        // T3: 4 months ago (excluded from 3M)
        const ts3 = new Date(year, month - 4, 15).getTime()

        const transactions = [
            { id: 't1', amount: '-€100.00', type: 'expense', timestamp: ts1, categoryId: 'c1', isSuperfluous: false },
            { id: 't2', amount: '-€200.00', type: 'expense', timestamp: ts2, categoryId: 'c1', isSuperfluous: false },
            { id: 't3', amount: '-€300.00', type: 'expense', timestamp: ts3, categoryId: 'c1', isSuperfluous: false }
        ]
        localStorage.setItem(TX_STORAGE_KEY, JSON.stringify({ [DEFAULT_USER_ID]: transactions }))

        // Filter: 3M range ending in currentPeriod
        const summary = await fetchDashboardSummary({ mode: 'range', period: currentPeriod, months: 3 })

        // Should include t1 and t2 (100 + 200 = 300)
        expect(summary.totalSpent).toBe(300)
        // Net Balance is all time (100+200+300 = 600 expense -> -600)
        expect(summary.netBalance).toBe(-600)
    })
})
