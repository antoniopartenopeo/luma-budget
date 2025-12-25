import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactions,
    __resetTransactionsCache
} from '../mock-data'

const STORAGE_KEY = 'luma_transactions_v1'
const DEFAULT_USER_ID = 'user-1'

describe('Transactions Persistence (localStorage)', () => {
    beforeEach(() => {
        __resetTransactionsCache()
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        })

        // Reset cache in mock-data.ts if it was implemented as a global variable.
        // Since we are mocking localStorage, the first call to any API will trigger ensureCache.
        // We'll need to be careful if provide a way to clear the cache for testing.
    })

    it('should seed logic: return mock data when storage is empty for the first time', async () => {
        vi.mocked(localStorage.getItem).mockReturnValue(null)

        const txs = await fetchTransactions()

        // Should have some default mock data (based on what's in mock-data.ts)
        expect(txs.length).toBeGreaterThan(0)
        expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String))
    })

    it('should persist and retrieve a new transaction (round-trip)', async () => {
        let storedData: string | null = null
        vi.mocked(localStorage.setItem).mockImplementation((key, value) => {
            if (key === STORAGE_KEY) storedData = value
        })
        vi.mocked(localStorage.getItem).mockImplementation((key) => {
            if (key === STORAGE_KEY) return storedData
            return null
        })

        const initialTxs = await fetchTransactions()
        const initialCount = initialTxs.length

        const newTxData = {
            description: 'Test Persistence',
            amount: 50.00,
            category: 'Cibo',
            categoryId: 'cibo',
            type: 'expense' as const
        }

        const created = await createTransaction(newTxData)
        expect(created.description).toBe('Test Persistence')

        // Hydrate from storage again (simulated by the fact that fetchTransactions uses the same implementation)
        const currentTxs = await fetchTransactions()
        expect(currentTxs.length).toBe(initialCount + 1)
        expect(currentTxs[0].id).toBe(created.id)
    })

    it('should update a transaction and persist changes', async () => {
        let storedData: string | null = null
        vi.mocked(localStorage.setItem).mockImplementation((key, value) => {
            if (key === STORAGE_KEY) storedData = value
        })
        vi.mocked(localStorage.getItem).mockImplementation((key) => {
            if (key === STORAGE_KEY) return storedData
            return null
        })

        const txs = await fetchTransactions()
        const targetId = txs[0].id

        await updateTransaction(targetId, { description: 'Updated Desc' })

        const updatedTxs = await fetchTransactions()
        const updated = updatedTxs.find(t => t.id === targetId)
        expect(updated?.description).toBe('Updated Desc')
    })

    it('should delete a transaction and persist changes', async () => {
        let storedData: string | null = null
        vi.mocked(localStorage.setItem).mockImplementation((key, value) => {
            if (key === STORAGE_KEY) storedData = value
        })
        vi.mocked(localStorage.getItem).mockImplementation((key) => {
            if (key === STORAGE_KEY) return storedData
            return null
        })

        const txs = await fetchTransactions()
        const initialCount = txs.length
        const targetId = txs[0].id

        await deleteTransaction(targetId)

        const currentTxs = await fetchTransactions()
        expect(currentTxs.length).toBe(initialCount - 1)
        expect(currentTxs.find(t => t.id === targetId)).toBeUndefined()
    })

    it('should handle corrupted JSON by falling back to seed', async () => {
        vi.mocked(localStorage.getItem).mockReturnValue('invalid-json')

        const txs = await fetchTransactions()
        expect(txs.length).toBeGreaterThan(0) // Should have seeded
        expect(localStorage.setItem).toHaveBeenCalled()
    })
})
