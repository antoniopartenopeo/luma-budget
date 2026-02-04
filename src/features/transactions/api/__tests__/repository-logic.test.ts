import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTransaction, updateTransaction, __resetTransactionsCache } from '../repository'

import { CategoryIds } from '@/domain/categories'

describe('Transaction Repository Logic (amountCents)', () => {
    beforeEach(() => {
        __resetTransactionsCache()
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(() => null),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        })
    })

    describe('createTransaction', () => {
        it('should prioritize amountCents and generate absolute value', async () => {
            const data = {
                description: 'Test Cents',
                amountCents: 1550, // 15.50
                categoryId: CategoryIds.CIBO,
                category: 'Cibo',
                type: 'expense' as const
            }

            const result = await createTransaction(data)

            expect(result.amountCents).toBe(1550)
            expect(result.type).toBe('expense')
        })

        it('should handle negative amountCents by taking absolute value', async () => {
            const data = {
                description: 'Negative Cents',
                amountCents: -2000,
                categoryId: CategoryIds.ALTRO_SUPERFLUO,
                category: 'Altro',
                type: 'income' as const
            }

            const result = await createTransaction(data)
            expect(result.amountCents).toBe(2000)
            expect(result.type).toBe('income')
        })

        it('should use amountCents directly', async () => {
            const data = {
                description: 'Cents Only',
                amountCents: 1050,
                categoryId: CategoryIds.CIBO,
                category: 'Cibo',
                type: 'expense' as const
            }

            const result = await createTransaction(data)
            expect(result.amountCents).toBe(1050)
        })
    })

    describe('updateTransaction', () => {
        it('should update using amountCents', async () => {
            const initial = await createTransaction({
                description: 'Initial',
                amountCents: 1000,
                categoryId: CategoryIds.CIBO,
                category: 'Cibo',
                type: 'expense'
            })

            const updated = await updateTransaction(initial.id, {
                amountCents: 2000
            })

            expect(updated.amountCents).toBe(2000)
        })

        it('should preserve manual override provided in DTO', async () => {
            const initial = await createTransaction({
                description: 'Initial',
                amountCents: 1000,
                categoryId: CategoryIds.CIBO,
                category: 'Cibo',
                type: 'expense'
            })

            const updated = await updateTransaction(initial.id, {
                isSuperfluous: true,
                classificationSource: 'manual'
            })

            expect(updated.isSuperfluous).toBe(true)
            expect(updated.classificationSource).toBe('manual')
        })
    })

    describe('Persistent Backfill & Idempotency', () => {
        const STORAGE_KEY = "luma_transactions_v1"
        const USER_ID = "user-1"

        it('should backfill amountCents consistency on read', async () => {
            const legacyData = {
                [USER_ID]: [
                    {
                        id: 'legacy-1',
                        description: 'Legacy',
                        amountCents: "1050", // String triggers backfill/didChange
                        type: 'expense',
                        categoryId: 'cibo',
                        category: 'Cibo',
                        timestamp: Date.now()
                    }
                ]
            }

            vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(legacyData))
            const setItemSpy = vi.mocked(localStorage.setItem)

            const { fetchTransactions } = await import('../repository')
            const txs = await fetchTransactions()

            expect(txs[0].amountCents).toBe(1050)
            // Backfill still runs to ensure structural integrity and re-syncs to localStorage
            const writeCalls = setItemSpy.mock.calls.filter(call => call[0] === STORAGE_KEY)
            expect(writeCalls.length).toBe(1)
        })

        it('should migrate legacy category IDs on read', async () => {
            const legacyData = {
                [USER_ID]: [
                    {
                        id: 'legacy-cat',
                        description: 'Legacy ID',
                        amountCents: 500,
                        type: 'expense',
                        categoryId: 'svago', // becomes svago_extra
                        category: 'Svago',
                        timestamp: Date.now()
                    }
                ]
            }

            vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(legacyData))
            const { fetchTransactions } = await import('../repository')
            const txs = await fetchTransactions()

            expect(txs[0].categoryId).toBe(CategoryIds.SVAGO_EXTRA)
        })
    })
})
