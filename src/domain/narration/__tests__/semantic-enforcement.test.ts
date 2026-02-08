import { describe, it, expect } from "vitest"
import { narrateAdvisor } from "../advisor.narrator"
import { deriveAdvisorState, deriveSnapshotState, deriveKPIState } from "../derive-state"
import { narrateSnapshot, narrateKPI } from "../"

// GLOBAL SEMANTIC ENFORCEMENT SUITE
// =================================
// Ensures no regressions on critical semantic rules:
// 1. No positive/celebratory terms in Deficit.
// 2. No "Stable"/"Good" states for Micro-surplus (<5%).
// 3. Strict state derivation based on net buffer.

describe("Global Semantic Anti-Regression", () => {

    const BANNED_POSITIVE_TERMS = ["risparmio", "efficienza", "surplus", "stabile", "ottimo lavoro", "sotto controllo"]

    // ==========================================
    // SCENARIO 1: DEFICIT (Out > In)
    // ==========================================
    describe("Scenario: DEFICIT (Income <= Expenses)", () => {
        const deficitFacts = {
            predictedIncomeCents: 100000,
            predictedExpensesCents: 120000,
            deltaCents: -20000,
            deltaPercent: -20,
            historicalMonthsCount: 3,
            subscriptionCount: 0,
            subscriptionTotalYearlyCents: 0
        }

        it("Advisor: Should NOT contain banned positive terms", () => {
            const state = deriveAdvisorState(deficitFacts)
            expect(state).toBe("deficit")
            const text = narrateAdvisor(deficitFacts, state).text.toLowerCase()

            BANNED_POSITIVE_TERMS.forEach(term => {
                expect(text).not.toContain(term)
            })
            expect(text).toContain("disavanzo")
        })
    })

    // ==========================================
    // SCENARIO 2: MICRO-SURPLUS (Buffer < 5%)
    // ==========================================
    describe("Scenario: MICRO-SURPLUS (0 < Buffer < 5%)", () => {
        // Income 1000, Exp 970 => Balance 30. Buffer = 30/1000 = 3%
        const income = 100000
        const balance = 3000

        it("Snapshot: Should be STRAINED/ATTENTION (not Stable)", () => {
            const facts = {
                snapshotId: "test", periodLabel: "Now",
                incomeFormatted: "€1.000", expensesFormatted: "€970", balanceFormatted: "€30",
                balanceCents: balance,
                incomeCents: income,
                // defaults
                utilizationPercent: undefined, superfluousPercent: undefined,
                elapsedRatio: 0.5 // Mid-month for standard tests
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const state = deriveSnapshotState(facts as any)

            expect(state).not.toBe("stable")
            expect(state).not.toBe("thriving")
            // Expect degradation
            expect(["strained", "calm", "attention"]).toContain(state) // inclusive check

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const text = narrateSnapshot(facts as any, state).text.toLowerCase()
            expect(text).not.toContain("stabile")
            expect(text).not.toContain("ottimo")
        })

        it("KPI Balance: Should be ATTENTION (not Good)", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const facts: any = {
                kpiId: "balance",
                valueFormatted: "€30",
                tone: "positive", // Input tone might be positive, but derivation must downgrade
                bufferRatio: 0.03
            }
            const state = deriveKPIState(facts)
            expect(state).toBe("attention")
            expect(state).not.toBe("good")

            const text = narrateKPI(facts, state).text.toLowerCase()
            expect(text).not.toContain("ottimo")
        })
    })

    // ==========================================
    // SCENARIO 3: SOLID SURPLUS (Buffer >= 5%)
    // ==========================================
    describe("Scenario: SOLID SURPLUS (Buffer >= 5%)", () => {
        // Income 1000, Exp 940 => Balance 60. Buffer = 60/1000 = 6%
        const income = 100000
        const balance = 6000

        it("Snapshot: Should be STABLE or THRIVING", () => {
            const facts = {
                snapshotId: "test", periodLabel: "Now",
                incomeFormatted: "€1.000", expensesFormatted: "€940", balanceFormatted: "€60",
                balanceCents: balance,
                incomeCents: income,
                elapsedRatio: 0.5 // satisfy B2 (pacing required)
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const state = deriveSnapshotState(facts as any)
            expect(["stable", "thriving"]).toContain(state)
        })

        it("KPI Balance: Should be GOOD", () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const facts: any = {
                kpiId: "balance",
                valueFormatted: "€60",
                tone: "positive",
                bufferRatio: 0.06
            }
            const state = deriveKPIState(facts)
            expect(state).toBe("good")
        })
    })

    // ==========================================
    // SCENARIO 4: MISSING DATA
    // ==========================================
    describe("Scenario: MISSING INCOME DATA", () => {
        it("Snapshot: Positive Balance but Unknown Income -> CALM (not Stable)", () => {
            const facts = {
                snapshotId: "test", periodLabel: "Now",
                incomeFormatted: "€0", expensesFormatted: "€0", balanceFormatted: "€10",
                balanceCents: 1000,
                incomeCents: 0 // Missing/Zero
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const state = deriveSnapshotState(facts as any)
            expect(state).toBe("calm")
            expect(state).not.toBe("stable")
        })
    })

    // ==========================================
    // SCENARIO 5: BUDGET PACING (B1-B6)
    // ==========================================
    describe("Scenario: BUDGET PACING (Rules B1-B6)", () => {

        it("B1: Early month (elapsed < 15%) -> early_uncertain", () => {
            const facts = {
                snapshotId: "test", periodLabel: "Now",
                balanceCents: 10000, incomeCents: 100000,
                utilizationPercent: 5, elapsedRatio: 0.1 // day 3/30
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const state = deriveSnapshotState(facts as any)
            expect(state).toBe("early_uncertain")

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const narration = narrateSnapshot(facts as any, state)
            expect(narration.text).toContain("iniziato")
        })

        it("B3: Utilization > Elapsed (Pacing Off) -> at_risk", () => {
            const facts = {
                snapshotId: "test", periodLabel: "Now",
                balanceCents: 50000, incomeCents: 100000,
                utilizationPercent: 60, elapsedRatio: 0.4 // spent 60% in 40% time
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const state = deriveSnapshotState(facts as any)
            expect(state).toBe("at_risk")

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const narration = narrateSnapshot(facts as any, state)
            const text = narration.text.toLowerCase()
            expect(text.match(/inferiore|ritmo|proiezione|elevato/)).toBeTruthy()
        })

        it("B4: Projected Overrun -> at_risk", () => {
            const facts = {
                snapshotId: "test", periodLabel: "Now",
                balanceCents: 10000, incomeCents: 100000,
                utilizationPercent: 50, elapsedRatio: 0.4,
                isProjectedOverrun: true
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const state = deriveSnapshotState(facts as any)
            expect(state).toBe("at_risk")

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const narration = narrateSnapshot(facts as any, state)
            expect(narration.text).toContain("proiezione")
        })

        it("B5: Over Budget -> critical (or equivalent)", () => {
            const facts = {
                snapshotId: "test", periodLabel: "Now",
                balanceCents: -500, incomeCents: 100000,
                utilizationPercent: 110, elapsedRatio: 0.9
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const state = deriveSnapshotState(facts as any)
            expect(state).toBe("critical")

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const narration = narrateSnapshot(facts as any, state)
            expect(narration.text).toContain("superato")
        })

        it("B6: Data Incomplete -> calm", () => {
            const facts = {
                snapshotId: "test", periodLabel: "Now",
                balanceCents: 0, incomeCents: 0,
                isDataIncomplete: true
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const state = deriveSnapshotState(facts as any)
            expect(state).toBe("calm")

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const narration = narrateSnapshot(facts as any, state)
            expect(narration.text).toContain("limitati")
        })
    })
})
