
import { GoalPortfolio, ProjectionResult, ProjectionInput } from "../types"
import { projectGoalReachability } from "./projection-engine"

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
    let isSequenceBlocked = false

    const rhythmBenefit = portfolio.activeRhythm?.benefitCents || 0
    const effectiveFCF = globalInput.currentFreeCashFlow + rhythmBenefit

    for (const goal of sortedGoals) {
        // If goal is already reached, skip or set zeroed projection
        if (goal.reachedAt) {
            projections.push({
                goalId: goal.id,
                projection: {
                    minMonths: 0, likelyMonths: 0, maxMonths: 0,
                    minMonthsPrecise: 0,
                    likelyMonthsPrecise: 0,
                    maxMonthsPrecise: 0,
                    likelyMonthsComparable: 0,
                    minDate: new Date(goal.reachedAt),
                    likelyDate: new Date(goal.reachedAt),
                    maxDate: new Date(goal.reachedAt),
                    canReach: true
                }
            })
            continue
        }

        if (isSequenceBlocked) {
            projections.push({
                goalId: goal.id,
                projection: {
                    minMonths: 0,
                    likelyMonths: 0,
                    maxMonths: 0,
                    minMonthsPrecise: 0,
                    likelyMonthsPrecise: 0,
                    maxMonthsPrecise: 0,
                    likelyMonthsComparable: 0,
                    minDate: currentStartDate,
                    likelyDate: currentStartDate,
                    maxDate: currentStartDate,
                    canReach: false,
                    unreachableReason: "Obiettivo precedente non raggiungibile nel portafoglio corrente."
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
        if (result.canReach) {
            currentStartDate = result.likelyDate
            totalMonths += result.likelyMonths
        } else {
            // If one goal is unreachable, the following ones are blocked by sequence order.
            isSequenceBlocked = true
        }
    }

    return {
        projections,
        totalMonths
    }
}
