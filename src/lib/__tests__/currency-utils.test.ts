import { describe, it, expect } from 'vitest'
import { parseCurrencyToCents } from '../currency-utils'

describe('parseCurrencyToCents', () => {
    it('should parse standard negative amount in cents', () => {
        expect(parseCurrencyToCents("-€30.00")).toBe(-3000)
    })

    it('should parse standard positive amount in cents', () => {
        expect(parseCurrencyToCents("+€1250.00")).toBe(125000)
    })

    it('should handle EU format (comma as decimal)', () => {
        expect(parseCurrencyToCents("1.234,56")).toBe(123456)
        expect(parseCurrencyToCents("30,00")).toBe(3000)
    })

    it('should handle US format (dot as decimal)', () => {
        expect(parseCurrencyToCents("1,234.56")).toBe(123456)
        expect(parseCurrencyToCents("30.00")).toBe(3000)
    })

    it('should handle whole numbers', () => {
        expect(parseCurrencyToCents("15")).toBe(1500)
        expect(parseCurrencyToCents("€ 15")).toBe(1500)
    })

    it('should handle single digit fractional part', () => {
        expect(parseCurrencyToCents("30,5")).toBe(3050)
    })

    it('should handle the 3-digit heuristic for ambiguous single separator', () => {
        // Only one separator + 3 digits = thousand separator
        expect(parseCurrencyToCents("1.234")).toBe(123400)
        expect(parseCurrencyToCents("1,000")).toBe(100000)

        // Only one separator + 1 or 2 or 4 digits = decimal separator
        expect(parseCurrencyToCents("1.23")).toBe(123)
        expect(parseCurrencyToCents("1,5")).toBe(150)
        expect(parseCurrencyToCents("1.2345")).toBe(123) // Truncated to 2 decimal digits
    })

    it('should handle multiple/mixed separators correctly (last is decimal)', () => {
        expect(parseCurrencyToCents("1.234,56")).toBe(123456)
        expect(parseCurrencyToCents("1,234.56")).toBe(123456)
        expect(parseCurrencyToCents("1.000.000,00")).toBe(100000000)
    })

    it('should handle empty or invalid input', () => {
        expect(parseCurrencyToCents("")).toBe(0)
        expect(parseCurrencyToCents("abc")).toBe(0)
    })

    it('should handle multiples of 3 digits as thousand separators in the heuristic', () => {
        expect(parseCurrencyToCents("10,000")).toBe(1000000)
    })
})
