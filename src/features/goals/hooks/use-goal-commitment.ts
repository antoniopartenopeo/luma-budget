
import { useState, useEffect } from "react"
import { ActiveGoalCommitment, GoalScenarioResult } from "../types"
import { getCommitment, clearCommitment } from "../api/goal-repository"
import { activateRhythm } from "../logic/rhythm-orchestrator"
import { BaselineMetrics } from "../logic/financial-baseline"
import { Category } from "@/features/categories/config"

interface UseGoalCommitmentProps {
    userId: string
    baseline: BaselineMetrics | null
    categories: Category[]
}

export function useGoalCommitment({ userId, baseline, categories }: UseGoalCommitmentProps) {
    const [activeCommitment, setActiveCommitment] = useState<ActiveGoalCommitment | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isCommitting, setIsCommitting] = useState(false)

    // Load active commitment on mount
    useEffect(() => {
        async function load() {
            try {
                const stored = await getCommitment()
                setActiveCommitment(stored)
            } catch (e) {
                console.error("Failed to load commitment", e)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    /**
     * Commits the user to a specific rhythm/scenario.
     */
    const commitRhythm = async (scenarioResult: GoalScenarioResult, goalTargetCents: number) => {
        if (!baseline) return

        setIsCommitting(true)
        try {
            const commitment = await activateRhythm({
                userId,
                goalTargetCents,
                scenario: scenarioResult.config,
                baseline,
                categories
            })
            setActiveCommitment(commitment)
            return commitment
        } catch (e) {
            console.error("Commit failed", e)
            throw e
        } finally {
            setIsCommitting(false)
        }
    }

    const revokeCommitment = async () => {
        setIsCommitting(true)
        try {
            await clearCommitment()
            setActiveCommitment(null)
        } finally {
            setIsCommitting(false)
        }
    }

    return {
        activeCommitment,
        isLoading,
        isCommitting,
        commitRhythm,
        revokeCommitment
    }
}
