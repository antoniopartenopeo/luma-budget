import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchBudget, upsertBudget, __resetBudgetsCache } from '../repository'

const STORAGE_KEY = 'luma_budget_plans_v1'
const USER_ID = 'test-user'
const PERIOD = '2025-12'

describe('Budget Persistence (localStorage)', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        })
        __resetBudgetsCache()
    })

    it('should return null when storage is empty', async () => {
        vi.mocked(localStorage.getItem).mockReturnValue(null)
        const budget = await fetchBudget(USER_ID, PERIOD)
        expect(budget).toBeNull()
    })

    it('should persist and retrieve a budget plan', async () => {
        let storedData: string | null = null
        vi.mocked(localStorage.setItem).mockImplementation((key, value) => {
            if (key === STORAGE_KEY) storedData = value
        })
        vi.mocked(localStorage.getItem).mockImplementation((key) => {
            if (key === STORAGE_KEY) return storedData
            return null
        })

        const planData = {
            period: PERIOD,
            globalBudgetAmountCents: 200000,
            groupBudgets: [
                { groupId: 'essential' as const, label: 'Essenziali', amountCents: 120000 },
                { groupId: 'comfort' as const, label: 'Comfort', amountCents: 50000 },
                { groupId: 'superfluous' as const, label: 'Superflue', amountCents: 30000 }
            ]
        }

        const saved = await upsertBudget(USER_ID, planData.period, planData)
        expect(saved.globalBudgetAmountCents).toBe(200000)

        const retrieved = await fetchBudget(USER_ID, PERIOD)
        expect(retrieved).not.toBeNull()
        expect(retrieved?.globalBudgetAmountCents).toBe(200000)
        expect(retrieved?.groupBudgets.length).toBe(3)
    })

    it('should update an existing plan in storage (overwrite)', async () => {
        const initialStore = JSON.stringify({
            [`${USER_ID}:${PERIOD}`]: {
                id: '123',
                userId: USER_ID,
                period: PERIOD,
                globalBudgetAmountCents: 100000,
                groupBudgets: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        })

        let currentStore = initialStore
        vi.mocked(localStorage.getItem).mockImplementation(() => currentStore)
        vi.mocked(localStorage.setItem).mockImplementation((_, val) => { currentStore = val })

        const updateData = {
            period: PERIOD,
            globalBudgetAmountCents: 500000,
            groupBudgets: []
        }

        await upsertBudget(USER_ID, PERIOD, updateData)

        const updated = await fetchBudget(USER_ID, PERIOD)
        expect(updated?.globalBudgetAmountCents).toBe(500000)
    })

    it('should handle corrupted JSON gracefully', async () => {
        vi.mocked(localStorage.getItem).mockReturnValue('invalid-json')

        const budget = await fetchBudget(USER_ID, PERIOD)
        expect(budget).toBeNull()

        const planData = {
            period: PERIOD,
            globalBudgetAmountCents: 150000,
            groupBudgets: []
        }
        await upsertBudget(USER_ID, PERIOD, planData)
        expect(localStorage.setItem).toHaveBeenCalled()
    })
})
