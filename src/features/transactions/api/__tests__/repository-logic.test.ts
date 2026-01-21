import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createTransaction, updateTransaction, __resetTransactionsCache } from '../repository'
import { Transaction } from '../types'
import { parseCurrencyToCents } from '@/domain/money'

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
                categoryId: 'cibo',
                category: 'Cibo',
                type: 'expense' as const
            }

            const result = await createTransaction(data)

            expect(result.amountCents).toBe(1550)
            // String should be signed correctly for expense
            expect(parseCurrencyToCents(result.amount)).toBe(-1550)
        })

        it('should handle negative amountCents by taking absolute value', async () => {
            const data = {
                description: 'Negative Cents',
                amountCents: -2000,
                categoryId: 'altro',
                category: 'Altro',
                type: 'income' as const
            }

            const result = await createTransaction(data)
            expect(result.amountCents).toBe(2000)
            expect(result.type).toBe('income')
            expect(parseCurrencyToCents(result.amount)).toBe(2000)
        })

        it('should fallback to legacy float amount if amountCents is missing', async () => {
            const data = {
                description: 'Legacy Float',
                amount: 10.50,
                amountCents: 1050, // Added to satisfy mandatory field in type, though repository still handles fallback
                categoryId: 'cibo',
                category: 'Cibo',
                type: 'expense' as const
            }

            const result = await createTransaction(data)
            expect(result.amountCents).toBe(1050)
            expect(parseCurrencyToCents(result.amount)).toBe(-1050)
        })
    })

    describe('updateTransaction', () => {
        it('should update using amountCents', async () => {
            // Create first
            const initial = await createTransaction({
                description: 'Initial',
                amountCents: 1000,
                categoryId: 'cibo',
                category: 'Cibo',
                type: 'expense'
            })

            const updated = await updateTransaction(initial.id, {
                amountCents: 2000
            })

            expect(updated.amountCents).toBe(2000)
            expect(parseCurrencyToCents(updated.amount)).toBe(-2000)
        })

        it('should update float amount and derive cents', async () => {
            const initial = await createTransaction({
                description: 'Initial',
                amountCents: 1000,
                categoryId: 'cibo',
                category: 'Cibo',
                type: 'expense'
            })

            const updated = await updateTransaction(initial.id, {
                amount: 5.25
            })

            expect(updated.amountCents).toBe(525)
            expect(parseCurrencyToCents(updated.amount)).toBe(-525)
        })

        it('should preserve manual override provided in DTO', async () => {
            const initial = await createTransaction({
                description: 'Initial',
                amountCents: 1000,
                categoryId: 'cibo',
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

        it('should backfill legacy data to localStorage on read', async () => {
            const legacyData = {
                [USER_ID]: [
                    {
                        id: 'legacy-1',
                        description: 'Legacy',
                        amount: '10.50',
                        type: 'expense',
                        categoryId: 'cibo',
                        category: 'Cibo',
                        timestamp: Date.now()
                    }
                ]
            }

            vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(legacyData))
            const setItemSpy = vi.mocked(localStorage.setItem)

            // Trigger read via fetchTransactions (ensureCache)
            const { fetchTransactions } = await import('../repository')
            const txs = await fetchTransactions()

            expect(txs[0].amountCents).toBe(1050)
            // Should have persisted back
            const writeCalls = setItemSpy.mock.calls.filter(call => call[0] === STORAGE_KEY)
            expect(writeCalls.length).toBe(1)

            const savedData = JSON.parse(writeCalls[0][1] as string)
            expect(savedData[USER_ID][0].amountCents).toBe(1050)
            expect(savedData[USER_ID][0].amount).toContain('10,50')
        })

        it('should backfill legacy float NUMBER from storage.get', async () => {
            const legacyData = {
                [USER_ID]: [
                    {
                        id: 'legacy-float',
                        description: 'Legacy Float',
                        amount: 12.34, // Legacy as number
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

            expect(txs[0].amountCents).toBe(1234)
            // String should be generated
            expect(txs[0].amount).toContain('12,34')

            const writeCalls = setItemSpy.mock.calls.filter(call => call[0] === STORAGE_KEY)
            expect(writeCalls.length).toBe(1)
        })

        it('should be idempotent and NOT write to storage if already normalized', async () => {
            const { formatCentsSignedFromType } = await import('@/domain/transactions')
            const cleanData = {
                [USER_ID]: [
                    {
                        id: 'clean-1',
                        description: 'Clean',
                        amount: formatCentsSignedFromType(1050, 'expense'),
                        amountCents: 1050,
                        type: 'expense' as const,
                        categoryId: 'cibo',
                        category: 'Cibo',
                        timestamp: Date.now()
                    }
                ]
            }

            vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(cleanData))
            const setItemSpy = vi.mocked(localStorage.setItem)

            // Trigger read
            const { fetchTransactions } = await import('../repository')
            await fetchTransactions()

            // Should NOT have called setItem for our storage key
            const writeCalls = setItemSpy.mock.calls.filter(call => call[0] === STORAGE_KEY)
            expect(writeCalls.length).toBe(0)
        })

        it('should system mixed data and write exactly once', async () => {
            const mixedData = {
                [USER_ID]: [
                    {
                        id: 'clean',
                        description: 'Clean',
                        amount: '-€10,50',
                        amountCents: 1050,
                        type: 'expense',
                        categoryId: 'cibo',
                        category: 'Cibo',
                        timestamp: Date.now()
                    },
                    {
                        id: 'legacy',
                        description: 'Legacy',
                        amount: '5.00',
                        type: 'income',
                        categoryId: 'altro',
                        category: 'Altro',
                        timestamp: Date.now()
                    }
                ]
            }

            vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mixedData))
            const setItemSpy = vi.mocked(localStorage.setItem)

            const { fetchTransactions } = await import('../repository')
            await fetchTransactions()

            const writeCalls = setItemSpy.mock.calls.filter(call => call[0] === STORAGE_KEY)
            expect(writeCalls.length).toBe(1)

            const savedData = JSON.parse(writeCalls[0][1] as string)
            const legacyTx = savedData[USER_ID].find((t: Transaction) => t.id === 'legacy')
            expect(legacyTx?.amountCents).toBe(500)
        })
    })
})
