
import { useState, useEffect, useMemo } from "react"
import { GoalPortfolio, NUMAGoal, ProjectionInput } from "../types"
import { getPortfolio, savePortfolio } from "../api/goal-repository"
import { calculatePortfolioProjections, PortfolioMetrics } from "./multi-goal-orchestrator"

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

        if (!portfolio) {
            // First goal creation
            updated = {
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
        let newMainGoalId = portfolio.mainGoalId
        if (newMainGoalId === goalId && updatedGoals.length > 0) {
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

    return {
        portfolio,
        metrics,
        isLoading,
        activeRhythm: portfolio?.activeRhythm,
        setMainGoal,
        addGoal,
        removeGoal,
        setRhythm
    }
}
