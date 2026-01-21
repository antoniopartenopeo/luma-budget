import { describe, it, expect } from 'vitest'

import { calculatePercent, getSuperfluousTone } from '../utils/kpi-logic'

describe('Superfluous Calculation Logic', () => {
    it('should return neutral tone when total spent is 0', () => {
        const percent = calculatePercent(0, 0)
        expect(percent).toBeNull()
        expect(getSuperfluousTone(percent, 10)).toBe('neutral')
    })

    it('should respect dynamic target (e.g., 20%)', () => {
        const target = 20
        // 15% should be positive with 20% target
        expect(getSuperfluousTone(15, target)).toBe('positive')
        // 25% should be negative with 20% target
        expect(getSuperfluousTone(25, target)).toBe('negative')
    })

    it('should return positive tone when percentage is at target', () => {
        const target = 15
        expect(getSuperfluousTone(15, target)).toBe('positive')
    })

    it('should return positive tone when percentage is 9% (below 10% target)', () => {
        const target = 10
        // totalSpent = 100, uselessSpent = 9 -> 9%
        const percent = calculatePercent(9, 100)
        expect(percent).toBe(9)
        expect(getSuperfluousTone(percent, target)).toBe('positive')
    })

    it('should return positive tone when percentage is exactly 10% (at target)', () => {
        const target = 10
        // totalSpent = 100, uselessSpent = 10 -> 10%
        const percent = calculatePercent(10, 100)
        expect(percent).toBe(10)
        expect(getSuperfluousTone(percent, target)).toBe('positive')
    })

    it('should return negative tone when percentage is 11% (above 10% target)', () => {
        const target = 10
        // totalSpent = 100, uselessSpent = 11 -> 11%
        const percent = calculatePercent(11, 100)
        expect(percent).toBe(11)
        expect(getSuperfluousTone(percent, target)).toBe('negative')
    })

    it('should handle rounding correctly (9.4% -> 9% positive)', () => {
        const target = 10
        // 9.4 / 100 * 100 = 9.4 -> round 9
        const percent = calculatePercent(9.4, 100)
        expect(percent).toBe(9)
        expect(getSuperfluousTone(percent, target)).toBe('positive')
    })

    it('should handle rounding correctly (10.5% -> 11% negative)', () => {
        const target = 10
        // 10.5 / 100 * 100 = 10.5 -> round 11
        const percent = calculatePercent(10.5, 100)
        expect(percent).toBe(11)
        expect(getSuperfluousTone(percent, target)).toBe('negative')
    })
})
