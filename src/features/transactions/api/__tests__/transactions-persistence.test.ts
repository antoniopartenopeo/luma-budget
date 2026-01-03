import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    seedTransactions,
    __resetTransactionsCache
} from '../repository'

const STORAGE_KEY = 'luma_transactions_v1'

describe('Transactions Persistence (localStorage)', () => {
    vi.setConfig({ testTimeout: 15000 })
    beforeEach(() => {
        __resetTransactionsCache()
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        })
    })

    it('should return empty by default and accept manual seeding', async () => {
        vi.mocked(localStorage.getItem).mockReturnValue(null)

        // First fetch should be empty (no auto-seed)
        const initial = await fetchTransactions()
        expect(initial).toEqual([])

        // Manual seed
        seedTransactions()

        // Second fetch should have data
        const seeded = await fetchTransactions()
        expect(seeded.length).toBeGreaterThan(0)
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

        const currentTxs = await fetchTransactions()
        expect(currentTxs.length).toBe(initialCount + 1)
        expect(currentTxs.find(t => t.id === created.id)).toBeDefined()
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

        // Ensure we have data
        seedTransactions()

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

        // Ensure we have data
        seedTransactions()

        const txs = await fetchTransactions()
        const initialCount = txs.length
        const targetId = txs[0].id

        await deleteTransaction(targetId)

        const currentTxs = await fetchTransactions()
        expect(currentTxs.length).toBe(initialCount - 1)
        expect(currentTxs.find(t => t.id === targetId)).toBeUndefined()
    })

    it('should handle corrupted JSON by returning empty array', async () => {
        vi.mocked(localStorage.getItem).mockReturnValue('invalid-json')

        const txs = await fetchTransactions()
        expect(txs).toEqual([])
    })
})
