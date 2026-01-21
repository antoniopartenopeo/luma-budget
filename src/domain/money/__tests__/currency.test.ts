import { describe, it, expect } from 'vitest'
import {
    parseCurrencyToCents,
    formatCents,
    euroToCents,
    formatEuroNumber,
} from '../currency'
import { getSignedCents } from '@/domain/transactions'
import { Transaction } from '@/features/transactions/api/types'

describe('currency-utils', () => {
    describe('parseCurrencyToCents', () => {
        it('should parse simple integers', () => {
            expect(parseCurrencyToCents('10')).toBe(1000)
        })

        it('should parse dot decimal', () => {
            expect(parseCurrencyToCents('10.50')).toBe(1050)
            expect(parseCurrencyToCents('1.23')).toBe(123)
        })

        it('should parse comma decimal', () => {
            expect(parseCurrencyToCents('10,50')).toBe(1050)
            expect(parseCurrencyToCents('1,23')).toBe(123)
        })

        it('should handle thousand separators (EU style)', () => {
            expect(parseCurrencyToCents('1.234,56')).toBe(123456)
        })

        it('should handle thousand separators (US style)', () => {
            expect(parseCurrencyToCents('1,234.56')).toBe(123456)
        })

        it('should handle ambiguous thousands', () => {
            expect(parseCurrencyToCents('1.234')).toBe(123400)
            expect(parseCurrencyToCents('1,234')).toBe(123400)
        })

        it('should handle negative values', () => {
            expect(parseCurrencyToCents('-10.50')).toBe(-1050)
            expect(parseCurrencyToCents('€-30,00')).toBe(-3000)
        })

        it('should ignore currency symbols', () => {
            expect(parseCurrencyToCents('€10.50')).toBe(1050)
            expect(parseCurrencyToCents('$10.50')).toBe(1050)
        })
    })

    describe('formatCents', () => {
        it('should format EUR with it-IT locale', () => {
            // Note: non-breaking space usage in some environments, normalized here for display check
            const formatted = formatCents(123456, 'EUR', 'it-IT')
            // Match core parts allowing optional thousands separator
            expect(formatted).toMatch(/1[.,]?234,56/)
            expect(formatted).toContain('€')
        })

        it('should format USD with it-IT locale', () => {
            const formatted = formatCents(123456, 'USD', 'it-IT')
            expect(formatted).toMatch(/1[.,]?234,56/)
            // USD might be $ or USD depending on displayNames
            expect(formatted).toMatch(/USD|\$/)
        })

        it('should format GBP with it-IT locale', () => {
            const formatted = formatCents(123456, 'GBP', 'it-IT')
            expect(formatted).toMatch(/1[.,]?234,56/)
            expect(formatted).toMatch(/GBP|£/)
        })
    })

    describe('formatEuroNumber', () => {
        it('should convert and format number correctly', () => {
            expect(formatEuroNumber(10.5, 'EUR')).toContain('10,50')
            // Match either 1.000,00 or 1000,00 depending on locale env
            const formatted = formatEuroNumber(1000, 'EUR')
            expect(formatted).toMatch(/1[.,]?000,00/)
        })
    })

    describe('euroToCents', () => {
        it('should convert eur units to cents', () => {
            expect(euroToCents(10.50)).toBe(1050)
            expect(euroToCents(10)).toBe(1000)
            expect(euroToCents(0.99)).toBe(99)
        })
    })

    describe('getSignedCents', () => {
        it('should return positive cents for income', () => {
            const t = {
                amount: "€50,00",
                type: "income"
            } as Transaction
            expect(getSignedCents(t)).toBe(5000)
        })

        it('should return negative cents for expense', () => {
            const t = {
                amount: "€50,00",
                type: "expense"
            } as Transaction
            expect(getSignedCents(t)).toBe(-5000)
        })

        it('should handle negative input string correctly for expense', () => {
            const t = {
                amount: "€-50,00",
                type: "expense"
            } as Transaction
            expect(getSignedCents(t)).toBe(-5000)
        })

        it('should handle negative input string correctly for income (fix sign)', () => {
            // Edge case: data says negative but type says income -> should force positive logic
            const t = {
                amount: "€-50,00",
                type: "income"
            } as Transaction
            expect(getSignedCents(t)).toBe(5000)
        })
    })
})
