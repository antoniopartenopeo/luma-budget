import { describe, it, expect } from "vitest"
import { narrateTrend } from "../trend.narrator"


describe("trend.narrator (Semantic Rules)", () => {

    it("narrates improving trend for savings_rate (positive territory, significant > 5%)", () => {
        // Savings rate improves from 5% to 10%
        const result = narrateTrend({
            metricType: "savings_rate",
            metricId: "savings_rate",
            changePercent: 5,
            direction: "up",
            currentValueFormatted: "10%",
            isSavingsRateNegative: false,
            savingsRateValue: 0.10
        }, "improving")

        expect(result.text).not.toContain("efficienza") // BANNED ambiguous term
        expect(result.text).toContain("tasso di risparmio è in aumento")
        expect(result.text).toContain("capacità di risparmio")
    })

    it("narrates improving trend for savings_rate (positive but marginal < 5%)", () => {
        // Savings rate improves from 1% to 4%
        const result = narrateTrend({
            metricType: "savings_rate",
            metricId: "savings_rate",
            changePercent: 3,
            direction: "up",
            currentValueFormatted: "4%",
            isSavingsRateNegative: false,
            savingsRateValue: 0.04
        }, "improving")

        expect(result.text).not.toContain("efficienza")
        expect(result.text).toContain("tasso di risparmio è aumentato")
        expect(result.text).toContain("Continua a costruire") // Cautious
    })

    it("narrates improving trend for savings_rate (negative territory) - SEMANTIC SAFEGUARD", () => {
        // Savings rate improves from -20% to -10% (still deficit, but less)
        const result = narrateTrend({
            metricType: "savings_rate",
            metricId: "savings_rate",
            changePercent: 10,
            direction: "up",
            currentValueFormatted: "-10%",
            isSavingsRateNegative: true,
            savingsRateValue: -0.10
        }, "improving")

        // BANNED TERMS
        expect(result.text).not.toContain("efficienza")
        expect(result.text).not.toContain("aumentando")
        expect(result.text).not.toContain("risparmio")

        // ALLOWED FRAMING
        expect(result.text).toContain("disavanzo si è ridotto")
        expect(result.text).toContain("recuperando terreno")
    })

})
