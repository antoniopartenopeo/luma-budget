import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchDashboardSummary } from '../repository'
import { __resetTransactionsCache, createTransaction } from '../../../transactions/api/repository'
import { getCurrentPeriod, calculateDateRangeLocal } from "@/lib/date-ranges"
import { __resetCategoriesCache } from '../../../categories/api/repository'
import { CategoryIds } from '@/domain/categories'

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

    it('should calculate summary with real transactions for current month', async () => {
        const currentPeriod = getCurrentPeriod() // Should be "2025-05" due to fake timer

        // Setup transactions via Repository (triggers logic + backfill implicitly)
        // May 2025 (Current)
        await createTransaction({
            description: 'Expense current month',
            amountCents: 25000,
            type: 'expense',
            categoryId: CategoryIds.CIBO,
            category: 'Cibo',
            isSuperfluous: false,
            classificationSource: 'manual'
        })

        await createTransaction({
            description: 'Income current month',
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
    })

    it('should calculate useless spend percentage correctly for current month', async () => {
        const currentPeriod = getCurrentPeriod()

        await createTransaction({
            description: 'Useful',
            amountCents: 10000,
            type: 'expense',
            categoryId: CategoryIds.CIBO,
            category: 'Cibo',
            isSuperfluous: false,
            classificationSource: 'manual'
        })

        await createTransaction({
            description: 'Useless',
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
        await createTransaction({ amountCents: 10000, type: 'expense', description: 'May', categoryId: 'c1', category: 'C1' })

        // T2: April (Prev) = 200
        vi.setSystemTime(new Date(2025, 3, 15))
        await createTransaction({ amountCents: 20000, type: 'expense', description: 'Apr', categoryId: 'c1', category: 'C1' })

        // T3: March (Prev-Prev) = 300
        vi.setSystemTime(new Date(2025, 2, 15))
        await createTransaction({ amountCents: 30000, type: 'expense', description: 'Mar', categoryId: 'c1', category: 'C1' })

        // T4: January (Exclude from 3M range [Mar, Apr, May]) = 500
        vi.setSystemTime(new Date(2025, 0, 15))
        await createTransaction({ amountCents: 50000, type: 'expense', description: 'Jan', categoryId: 'c1', category: 'C1' })

        // Reset to Current
        vi.setSystemTime(FIXED_DATE)

        // Filter: 3M range ending in currentPeriod (May) -> [Mar, Apr, May]
        const summary = await fetchDashboardSummary({ mode: 'range', period: currentPeriod, months: 3 })

        // Should include T1(100)+T2(200)+T3(300) = 600
        expect(summary.totalSpent).toBe(600)

        // Net Balance is all time (100+200+300+500 = 1100 -> -1100)
        expect(summary.netBalance).toBe(-1100)
    })

    it('should extract and deduplicate used cards in a filter-aware way', async () => {
        const currentPeriod = getCurrentPeriod() // 2025-05

        await createTransaction({
            description: 'PAGAMENTO APPLE PAY MASTERCARD NFC del 18/05/2025 CARTA *7298 DI EUR 30,40 FIRENZE',
            amountCents: 3040,
            type: 'expense',
            categoryId: CategoryIds.CIBO,
            category: 'Cibo',
        })

        await createTransaction({
            description: 'PAGAMENTO POS CARTA *7298 PANIFICIO FIRENZE',
            amountCents: 910,
            type: 'expense',
            categoryId: CategoryIds.CIBO,
            category: 'Cibo',
        })

        await createTransaction({
            description: 'PAGAMENTO VISA NFC del 18/05/2025 CARTA *7298 DI EUR 12,30 LIBRERIA',
            amountCents: 1230,
            type: 'expense',
            categoryId: CategoryIds.SVAGO_EXTRA,
            category: 'Svago',
        })

        // Previous month: must not appear in current-month cardsUsed (filter-aware behavior)
        vi.setSystemTime(new Date(2025, 3, 5))
        await createTransaction({
            description: 'PAGAMENTO MASTERCARD CARTA *1234 NEGOZIO APRILE',
            amountCents: 2450,
            type: 'expense',
            categoryId: CategoryIds.CIBO,
            category: 'Cibo',
        })

        vi.setSystemTime(FIXED_DATE)

        const summary = await fetchDashboardSummary({ mode: 'month', period: currentPeriod })

        expect(summary.cardsUsed).toHaveLength(3)
        expect(summary.cardsUsed.every(card => card.last4 === '7298')).toBe(true)

        const mastercard = summary.cardsUsed.find(card => card.cardId === 'mastercard_7298')
        const visa = summary.cardsUsed.find(card => card.cardId === 'visa_7298')
        const unknown = summary.cardsUsed.find(card => card.cardId === 'unk_7298')

        expect(mastercard).toBeDefined()
        expect(mastercard?.walletProvider).toBe('Apple Pay')
        expect(mastercard?.confidence).toBe('high')
        expect(mastercard?.status).toBe('active')

        expect(visa).toBeDefined()
        expect(visa?.network).toBe('Visa')
        expect(visa?.status).toBe('active')

        expect(unknown).toBeDefined()
        expect(unknown?.network).toBe('Unknown')
        expect(unknown?.status).toBe('active')
    })

    it('should apply local month boundaries consistently', async () => {
        const currentPeriod = getCurrentPeriod() // 2025-05 with fake timer
        const { startDate } = calculateDateRangeLocal(currentPeriod, 1)

        // One transaction just before local month start, one exactly at local month start.
        const beforeStart = new Date(startDate.getTime() - 1).toISOString()
        const atStart = new Date(startDate.getTime()).toISOString()

        await createTransaction({
            description: 'Boundary outside',
            amountCents: 11100,
            type: 'expense',
            categoryId: CategoryIds.CIBO,
            category: 'Cibo',
            date: beforeStart,
        })

        await createTransaction({
            description: 'Boundary inside',
            amountCents: 22200,
            type: 'expense',
            categoryId: CategoryIds.CIBO,
            category: 'Cibo',
            date: atStart,
        })

        const summary = await fetchDashboardSummary({ mode: 'month', period: currentPeriod })
        expect(summary.totalSpent).toBe(222)
    })
})
