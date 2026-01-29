import { ScenarioConfig, ActiveGoalCommitment } from "../types"
import { BaselineMetrics } from "./financial-baseline"
import { Category } from "@/features/categories/config"
import { upsertBudget } from "@/features/budget/api/repository"
import { BudgetPlan, BudgetGroupId } from "@/features/budget/api/types"
import { getPortfolio, savePortfolio } from "../api/goal-repository"
import { format } from "date-fns"

interface ActivateRhythmInput {
    userId: string
    goalTargetCents: number
    scenario: ScenarioConfig
    baseline: BaselineMetrics
    categories: Category[]
    goalId?: string // Optional: targeting a specific goal in the portfolio
    goalTitle?: string
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
    categories,
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

    // Update active rhythm
    portfolio.activeRhythm = {
        type: scenario.type,
        label: scenario.label,
        intensity,
        activatedAt: new Date().toISOString()
    }

    // If goalId provided, ensure it's the main or exists
    if (goalId) {
        const existing = portfolio.goals.find(g => g.id === goalId)
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

    await savePortfolio(portfolio)

    const commitment: ActiveGoalCommitment = {
        id: portfolio.mainGoalId,
        goalTargetCents,
        rhythmType: scenario.type,
        rhythmLabel: scenario.label,
        intensity,
        activatedAt: portfolio.activeRhythm.activatedAt
    }

    // 2. Derive Internal Operational Parameters (Automated Budgeting)
    // This is the "artifact" used by the rest of the system for pacing.
    const currentPeriod = format(new Date(), "yyyy-MM")

    // Calculate internal budget based on scenario savings map applied to historical averages
    // Note: We don't expose these numbers to the user in the Lab, but they drive the Dashboard.
    const groupBudgets: Record<BudgetGroupId, number> = {
        essential: 0,
        comfort: 0,
        superfluous: 0
    }

    // Accumulate total projected spending
    let totalProjectedSpending = 0

    // Map categories to Nature clusters
    categories.forEach(cat => {
        const catId = cat.id
        const nature = (cat.spendingNature as BudgetGroupId) || 'comfort'

        // Find historical average for this category? 
        // Wait, BaselineMetrics only has aggregates. We need per-category averages.
        // But the ScenarioConfig has savingsMap (categoryId -> % reduction).
        // For simplicity in this Phase, we apply the intensity/rhythm logic to clusters
        // OR we need to fetch individual averages. 
        // Let's assume we use the cluster logic since the scenario generator is nature-based.
    })

    // Revised translation logic using cluster-based intensity
    const natureAppliedIntensity: Record<BudgetGroupId, number> = {
        essential: 0,
        comfort: 0,
        superfluous: 0
    }

    // Extract common savings from scenario (since our generator uses nature-based broad strokes)
    if (scenario.type === 'balanced') {
        natureAppliedIntensity.superfluous = 20
        natureAppliedIntensity.comfort = 5
    } else if (scenario.type === 'aggressive') {
        natureAppliedIntensity.superfluous = 40
        natureAppliedIntensity.comfort = 15
    }

    // Translate clusters to cents
    const essentialBudget = baseline.averageEssentialExpenses // Essential is usually untouched (0% cut)

    // For Comfort and Superfluous, we need their specific baselines. 
    // Since BaselineMetrics doesn't have them separately, we derive them.
    // In a real refined engine, we'd have exact per-category averages here.
    const nonEssentialTotal = baseline.averageMonthlyExpenses - baseline.averageEssentialExpenses

    // Applying the rhythm to the non-essential total (simplified for MVP orchestrator)
    // In the future, we'll use per-category averages from simulator.
    const appliedRhythmBenefit = balanceRhythmAcrossGroups(nonEssentialTotal, natureAppliedIntensity)

    const globalBudgetAmountCents = baseline.averageMonthlyExpenses - appliedRhythmBenefit

    await upsertBudget(userId, currentPeriod, {
        period: currentPeriod,
        globalBudgetAmountCents,
        groupBudgets: [
            { groupId: 'essential', label: "Essenziali", amountCents: baseline.averageEssentialExpenses },
            { groupId: 'comfort', label: "Benessere", amountCents: Math.round((nonEssentialTotal * 0.7) * (1 - natureAppliedIntensity.comfort / 100)) },
            { groupId: 'superfluous', label: "Extra", amountCents: Math.round((nonEssentialTotal * 0.3) * (1 - natureAppliedIntensity.superfluous / 100)) }
        ]
    })

    return commitment
}

/**
 * Simplified helper to calculate an intensity score for the truth model.
 */
function calculateAggregateIntensity(scenario: ScenarioConfig): number {
    if (scenario.type === 'baseline') return 0
    if (scenario.type === 'balanced') return 0.5
    if (scenario.type === 'aggressive') return 1.0
    return 0
}

/**
 * Mocking a balance logic for MVP. 
 */
function balanceRhythmAcrossGroups(nonEssentialTotal: number, natureAppliedIntensity: Record<BudgetGroupId, number>): number {
    const comfortBasis = nonEssentialTotal * 0.7 // Assumptions for demo
    const superfluousBasis = nonEssentialTotal * 0.3

    const comfortReduction = (comfortBasis * (natureAppliedIntensity.comfort || 0)) / 100
    const superfluousReduction = (superfluousBasis * (natureAppliedIntensity.superfluous || 0)) / 100

    return Math.round(comfortReduction + superfluousReduction)
}
