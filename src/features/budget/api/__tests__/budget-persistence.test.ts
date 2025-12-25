import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchBudget, upsertBudget, deleteBudget } from '../mock-data'

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
        // Clear in-memory Map implicitly by ensuring we test the persistence layer
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
            globalBudgetAmount: 2000,
            groupBudgets: [
                { groupId: 'essential' as const, label: 'Essenziali', amount: 1200 },
                { groupId: 'comfort' as const, label: 'Comfort', amount: 500 },
                { groupId: 'superfluous' as const, label: 'Superflue', amount: 300 }
            ]
        }

        const saved = await upsertBudget(USER_ID, planData.period, planData)
        expect(saved.globalBudgetAmount).toBe(2000)

        const retrieved = await fetchBudget(USER_ID, PERIOD)
        expect(retrieved).not.toBeNull()
        expect(retrieved?.globalBudgetAmount).toBe(2000)
        expect(retrieved?.groupBudgets.length).toBe(3)
    })

    it('should update an existing plan in storage (overwrite)', async () => {
        const initialStore = JSON.stringify({
            [`${USER_ID}:${PERIOD}`]: {
                id: '123',
                userId: USER_ID,
                period: PERIOD,
                globalBudgetAmount: 1000,
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
            globalBudgetAmount: 5000,
            groupBudgets: []
        }

        await upsertBudget(USER_ID, PERIOD, updateData)

        const updated = await fetchBudget(USER_ID, PERIOD)
        expect(updated?.globalBudgetAmount).toBe(5000)
    })

    it('should handle corrupted JSON gracefully', async () => {
        vi.mocked(localStorage.getItem).mockReturnValue('invalid-json')

        // Should not crash, should treat as empty/null
        const budget = await fetchBudget(USER_ID, PERIOD)
        expect(budget).toBeNull()

        // Should be able to recover by saving
        const planData = {
            period: PERIOD,
            globalBudgetAmount: 1500,
            groupBudgets: []
        }
        await upsertBudget(USER_ID, PERIOD, planData)
        expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('should handle unavailable localStorage (SSR or disabled)', async () => {
        vi.stubGlobal('localStorage', undefined)

        // Should not crash
        const budget = await fetchBudget(USER_ID, PERIOD)
        expect(budget).toBeNull()

        const planData = {
            period: PERIOD,
            globalBudgetAmount: 1500,
            groupBudgets: []
        }
        await expect(upsertBudget(USER_ID, PERIOD, planData)).resolves.toBeDefined()
    })
})
