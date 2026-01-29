
import { NUMAGoal, GoalPortfolio, ProjectionResult, ProjectionInput } from "../types"
import { projectGoalReachability } from "./projection-engine"
import { addMonths } from "date-fns"

export interface PortfolioProjection {
    goalId: string
    projection: ProjectionResult
}

export interface PortfolioMetrics {
    projections: PortfolioProjection[]
    totalMonths: number
}

/**
 * Calculates projections for a portfolio of goals to be executed sequentially.
 * Competition is for time, not money. 100% of the active rhythm's benefit 
 * is applied to the main goal first, then to the next in the sequence.
 */
export function calculatePortfolioProjections(
    portfolio: GoalPortfolio,
    globalInput: Omit<ProjectionInput, "goalTarget" | "startDate">
): PortfolioMetrics {
    const { goals, mainGoalId } = portfolio

    // 1. Sort goals: Main Goal first, then others by creation date (fallback)
    const sortedGoals = [...goals].sort((a, b) => {
        if (a.id === mainGoalId) return -1
        if (b.id === mainGoalId) return 1
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

    const projections: PortfolioProjection[] = []
    let currentStartDate = new Date()
    let totalMonths = 0

    const rhythmBenefit = portfolio.activeRhythm?.benefitCents || 0
    const effectiveFCF = globalInput.currentFreeCashFlow + rhythmBenefit

    for (const goal of sortedGoals) {
        // If goal is already reached, skip or set zeroed projection
        if (goal.reachedAt) {
            projections.push({
                goalId: goal.id,
                projection: {
                    minMonths: 0, likelyMonths: 0, maxMonths: 0,
                    minDate: new Date(goal.reachedAt),
                    likelyDate: new Date(goal.reachedAt),
                    maxDate: new Date(goal.reachedAt),
                    canReach: true
                }
            })
            continue
        }

        const result = projectGoalReachability({
            ...globalInput,
            currentFreeCashFlow: effectiveFCF, // Use rhythms-improved FCF
            goalTarget: goal.targetCents,
            startDate: currentStartDate
        })

        projections.push({
            goalId: goal.id,
            projection: result
        })

        // Cumulative time: the next goal starts when this one likely ends
        if (result.canReach && result.likelyMonths !== Infinity) {
            currentStartDate = result.likelyDate
            totalMonths += result.likelyMonths
        } else {
            // If one goal is unreachable, the following ones are also effectively pushed to infinity
            currentStartDate = addMonths(currentStartDate, 1200) // +100 years
            totalMonths = Infinity
        }
    }

    return {
        projections,
        totalMonths
    }
}
