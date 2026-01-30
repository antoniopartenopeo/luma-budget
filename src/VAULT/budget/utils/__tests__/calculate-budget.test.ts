import { describe, it, expect } from 'vitest'
import { calculateGroupSpending, calculateTotalSpent } from '../calculate-budget'
import { CATEGORIES } from '@/domain/categories'
import { Transaction } from '@/features/transactions/api/types'
import { parseCurrencyToCents } from '@/domain/money'
import { CategoryIds } from '@/domain/categories'

const createMockTransaction = (
    id: string,
    amount: string,
    categoryId: string,
    timestamp: number,
    isSuperfluous?: boolean
): Transaction => {
    const amountCents = parseCurrencyToCents(amount)
    return {
        id,
        amount,
        amountCents,
        date: '2025-12-15',
        description: 'Mock transaction',
        category: 'Test',
        categoryId,
        type: amountCents < 0 ? 'expense' : 'income',
        timestamp,
        isSuperfluous,
        classificationSource: 'ruleBased'
    }
}

describe('calculateGroupSpending', () => {
    const period = '2025-12'
    const timestamp = new Date('2025-12-15').getTime()

    it('Caso 1: categoria essential + t.isSuperfluous=true => should count as superfluous', () => {
        const transactions: Transaction[] = [
            createMockTransaction('1', '-10,00', CategoryIds.CIBO, timestamp, true)
        ]

        const result = calculateGroupSpending(transactions, period, CATEGORIES)
        const superfluousGroup = result.groupSpending.find(g => g.groupId === 'superfluous')
        const essentialGroup = result.groupSpending.find(g => g.groupId === 'essential')

        expect(superfluousGroup?.spentCents).toBe(1000)
        expect(essentialGroup?.spentCents).toBe(0)
    })

    it('Caso 2: categoria superfluous + t.isSuperfluous=false => should count as comfort', () => {
        const transactions: Transaction[] = [
            createMockTransaction('2', '-20,00', CategoryIds.SVAGO_EXTRA, timestamp, false)
        ]

        const result = calculateGroupSpending(transactions, period, CATEGORIES)
        const superfluousGroup = result.groupSpending.find(g => g.groupId === 'superfluous')
        const comfortGroup = result.groupSpending.find(g => g.groupId === 'comfort')

        expect(comfortGroup?.spentCents).toBe(2000)
        expect(superfluousGroup?.spentCents).toBe(0)
    })

    it('Caso 3: categoria comfort + t.isSuperfluous=true => should count as superfluous', () => {
        const transactions: Transaction[] = [
            createMockTransaction('3', '-30,00', CategoryIds.SHOPPING, timestamp, true)
        ]

        const result = calculateGroupSpending(transactions, period, CATEGORIES)
        const superfluousGroup = result.groupSpending.find(g => g.groupId === 'superfluous')
        const comfortGroup = result.groupSpending.find(g => g.groupId === 'comfort')

        expect(superfluousGroup?.spentCents).toBe(3000)
        expect(comfortGroup?.spentCents).toBe(0)
    })

    it('Caso 4: categoria essential + t.isSuperfluous=undefined => should stay essential', () => {
        const transactions: Transaction[] = [
            createMockTransaction('4', '-40,00', CategoryIds.CIBO, timestamp, undefined)
        ]

        const result = calculateGroupSpending(transactions, period, CATEGORIES)
        const essentialGroup = result.groupSpending.find(g => g.groupId === 'essential')

        expect(essentialGroup?.spentCents).toBe(4000)
    })

    it('Caso 5: categoria non trovata => handle gracefully (fallback to essential)', () => {
        const transactions: Transaction[] = [
            createMockTransaction('5', '-50,00', 'unknown', timestamp, undefined)
        ]

        const result = calculateGroupSpending(transactions, period, CATEGORIES)
        const essentialGroup = result.groupSpending.find(g => g.groupId === 'essential')

        expect(essentialGroup?.spentCents).toBe(5000)
    })
})

describe('Budget Calculations (Specific Case)', () => {
    it('should correctly calculate spent and remaining for the user scenario', () => {
        const period = "2025-12"
        const timestamp = new Date(2025, 11, 15).getTime()

        const transactions: Transaction[] = [
            createMockTransaction('t1', '+1250,00', CategoryIds.STIPENDIO, timestamp),
            createMockTransaction('t2', '-30,00', CategoryIds.CIBO, timestamp)
        ]

        const spentCents = calculateTotalSpent(transactions, period)
        const budgetCents = 100000 // 1000.00
        const remainingCents = budgetCents - spentCents

        expect(spentCents).toBe(3000)
        expect(remainingCents).toBe(97000)
    })
})
