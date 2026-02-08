
import { SustainabilityResult, SustainabilityStatus } from "../types"

// Configuration Constants
const MAX_ESSENTIAL_CUT_PERCENT = 5 // Max 5% cut allowed on essentials
const MIN_LIQUIDITY_BUFFER_RATIO = 0.10 // 10% of income should remain as unallocated buffer
const SAFE_LIQUIDITY_BUFFER_RATIO = 0.20 // 20% is considered secure

/**
 * Calculates the minimum monthly liquidity buffer required for safety.
 * This is the amount of money that should NOT be allocated to goals/savings.
 */
export function calculateSafeSavingsBuffer(averageMonthlyIncome: number): number {
    return Math.round(averageMonthlyIncome * MIN_LIQUIDITY_BUFFER_RATIO)
}

/**
 * Checks if a specific savings scenario is sustainable.
 * 
 * @param averageMonthlyIncome - Net monthly income (cents)
 * @param essentialExpensesAvg - Average monthly essential expenses (cents)
 * @param essentialSavingsAmount - Amount cut from essentials in this scenario (cents)
 * @param totalProjectedExpenses - Total expenses after all cuts (cents)
 */
export function checkScenarioSustainability(
    averageMonthlyIncome: number,
    essentialExpensesAvg: number,
    essentialSavingsAmount: number,
    totalProjectedExpenses: number
): SustainabilityResult {

    // 1. Check Essential Cuts Severity
    const essentialCutPercent = essentialExpensesAvg > 0
        ? (essentialSavingsAmount / essentialExpensesAvg) * 100
        : 0

    if (essentialCutPercent > MAX_ESSENTIAL_CUT_PERCENT) {
        return {
            isSustainable: false,
            status: "unsafe",
            reason: `Il ritmo attuale incide sulle spese essenziali (${essentialCutPercent.toFixed(1)}%).`,
            safeBufferRequired: 0,
            remainingBuffer: 0
        }
    }

    // 2. Check Liquidity Buffer (Cash Flow Solvency)
    const projectedFreeCashFlow = averageMonthlyIncome - totalProjectedExpenses
    const minimumBuffer = calculateSafeSavingsBuffer(averageMonthlyIncome) // 10%
    const secureBuffer = Math.round(averageMonthlyIncome * SAFE_LIQUIDITY_BUFFER_RATIO) // 20%

    if (projectedFreeCashFlow < 0) {
        return {
            isSustainable: false,
            status: "unsafe",
            reason: "Il ritmo attuale supera le risorse disponibili.",
            safeBufferRequired: minimumBuffer,
            remainingBuffer: projectedFreeCashFlow
        }
    }

    // Determine Status
    let status: SustainabilityStatus = "secure"
    let reason: string | null = null

    if (projectedFreeCashFlow < minimumBuffer) {
        status = "fragile"
        reason = `Margine residuo (${(projectedFreeCashFlow / averageMonthlyIncome * 100).toFixed(1)}%) ridotto (soglia prudente: 10%).`
    } else if (projectedFreeCashFlow < secureBuffer) {
        status = "sustainable"
        reason = null
    } else {
        status = "secure"
        reason = null
    }

    return {
        isSustainable: status === "secure" || status === "sustainable", // Logic for "Pass/Fail" purely strictly
        status,
        reason,
        safeBufferRequired: minimumBuffer,
        remainingBuffer: projectedFreeCashFlow
    }
}
