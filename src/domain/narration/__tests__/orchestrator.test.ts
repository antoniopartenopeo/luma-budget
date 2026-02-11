import { describe, it, expect } from "vitest"
import { orchestrateNarration } from "../orchestrator"
import { NarrationCandidate } from "../types"

describe("orchestrator", () => {
    it("R1 & R2: prioritizes current_period and critical severity", () => {
        const candidates: NarrationCandidate[] = [
            {
                id: "low-current",
                source: "snapshot",
                scope: "current_period",
                severity: "low",
                narration: { text: "Low current" }
            },
            {
                id: "critical-long",
                source: "trend",
                scope: "long_term",
                severity: "critical",
                narration: { text: "Critical long term" }
            },
            {
                id: "high-current",
                source: "projection",
                scope: "current_period",
                severity: "high",
                narration: { text: "High current" }
            }
        ]

        const result = orchestrateNarration(candidates)
        expect(result?.primary.id).toBe("high-current")
        expect(result?.secondary[0].id).toBe("low-current")
        expect(result?.secondary[1].id).toBe("critical-long")
    })

    it("R3: suppresses contradictory long-term positive signals if current is critical", () => {
        const candidates: NarrationCandidate[] = [
            {
                id: "deficit-critical",
                source: "projection",
                scope: "current_period",
                severity: "critical",
                narration: { text: "Deficit critical" }
            },
            {
                id: "surplus-long",
                source: "projection",
                scope: "long_term",
                severity: "low",
                narration: { text: "Surplus long term" }
            },
            {
                id: "improving-trend",
                source: "trend",
                scope: "long_term",
                severity: "low",
                narration: { text: "Improving trend" }
            }
        ]

        const result = orchestrateNarration(candidates)
        expect(result?.primary.id).toBe("deficit-critical")
        expect(result?.secondary).toHaveLength(0)
        expect(result?.suppressed.map(s => s.id)).toContain("surplus-long")
        expect(result?.suppressed.map(s => s.id)).toContain("improving-trend")
        expect(result?.rationale.rulesTriggered[0]).toContain("R3")
    })

    it("R4: de-duplicates signals from the same source", () => {
        const candidates: NarrationCandidate[] = [
            {
                id: "spike-1",
                source: "risk_spike",
                scope: "current_period",
                severity: "high",
                narration: { text: "Spike 1" }
            },
            {
                id: "spike-2",
                source: "risk_spike",
                scope: "current_period",
                severity: "medium",
                narration: { text: "Spike 2" }
            }
        ]

        const result = orchestrateNarration(candidates)
        expect(result?.primary.id).toBe("spike-1")
        expect(result?.secondary).toHaveLength(0)
        expect(result?.suppressed.map(s => s.id)).toContain("spike-2")
        expect(result?.rationale.rulesTriggered.some(r => r.includes("R4"))).toBe(true)
    })

    it("R5: limits to 1 primary + max 2 secondary", () => {
        const candidates: NarrationCandidate[] = [
            { id: "c1", source: "projection", scope: "current_period", severity: "high", narration: { text: "c1" } },
            { id: "c2", source: "risk_spike", scope: "current_period", severity: "high", narration: { text: "c2" } },
            { id: "c3", source: "subscription", scope: "long_term", severity: "medium", narration: { text: "c3" } },
            { id: "c4", source: "trend", scope: "long_term", severity: "low", narration: { text: "c4" } }
        ]

        const result = orchestrateNarration(candidates)
        expect(result?.primary.id).toBe("c1")
        expect(result?.secondary).toHaveLength(2)
        expect(result?.suppressed).toHaveLength(1)
        expect(result?.suppressed[0].id).toBe("c4")
    })

    it("scenario: deficit + trend improving", () => {
        const candidates: NarrationCandidate[] = [
            { id: "deficit", source: "projection", scope: "current_period", severity: "critical", narration: { text: "Sei in deficit" } },
            { id: "improving", source: "trend", scope: "long_term", severity: "low", narration: { text: "Trend in miglioramento" } }
        ]

        const result = orchestrateNarration(candidates)
        expect(result?.primary.id).toBe("deficit")
        expect(result?.secondary).toHaveLength(0) // R3 suppression
    })

    it("scenario: no anomalies + trend improving", () => {
        const candidates: NarrationCandidate[] = [
            { id: "improving", source: "trend", scope: "long_term", severity: "low", narration: { text: "Ottimo trend" } }
        ]

        const result = orchestrateNarration(candidates)
        expect(result?.primary.id).toBe("improving")
        expect(result?.secondary).toHaveLength(0)
    })

    it("R3: suppresses low forecast reassurance if a high current issue exists", () => {
        const candidates: NarrationCandidate[] = [
            {
                id: "hike-atm",
                source: "subscription",
                scope: "current_period",
                severity: "high",
                narration: { text: "Aumento prezzo ATM" }
            },
            {
                id: "forecast-advisor",
                source: "projection",
                scope: "current_period",
                severity: "low",
                narration: { text: "Saldo totale stimato positivo." }
            },
            {
                id: "category-spike",
                source: "risk_spike",
                scope: "current_period",
                severity: "medium",
                narration: { text: "Spesa in aumento categoria X." }
            }
        ]

        const result = orchestrateNarration(candidates)

        expect(result?.primary.id).toBe("hike-atm")
        expect(result?.secondary.map(s => s.id)).toContain("category-spike")
        expect(result?.secondary.map(s => s.id)).not.toContain("forecast-advisor")
        expect(result?.suppressed.map(s => s.id)).toContain("forecast-advisor")
        expect(result?.rationale.rulesTriggered.some(rule => rule.includes("R3"))).toBe(true)
    })
})
