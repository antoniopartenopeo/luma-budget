import { describe, it, expect } from 'vitest'
import { calculateTotalSpent } from '../utils/calculate-budget'
import { Transaction } from '@/features/transactions/api/types'

describe('Budget Calculations (Specific Case)', () => {
    it('should correctly calculate spent and remaining for the user scenario', () => {
        const period = "2025-12"
        const timestamp = new Date(2025, 11, 15).getTime()

        const transactions: Transaction[] = [
            {
                id: 't1',
                amount: '+€1250.00',
                type: 'income',
                timestamp,
                description: 'Income',
                category: 'Salary',
                categoryId: 'salary',
                date: '2025-12-15',
                icon: ''
            },
            {
                id: 't2',
                amount: '-€30.00',
                type: 'expense',
                timestamp,
                description: 'Expense',
                category: 'Food',
                categoryId: 'cibo',
                date: '2025-12-15',
                icon: ''
            }
        ]

        const spent = calculateTotalSpent(transactions, period)
        const budget = 1000
        const remaining = budget - spent

        expect(spent).toBe(30)
        expect(remaining).toBe(970)
    })
})
