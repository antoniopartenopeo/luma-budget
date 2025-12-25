import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchDashboardSummary } from '../mock-data'
import { __resetTransactionsCache } from '../../../transactions/api/mock-data'
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

        const summary = await fetchDashboardSummary()

        // totalSpent: only t1 (250)
        expect(summary.totalSpent).toBe(250)
        // totalIncome: only t2 (100)
        expect(summary.totalIncome).toBe(100)
        // netBalance: income(100) - expenses(250) = -150
        expect(summary.netBalance).toBe(-150)
        // budgetTotal: from budgetPlan (1000)
        expect(summary.budgetTotal).toBe(1000)
        // budgetRemaining: budget (1000) - expenses (250) = 750 (NOT 850!)
        expect(summary.budgetRemaining).toBe(750)
    })

    it('should handle missing budget plan gracefully (budgetTotal = 0)', async () => {
        // Empty storage
        localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify({}))
        localStorage.setItem(TX_STORAGE_KEY, JSON.stringify({ [DEFAULT_USER_ID]: [] }))

        const summary = await fetchDashboardSummary()

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

        const summary = await fetchDashboardSummary()

        // totalSpent = 200, uselessSpent = 100 => 50%
        expect(summary.totalSpent).toBe(200)
        expect(summary.uselessSpendPercent).toBe(50)
    })
})
