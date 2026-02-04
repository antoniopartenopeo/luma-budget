import { describe, it, expect } from "vitest"
import { narrateSnapshot } from "../snapshot.narrator"
import { deriveSnapshotState } from "../derive-state"
import { SnapshotFacts } from "../types"

/**
 * Test suite for Snapshot Narrator
 * 
 * Tests use mock facts that are consistent with audit findings.
 * No calculations are performed - all facts are pre-computed.
 */

describe("snapshot.narrator", () => {
    describe("narrateSnapshot", () => {
        it("generates thriving message with savings rate", () => {
            const facts: SnapshotFacts = {
                snapshotId: "test-thriving",
                periodLabel: "Gennaio 2026",
                incomeFormatted: "€3.200",
                expensesFormatted: "€2.450",
                balanceFormatted: "+€750",
                balanceCents: 75000,
                budgetFormatted: "€3.000",
                utilizationPercent: 82,
                superfluousPercent: 8,
                superfluousTargetPercent: 10,
                savingsRatePercent: 23
            }

            const result = narrateSnapshot(facts, "thriving")

            expect(result.text).toContain("23%")
            expect(result.text).toContain("risparmio")
            expect(result.shortText).toBeDefined()
        })

        it("generates stable message for balanced situation", () => {
            const facts: SnapshotFacts = {
                snapshotId: "test-stable",
                periodLabel: "Gennaio 2026",
                incomeFormatted: "€2.500",
                expensesFormatted: "€2.400",
                balanceFormatted: "+€100",
                balanceCents: 10000,
                budgetFormatted: "€2.800",
                utilizationPercent: 75,
                superfluousPercent: 10,
                superfluousTargetPercent: 10,
                savingsRatePercent: 4
            }

            const result = narrateSnapshot(facts, "stable")

            expect(result.text).toContain("in equilibrio")
            expect(result.shortText).toBe("Situazione stabile")
        })

        it("generates strained message when balance is negative", () => {
            const facts: SnapshotFacts = {
                snapshotId: "test-negative-balance",
                periodLabel: "Gennaio 2026",
                incomeFormatted: "€2.000",
                expensesFormatted: "€2.500",
                balanceFormatted: "-€500",
                balanceCents: -50000
            }

            const result = narrateSnapshot(facts, "strained")

            expect(result.text).toContain("negativo")
            expect(result.shortText).toBe("Saldo in negativo")
        })

        it("generates strained message when superfluous over target", () => {
            const facts: SnapshotFacts = {
                snapshotId: "test-strained-superfluous",
                periodLabel: "Gennaio 2026",
                incomeFormatted: "€3.000",
                expensesFormatted: "€2.800",
                balanceFormatted: "+€200",
                balanceCents: 20000,
                budgetFormatted: "€3.000",
                utilizationPercent: 85,
                superfluousPercent: 18,
                superfluousTargetPercent: 10,
                savingsRatePercent: 7
            }

            const result = narrateSnapshot(facts, "strained")

            expect(result.text).toContain("18%")
            expect(result.text).toContain("superflue")
            expect(result.text).toContain("10%")
        })

        it("generates strained message when budget over 90%", () => {
            const facts: SnapshotFacts = {
                snapshotId: "test-strained-budget",
                periodLabel: "Gennaio 2026",
                incomeFormatted: "€2.000",
                expensesFormatted: "€1.900",
                balanceFormatted: "+€100",
                balanceCents: 10000,
                budgetFormatted: "€2.000",
                utilizationPercent: 95,
                superfluousPercent: 8,
                superfluousTargetPercent: 10
            }

            const result = narrateSnapshot(facts, "strained")

            expect(result.text).toContain("95%")
            expect(result.text).toContain("budget")
        })

        it("generates critical message for budget overrun with negative balance", () => {
            const facts: SnapshotFacts = {
                snapshotId: "test-critical",
                periodLabel: "Gennaio 2026",
                incomeFormatted: "€2.000",
                expensesFormatted: "€2.500",
                balanceFormatted: "-€500",
                balanceCents: -50000,
                budgetFormatted: "€2.000",
                utilizationPercent: 110,
                superfluousPercent: 25,
                superfluousTargetPercent: 10
            }

            const result = narrateSnapshot(facts, "critical")

            expect(result.text).toContain("superato")
            expect(result.text).toContain("negativo")
            expect(result.text).toContain("110%")
            expect(result.shortText).toContain("Budget oltre limite")
        })

        it("generates calm message for early month/insufficient data", () => {
            const facts: SnapshotFacts = {
                snapshotId: "test-calm",
                periodLabel: "Gennaio 2026",
                incomeFormatted: "€0",
                expensesFormatted: "€0",
                balanceFormatted: "€0",
                balanceCents: 0
            }

            const result = narrateSnapshot(facts, "calm")

            expect(result.text).toContain("fasi iniziali")
            expect(result.shortText).toBe("Dati iniziali")
        })
    })

    describe("deriveSnapshotState", () => {
        it("derives critical when negative balance AND budget overrun", () => {
            const facts: SnapshotFacts = {
                snapshotId: "test",
                periodLabel: "Test",
                incomeFormatted: "€0",
                expensesFormatted: "€0",
                balanceFormatted: "€0",
                balanceCents: -50000,
                utilizationPercent: 110,
                superfluousPercent: 5,
                superfluousTargetPercent: 10
            }

            expect(deriveSnapshotState(facts)).toBe("critical")
        })

        it("derives strained when balance is negative even if other metrics are ok", () => {
            const facts: SnapshotFacts = {
                snapshotId: "test",
                periodLabel: "Test",
                incomeFormatted: "€0",
                expensesFormatted: "€0",
                balanceFormatted: "€0",
                balanceCents: -100,
                utilizationPercent: 10,
                superfluousPercent: 2,
                superfluousTargetPercent: 10
            }

            expect(deriveSnapshotState(facts)).toBe("strained")
        })

        it("derives strained when budget over 90% even if balance is positive", () => {
            const facts: SnapshotFacts = {
                snapshotId: "test",
                periodLabel: "Test",
                incomeFormatted: "€0",
                expensesFormatted: "€0",
                balanceFormatted: "€0",
                balanceCents: 10000,
                utilizationPercent: 95,
                superfluousPercent: 8,
                superfluousTargetPercent: 10
            }

            expect(deriveSnapshotState(facts)).toBe("strained")
        })

        it("derives thriving with positive balance, good savings and NOT strained budget", () => {
            const facts: SnapshotFacts = {
                snapshotId: "test",
                periodLabel: "Test",
                incomeFormatted: "€0",
                expensesFormatted: "€0",
                balanceFormatted: "€0",
                balanceCents: 75000,
                incomeCents: 320000,
                utilizationPercent: 80,
                superfluousPercent: 8,
                superfluousTargetPercent: 10,
                savingsRatePercent: 23,
                elapsedRatio: 0.85
            }

            expect(deriveSnapshotState(facts)).toBe("thriving")
        })

        it("derives stable when balance is positive but no thriving indicators", () => {
            const facts: SnapshotFacts = {
                snapshotId: "test",
                periodLabel: "Test",
                incomeFormatted: "€0",
                expensesFormatted: "€0",
                balanceFormatted: "€0",
                balanceCents: 20000,
                incomeCents: 250000,
                utilizationPercent: 75,
                superfluousPercent: 10,
                superfluousTargetPercent: 10,
                savingsRatePercent: 4,
                elapsedRatio: 0.8
            }

            expect(deriveSnapshotState(facts)).toBe("stable")
        })

        it("derives calm when balance is 0 and no other signals", () => {
            const facts: SnapshotFacts = {
                snapshotId: "test",
                periodLabel: "Test",
                incomeFormatted: "€0",
                expensesFormatted: "€0",
                balanceFormatted: "€0",
                balanceCents: 0
            }

            expect(deriveSnapshotState(facts)).toBe("calm")
        })
    })
})
