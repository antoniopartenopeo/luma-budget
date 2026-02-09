/**
 * Narration Orchestrator
 * =====================
 * 
 * Logic to coordinate multiple narrative signals, avoiding contradictions
 * and prioritizing the most relevant information for the user.
 * 
 * Rules (R1-R5):
 * R1: Scope Priority (current_period > long_term)
 * R2: Severity Priority (critical > high > medium > low)
 * R3: Consistency (Avoid contradictions)
 * R4: De-duplication (No multiple signals of the same source)
 * R5: Structure (1 Primary + max 2 Secondary)
 */

import { NarrationCandidate, OrchestratedNarration } from "./types"

/**
 * Orchestrates a set of narration candidates into a final result.
 */
export function orchestrateNarration(
    candidates: NarrationCandidate[]
): OrchestratedNarration | null {
    if (candidates.length === 0) return null

    const rulesTriggered: string[] = []

    // 1. Initial Filtering (R3 - Consistency)
    // Rule: If there's a current_period critical signal (e.g. Deficit), 
    // supress long_term positive signals (e.g. Surplus projected in 6 months) to avoid confusion.
    const hasCurrentCritical = candidates.some(c => c.scope === "current_period" && c.severity === "critical")
    let workingSet = candidates
    if (hasCurrentCritical) {
        workingSet = candidates.filter(c => !(c.scope === "long_term" && (c.id.includes("surplus") || c.id.includes("improving"))))
        if (workingSet.length < candidates.length) {
            rulesTriggered.push("R3: Suppressed contradictory long-term positive signals due to current critical status.")
        }
    }

    // 2. Sorting based on R1 and R2
    // We Map severity to ranks (lower is higher priority)
    const severityRank = { critical: 0, high: 1, medium: 2, low: 3 }
    const scopeRank = { current_period: 0, long_term: 1 }

    const sorted = [...workingSet].sort((a, b) => {
        // First by Scope (R1)
        if (scopeRank[a.scope] !== scopeRank[b.scope]) {
            return scopeRank[a.scope] - scopeRank[b.scope]
        }
        // Then by Severity (R2)
        return severityRank[a.severity] - severityRank[b.severity]
    })

    // 3. De-duplication (R4)
    // Keep only one signal per source (e.g. only the most severe spike)
    const seenSources = new Set<string>()
    const uniqueCandidates: NarrationCandidate[] = []

    for (const c of sorted) {
        if (!seenSources.has(c.source)) {
            uniqueCandidates.push(c)
            seenSources.add(c.source)
        } else {
            rulesTriggered.push(`R4: De-duplicated signal from source: ${c.source}`)
        }
    }

    // 4. Final Selection (R5)
    const primary = uniqueCandidates[0]
    const secondary = uniqueCandidates.slice(1, 3) // Max 2
    const allUsedIds = new Set([primary.id, ...secondary.map(s => s.id)])
    const suppressed = candidates.filter(c => !allUsedIds.has(c.id))

    rulesTriggered.push(`R5: Selected 1 Primary and ${secondary.length} Secondary signals.`)

    // Context Computation for Flagging
    const hasHighSeverityCurrentIssue = primary.scope === "current_period" && (primary.severity === "high" || primary.severity === "critical")

    return {
        primary,
        secondary,
        suppressed,
        rationale: {
            rulesTriggered
        },
        context: {
            hasHighSeverityCurrentIssue
        }
    }
}
