import { ScenarioConfig, ActiveGoalCommitment } from "../types"
import { BaselineMetrics } from "./financial-baseline"
import { upsertBudget } from "@/VAULT/budget/api/repository"
import { BudgetGroupId } from "@/VAULT/budget/api/types"
import { getPortfolio, savePortfolio } from "../api/goal-repository"
import { format } from "date-fns"
import { RHYTHMS } from "../config/rhythms"

interface ActivateRhythmInput {
    userId: string
    goalTargetCents: number
    scenario: ScenarioConfig
    baseline: BaselineMetrics
    goalId?: string // Optional: targeting a specific goal in the portfolio
    goalTitle?: string
}

interface SavingsMap {
    superfluous: number
    comfort: number
}

type ScenarioWithOptionalSavings = Pick<ScenarioConfig, "type"> & {
    savingsMap?: SavingsMap
}

/**
 * Orchestrates the "Conscious Commitment" process for a portfolio of goals.
 * 1. Persists the Rhythm choice as the global active rhythm in the portfolio.
 * 2. Translates the rhythm's intensity into internal operational parameters (BudgetPlan).
 */
export async function activateRhythm({
    userId,
    goalTargetCents,
    scenario,
    baseline,
    goalId,
    goalTitle
}: ActivateRhythmInput): Promise<ActiveGoalCommitment> {

    // 1. Manage the Portfolio (Truth)
    const intensity = calculateAggregateIntensity(scenario)
    let portfolio = await getPortfolio()

    if (!portfolio) {
        // Initialize empty or with the first goal
        const firstGoalId = goalId || `goal-${Date.now()}`
        portfolio = {
            mainGoalId: firstGoalId,
            goals: [{
                id: firstGoalId,
                title: goalTitle || "Obiettivo Principale",
                targetCents: goalTargetCents,
                createdAt: new Date().toISOString()
            }]
        }
    }

    // Revised translation logic using cluster-based intensity
    const natureAppliedIntensity: Record<BudgetGroupId, number> = {
        essential: 0,
        comfort: 0,
        superfluous: 0
    }

    const normalizedSavingsMap = normalizeSavingsMap(scenario)
    natureAppliedIntensity.superfluous = normalizedSavingsMap.superfluous
    natureAppliedIntensity.comfort = normalizedSavingsMap.comfort

    // Calculate real benefit based on granular historical averages
    const superfluousBenefit = (baseline.averageSuperfluousExpenses * natureAppliedIntensity.superfluous) / 100
    const comfortBenefit = (baseline.averageComfortExpenses * natureAppliedIntensity.comfort) / 100
    const appliedRhythmBenefit = Math.round(superfluousBenefit + comfortBenefit)

    // Update active rhythm
    portfolio.activeRhythm = {
        type: scenario.type,
        label: scenario.label,
        intensity,
        benefitCents: Math.round(appliedRhythmBenefit),
        activatedAt: new Date().toISOString()
    }

    // If goalId provided, ensure it's the main or exists
    if (goalId) {
        const existing = portfolio.goals.find((g) => g.id === goalId)
        if (existing) {
            existing.targetCents = goalTargetCents
            portfolio.mainGoalId = goalId
        } else {
            portfolio.goals.push({
                id: goalId,
                title: goalTitle || "Nuovo Obiettivo",
                targetCents: goalTargetCents,
                createdAt: new Date().toISOString()
            })
            portfolio.mainGoalId = goalId
        }
    }

    if (!portfolio.mainGoalId && portfolio.goals.length > 0) {
        portfolio.mainGoalId = portfolio.goals[0].id
    }

    await savePortfolio(portfolio)

    const commitmentGoalId = portfolio.mainGoalId || goalId || portfolio.goals[0]?.id || `goal-${Date.now()}`

    const commitment: ActiveGoalCommitment = {
        id: commitmentGoalId,
        goalTargetCents,
        rhythmType: scenario.type,
        rhythmLabel: scenario.label,
        intensity,
        activatedAt: portfolio.activeRhythm.activatedAt
    }

    // 2. Derive Internal Operational Parameters (Automated Budgeting)
    // This is the "artifact" used by the rest of the system for pacing.
    const currentPeriod = format(new Date(), "yyyy-MM")

    // Logic is now purely based on aggregates in MVP phase.
    // In future versions we will use per-category averages.

    // Calculate real benefit based on granular historical averages
    // We already calculated appliedRhythmBenefit above.

    const globalBudgetAmountCents = baseline.averageMonthlyExpenses - appliedRhythmBenefit

    await upsertBudget(userId, currentPeriod, {
        period: currentPeriod,
        globalBudgetAmountCents,
        groupBudgets: [
            { groupId: 'essential', label: "Essenziali", amountCents: baseline.averageEssentialExpenses },
            { groupId: 'comfort', label: "Benessere", amountCents: Math.round(baseline.averageComfortExpenses * (1 - natureAppliedIntensity.comfort / 100)) },
            { groupId: 'superfluous', label: "Extra", amountCents: Math.round(baseline.averageSuperfluousExpenses * (1 - natureAppliedIntensity.superfluous / 100)) }
        ]
    })

    return commitment
}

/**
 * Simplified helper to calculate an intensity score for the truth model.
 */
function calculateAggregateIntensity(scenario: ScenarioConfig): number {
    const config = RHYTHMS.find(r => r.type === scenario.type)
    return config?.intensity || 0
}

function normalizeSavingsMap(scenario: ScenarioWithOptionalSavings): SavingsMap {
    if (scenario.savingsMap) {
        return scenario.savingsMap
    }

    const fallbackFromPreset = RHYTHMS.find((preset) => preset.type === scenario.type)?.savings
    if (fallbackFromPreset) {
        return fallbackFromPreset
    }

    return { superfluous: 0, comfort: 0 }
}
