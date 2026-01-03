import { describe, it, expect } from 'vitest'

// Simulating the repository calculation logic
function calculateUselessPercent(totalSpent: number, uselessSpent: number): number | null {
    return totalSpent > 0 ? Math.round((uselessSpent / totalSpent) * 100) : null
}

// Simulating the KPI tone logic
function getSuperflueTone(uselessSpendPercent: number | null, target: number): "positive" | "negative" | "neutral" {
    if (uselessSpendPercent === null) return "neutral"
    return uselessSpendPercent <= target ? "positive" : "negative"
}

describe('Superfluous Calculation Logic', () => {
    it('should return neutral tone when total spent is 0', () => {
        const percent = calculateUselessPercent(0, 0)
        expect(percent).toBeNull()
        expect(getSuperflueTone(percent, 10)).toBe('neutral')
    })

    it('should respect dynamic target (e.g., 20%)', () => {
        const target = 20
        // 15% should be positive with 20% target
        expect(getSuperflueTone(15, target)).toBe('positive')
        // 25% should be negative with 20% target
        expect(getSuperflueTone(25, target)).toBe('negative')
    })

    it('should return positive tone when percentage is at target', () => {
        const target = 15
        expect(getSuperflueTone(15, target)).toBe('positive')
    })

    it('should return positive tone when percentage is 9% (below 10% target)', () => {
        const target = 10
        // totalSpent = 100, uselessSpent = 9 -> 9%
        const percent = calculateUselessPercent(100, 9)
        expect(percent).toBe(9)
        expect(getSuperflueTone(percent, target)).toBe('positive')
    })

    it('should return positive tone when percentage is exactly 10% (at target)', () => {
        const target = 10
        // totalSpent = 100, uselessSpent = 10 -> 10%
        const percent = calculateUselessPercent(100, 10)
        expect(percent).toBe(10)
        expect(getSuperflueTone(percent, target)).toBe('positive')
    })

    it('should return negative tone when percentage is 11% (above 10% target)', () => {
        const target = 10
        // totalSpent = 100, uselessSpent = 11 -> 11%
        const percent = calculateUselessPercent(100, 11)
        expect(percent).toBe(11)
        expect(getSuperflueTone(percent, target)).toBe('negative')
    })

    it('should handle rounding correctly (9.4% -> 9% positive)', () => {
        const target = 10
        // 9.4 / 100 * 100 = 9.4 -> round 9
        const percent = calculateUselessPercent(100, 9.4)
        expect(percent).toBe(9)
        expect(getSuperflueTone(percent, target)).toBe('positive')
    })

    it('should handle rounding correctly (10.5% -> 11% negative)', () => {
        const target = 10
        // 10.5 / 100 * 100 = 10.5 -> round 11
        const percent = calculateUselessPercent(100, 10.5)
        expect(percent).toBe(11)
        expect(getSuperflueTone(percent, target)).toBe('negative')
    })
})
