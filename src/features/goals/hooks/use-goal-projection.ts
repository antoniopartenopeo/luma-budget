
import { useMemo } from "react"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { useCategories } from "@/features/categories/api/use-categories"
import { useMonthlyAverages } from "@/features/simulator/hooks"
import { applySavings, computeEffectiveSavingsPct } from "@/features/simulator/utils"
import { calculateBaselineMetrics } from "../logic/financial-baseline"
import { checkScenarioSustainability } from "../logic/sustainability-guard"
import { projectGoalReachability } from "../logic/projection-engine"
import { SustainabilityResult, ProjectionResult } from "../types"

interface UseGoalProjectionProps {
    goalTarget: number
    simulationPeriod?: 3 | 6 | 12
    categoryOverrides?: Record<string, number> // categoryId -> % saving (0-100)
    groupSavings?: Record<string, number> // nature -> % saving
}

interface UseGoalProjectionResult {
    isLoading: boolean
    baselineMetrics: {
        income: number
        expenses: number
        fcf: number
    } | null
    sustainability: SustainabilityResult | null
    projection: ProjectionResult | null
    simulatedExpenses: number
}

export function useGoalProjection({
    goalTarget,
    simulationPeriod = 6,
    categoryOverrides = {},
    groupSavings = {}
}: UseGoalProjectionProps): UseGoalProjectionResult {

    // 1. Fetch Data
    const { data: transactions = [], isLoading: isTxLoading } = useTransactions()
    const { data: categories = [], isLoading: isCatLoading } = useCategories()
    const { rawAverages, isLoading: isSimLoading } = useMonthlyAverages(simulationPeriod)

    const isLoading = isTxLoading || isCatLoading || isSimLoading

    // 2. Compute Baseline Metrics (Income, StdDev)
    const baseline = useMemo(() => {
        if (isLoading || transactions.length === 0) return null
        return calculateBaselineMetrics(transactions, categories, simulationPeriod)
    }, [transactions, categories, simulationPeriod, isLoading])

    // 3. Compute Savings Scenario (Simulated Expenses)
    // We reuse the Simulator Logic to apply percentage cuts
    const simulation = useMemo(() => {
        if (!rawAverages || categories.length === 0) return null

        // Convert simplistic inputs to the map expected by applySavings
        const savingsMap: Record<string, number> = {}

        // Iterate all averages to determine effective saving per category
        Object.values(rawAverages).forEach(avg => {
            const cat = categories.find(c => c.id === avg.categoryId)
            if (cat) {
                const groupPct = groupSavings[cat.spendingNature] || 0
                const overridePct = categoryOverrides[cat.id] ?? null
                savingsMap[cat.id] = computeEffectiveSavingsPct(groupPct, overridePct)
            }
        })

        return applySavings(rawAverages, savingsMap)
    }, [rawAverages, categories, groupSavings, categoryOverrides])

    // 4. Run Engines
    const result = useMemo(() => {
        if (!baseline || !simulation) return { sust: null, proj: null }

        // Logic:
        // Projected Expenses = Simulated Total from applying savings
        // Projected FCF = Income - Projected Expenses
        // Essential Savings = Baseline Essential - Simulated Essential
        // Wait, 'simulation' object result doesn't explicitly separate essential vs others in aggregate
        // But 'categoryResults' does.

        // Calculate Essential Savings Amount for Sustainability Check
        let essentialSavingsCents = 0
        Object.values(simulation.categoryResults).forEach(res => {
            const cat = categories.find(c => c.id === res.baseline) // Wait, res keys are catIds.
            // Oh, retrieving cat from ID in outer scope loop is inefficient check.
            // Let's rely on finding it.
            // Actually, checkScenarioSustainability needs 'essentialSavingsAmount' and 'essentialExpensesAvg'.
            // baseline.averageEssentialExpenses is the Average Baseline.
            // We need to know how much we CUT from it.
        })

        // Re-calculate essential cut purely
        let projectedEssentialExpenses = 0
        Object.keys(simulation.categoryResults).forEach(catId => {
            const cat = categories.find(c => c.id === catId)
            const res = simulation.categoryResults[catId]
            if (cat?.spendingNature === 'essential') {
                projectedEssentialExpenses += res.simulated
            }
        })
        const essentialSavings = baseline.averageEssentialExpenses - projectedEssentialExpenses

        // A. Check Sustainability
        const sust = checkScenarioSustainability(
            baseline.averageMonthlyIncome,
            baseline.averageEssentialExpenses,
            Math.max(0, essentialSavings), // positive number
            simulation.simulatedTotal
        )

        // B. Project Reachability
        // FCF for projection is (Income - SimulatedExpenses)
        const currentProjectedFCF = baseline.averageMonthlyIncome - simulation.simulatedTotal

        const proj = projectGoalReachability({
            goalTarget: goalTarget, // Input is already in Cents per Hook contract
            currentFreeCashFlow: currentProjectedFCF,
            historicalVariability: baseline.expensesStdDev
        })

        return { sust, proj }
    }, [baseline, simulation, goalTarget, categories])

    return {
        isLoading,
        baselineMetrics: baseline ? {
            income: baseline.averageMonthlyIncome,
            expenses: baseline.averageMonthlyExpenses,
            fcf: baseline.averageMonthlyIncome - baseline.averageMonthlyExpenses
        } : null,
        sustainability: result.sust,
        projection: result.proj,
        simulatedExpenses: simulation?.simulatedTotal || 0
    }
}
