import { describe, it, expect } from 'vitest'
import { calculateGroupSpending } from '../calculate-budget'
import { Transaction } from '@/features/transactions/api/types'

describe('calculateGroupSpending', () => {
    const period = '2025-12'
    const timestamp = new Date('2025-12-15').getTime()

    it('Caso 1: categoria essential + t.isSuperfluous=true => should count as superfluous', () => {
        const transactions: Transaction[] = [
            {
                id: '1',
                amount: '10,00',
                date: '2025-12-15',
                description: 'Cibo superfluo',
                category: 'Cibo',
                categoryId: 'cibo', // Essential
                icon: '',
                type: 'expense',
                timestamp,
                isSuperfluous: true
            }
        ]

        const result = calculateGroupSpending(transactions, period)
        const superfluousGroup = result.groupSpending.find(g => g.groupId === 'superfluous')
        const essentialGroup = result.groupSpending.find(g => g.groupId === 'essential')

        // EXPECTATION AFTER FIX: should be in superfluous
        // CURRENT BEHAVIOR (FAILING): will be in essential
        expect(superfluousGroup?.spent).toBe(10)
        expect(essentialGroup?.spent).toBe(0)
    })

    it('Caso 2: categoria superfluous + t.isSuperfluous=false => should count as comfort', () => {
        const transactions: Transaction[] = [
            {
                id: '2',
                amount: '20,00',
                date: '2025-12-15',
                description: 'Svago necessario',
                category: 'Svago',
                categoryId: 'svago', // Superfluous
                icon: '',
                type: 'expense',
                timestamp,
                isSuperfluous: false
            }
        ]

        const result = calculateGroupSpending(transactions, period)
        const superfluousGroup = result.groupSpending.find(g => g.groupId === 'superfluous')
        const comfortGroup = result.groupSpending.find(g => g.groupId === 'comfort')

        // EXPECTATION AFTER FIX: should be in comfort
        // CURRENT BEHAVIOR (FAILING): will be in superfluous
        expect(comfortGroup?.spent).toBe(20)
        expect(superfluousGroup?.spent).toBe(0)
    })

    it('Caso 3: categoria comfort + t.isSuperfluous=true => should count as superfluous', () => {
        const transactions: Transaction[] = [
            {
                id: '3',
                amount: '30,00',
                date: '2025-12-15',
                description: 'Shopping superfluo',
                category: 'Shopping',
                categoryId: 'shopping', // Comfort
                icon: '',
                type: 'expense',
                timestamp,
                isSuperfluous: true
            }
        ]

        const result = calculateGroupSpending(transactions, period)
        const superfluousGroup = result.groupSpending.find(g => g.groupId === 'superfluous')
        const comfortGroup = result.groupSpending.find(g => g.groupId === 'comfort')

        // EXPECTATION AFTER FIX: should be in superfluous
        expect(superfluousGroup?.spent).toBe(30)
        expect(comfortGroup?.spent).toBe(0)
    })

    it('Caso 4: categoria essential + t.isSuperfluous=undefined => should stay essential', () => {
        const transactions: Transaction[] = [
            {
                id: '4',
                amount: '40,00',
                date: '2025-12-15',
                description: 'Cibo normale',
                category: 'Cibo',
                categoryId: 'cibo', // Essential
                icon: '',
                type: 'expense',
                timestamp,
                isSuperfluous: undefined
            }
        ]

        const result = calculateGroupSpending(transactions, period)
        const essentialGroup = result.groupSpending.find(g => g.groupId === 'essential')

        expect(essentialGroup?.spent).toBe(40)
    })

    it('Caso 5: categoria non trovata => handle gracefully (fallback to essential)', () => {
        const transactions: Transaction[] = [
            {
                id: '5',
                amount: '50,00',
                date: '2025-12-15',
                description: 'Categoria ignota',
                category: 'Ignoto',
                categoryId: 'unknown',
                icon: '',
                type: 'expense',
                timestamp,
                isSuperfluous: undefined
            }
        ]

        const result = calculateGroupSpending(transactions, period)
        const essentialGroup = result.groupSpending.find(g => g.groupId === 'essential')

        // We expect that unknown category (without override) defaults to essential
        expect(essentialGroup?.spent).toBe(50)
    })
})
