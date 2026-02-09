
import { useState, useEffect, useMemo } from "react"
import { GoalPortfolio, NUMAGoal, ProjectionInput } from "@/VAULT/goals/types"
import { getPortfolio, savePortfolio } from "@/VAULT/goals/api/goal-repository"
import { calculatePortfolioProjections, PortfolioMetrics } from "@/VAULT/goals/logic/multi-goal-orchestrator"
import { deleteBudget } from "@/VAULT/budget/api/repository"
import { format } from "date-fns"
import { LOCAL_USER_ID } from "@/lib/runtime-user"

interface UseGoalPortfolioProps {
    globalProjectionInput: Omit<ProjectionInput, "goalTarget" | "startDate">
}

export function useGoalPortfolio({ globalProjectionInput }: UseGoalPortfolioProps) {
    const [portfolio, setPortfolio] = useState<GoalPortfolio | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getPortfolio().then(data => {
            setPortfolio(data)
            setIsLoading(false)
        })
    }, [])

    const metrics: PortfolioMetrics | null = useMemo(() => {
        if (!portfolio) return null
        return calculatePortfolioProjections(portfolio, globalProjectionInput)
    }, [portfolio, globalProjectionInput])

    const setMainGoal = async (goalId: string) => {
        if (!portfolio) return
        const updated = { ...portfolio, mainGoalId: goalId }
        setPortfolio(updated)
        await savePortfolio(updated)
    }

    const addGoal = async (title: string, targetCents: number) => {
        const newGoal: NUMAGoal = {
            id: `goal-${Date.now()}`,
            title,
            targetCents,
            createdAt: new Date().toISOString()
        }

        let updated: GoalPortfolio

        if (!portfolio || portfolio.goals.length === 0 || !portfolio.mainGoalId) {
            // First goal creation or recovery from empty state
            updated = {
                ...portfolio,
                mainGoalId: newGoal.id,
                goals: [newGoal]
            }
        } else {
            updated = {
                ...portfolio,
                goals: [...portfolio.goals, newGoal]
            }
        }

        setPortfolio(updated)
        await savePortfolio(updated)
    }

    const setRhythm = async (type: "baseline" | "balanced" | "aggressive" | "manual", label: string, benefitCents: number) => {
        if (!portfolio) return
        const updated: GoalPortfolio = {
            ...portfolio,
            activeRhythm: {
                type,
                label,
                intensity: 0,
                benefitCents,
                activatedAt: new Date().toISOString()
            }
        }
        setPortfolio(updated)
        await savePortfolio(updated)
    }

    const removeGoal = async (goalId: string) => {
        if (!portfolio) return
        const updatedGoals = portfolio.goals.filter(g => g.id !== goalId)

        // Cleanup cascade: if no goals remain, clear derived state
        if (updatedGoals.length === 0) {
            const updated: GoalPortfolio = {
                ...portfolio,
                goals: [],
                mainGoalId: undefined as unknown as string, // Clear active goal
                activeRhythm: undefined // Clear rhythm
            }
            setPortfolio(updated)
            await savePortfolio(updated)

            // Delete budget for current period to prevent stale Dashboard
            const currentPeriod = format(new Date(), "yyyy-MM")
            await deleteBudget(LOCAL_USER_ID, currentPeriod)
            return
        }

        // Standard path: reassign mainGoalId if needed
        let newMainGoalId = portfolio.mainGoalId
        if (newMainGoalId === goalId) {
            newMainGoalId = updatedGoals[0].id
        }
        const updated = {
            ...portfolio,
            goals: updatedGoals,
            mainGoalId: newMainGoalId
        }
        setPortfolio(updated)
        await savePortfolio(updated)
    }

    const updateGoal = async (goalId: string, updates: Partial<Pick<NUMAGoal, "title" | "targetCents">>) => {
        if (!portfolio) return
        const updatedGoals = portfolio.goals.map(g =>
            g.id === goalId ? { ...g, ...updates } : g
        )
        const updated = { ...portfolio, goals: updatedGoals }
        setPortfolio(updated)
        await savePortfolio(updated)
    }


    return {
        portfolio,
        metrics,
        isLoading,
        activeRhythm: portfolio?.activeRhythm,
        setMainGoal,
        addGoal,
        removeGoal,
        updateGoal,
        setRhythm
    }
}
