import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { buildNatureApplicationMap } from "@/domain/simulation"
import { queryKeys } from "@/lib/query-keys"
import { LOCAL_USER_ID } from "@/lib/runtime-user"
import { activateRhythm } from "@/VAULT/goals/logic/rhythm-orchestrator"
import { calculateScenario } from "@/VAULT/goals/logic/scenario-calculator"
import { BrainAssistSignal, ScenarioKey } from "@/VAULT/goals/types"
import { useAIAdvisor } from "@/features/insights/use-ai-advisor"
import { useMonthlyAverages } from "@/features/simulator/hooks"
import { SimulationPeriod } from "@/features/simulator/utils"

import { useGoalPortfolio } from "./use-goal-portfolio"
import { useGoalScenarios } from "./use-goal-scenarios"

export function useSimulatorCommandCenter() {
    const queryClient = useQueryClient()
    const [isCreatingGoal, setIsCreatingGoal] = useState(false)

    const projectionSettings = useMemo(() => ({
        currentFreeCashFlow: 0,
        historicalVariability: 0.1
    }), [])

    const {
        portfolio,
        isLoading: isPortfolioLoading,
        refreshPortfolio,
        addGoal,
        setMainGoal,
        updateGoal,
        removeGoal
    } = useGoalPortfolio({
        globalProjectionInput: projectionSettings
    })

    const activeGoal = useMemo(
        () => portfolio?.goals.find((goal) => goal.id === portfolio.mainGoalId),
        [portfolio]
    )

    const [goalTargetCents, setGoalTargetCents] = useState<number>(activeGoal?.targetCents || 0)
    const [goalTitle, setGoalTitle] = useState<string>(activeGoal?.title || "")

    useEffect(() => {
        if (activeGoal?.id) {
            setGoalTargetCents(activeGoal.targetCents)
            setGoalTitle(activeGoal.title)
            return
        }

        setGoalTargetCents(0)
        setGoalTitle("")
    }, [activeGoal?.id, activeGoal?.targetCents, activeGoal?.title])

    const [period] = useState<SimulationPeriod>(6)
    const [activeScenarioKey, setActiveScenarioKey] = useState<ScenarioKey>("baseline")
    const [isAdvancedSheetOpen, setIsAdvancedSheetOpen] = useState(false)
    const [customSavings, setCustomSavings] = useState<{ superfluous: number; comfort: number }>({
        superfluous: 0,
        comfort: 0
    })

    const {
        data: categoriesList,
        rawAverages: manualAverages,
        transactions,
        isLoading: isReadModelLoading
    } = useMonthlyAverages(period)

    const { brainSignal } = useAIAdvisor()
    const brainAssist = useMemo<BrainAssistSignal | null>(() => {
        if (!brainSignal.isReady) return null
        if (brainSignal.riskScore === null || brainSignal.confidenceScore === null) return null
        return {
            riskScore: brainSignal.riskScore,
            confidence: brainSignal.confidenceScore
        }
    }, [brainSignal])

    const {
        scenarios,
        baselineMetrics,
        isLoading: isFacadeLoading
    } = useGoalScenarios({
        goalTargetCents,
        simulationPeriod: period,
        categories: categoriesList || [],
        transactions,
        averages: manualAverages,
        isLoading: isReadModelLoading,
        brainAssist
    })

    const isDataLoading = isFacadeLoading || isPortfolioLoading

    const currentScenario = useMemo(() => {
        if (activeScenarioKey !== "custom") {
            const found = scenarios.find((scenario) => scenario.key === activeScenarioKey)
            return found || scenarios.find((scenario) => scenario.key === "baseline") || null
        }

        if (!baselineMetrics || !manualAverages) return null
        const categories = categoriesList || []
        const customMap = buildNatureApplicationMap(categories, customSavings)

        return calculateScenario({
            key: "custom",
            baseline: baselineMetrics,
            averages: manualAverages.categories,
            config: {
                type: "manual",
                label: "Personalizzato",
                description: "Configurazione manuale avanzata",
                applicationMap: customMap,
                savingsMap: customSavings
            },
            goalTargetCents,
            customApplicationMap: customMap
        })
    }, [activeScenarioKey, baselineMetrics, categoriesList, customSavings, goalTargetCents, manualAverages, scenarios])

    const simulatedSurplus = (baselineMetrics?.averageMonthlyIncome || 0) - (currentScenario?.simulatedExpenses || 0)
    const extraSavings = simulatedSurplus - ((baselineMetrics?.averageMonthlyIncome || 0) - (baselineMetrics?.averageMonthlyExpenses || 0))
    const savingsPercent = currentScenario
        ? Math.round(100 - (currentScenario.simulatedExpenses / (baselineMetrics?.averageMonthlyExpenses || 1)) * 100)
        : 0

    const projection = currentScenario?.projection
    const likelyMonthsForCopy = projection ? projection.likelyMonthsPrecise : null
    const minMonthsForRange = projection ? projection.minMonthsPrecise : null
    const maxMonthsForRange = projection ? projection.maxMonthsPrecise : null

    const hasInsufficientData = !manualAverages
        || (manualAverages.incomeCents <= 0 && Object.keys(manualAverages.categories).length === 0)

    const handleSavePlan = async () => {
        if (!currentScenario) return

        try {
            if (!activeGoal?.id) {
                await addGoal(goalTitle || "Mio Obiettivo", goalTargetCents)
            }

            await activateRhythm({
                userId: LOCAL_USER_ID,
                goalTargetCents,
                goalTitle: goalTitle || "Mio Obiettivo",
                scenario: {
                    type: currentScenario.config.type,
                    label: currentScenario.config.label,
                    description: currentScenario.config.description,
                    applicationMap: currentScenario.config.applicationMap,
                    savingsMap: currentScenario.config.savingsMap
                },
                baseline: {
                    averageMonthlyIncome: baselineMetrics?.averageMonthlyIncome || 0,
                    averageMonthlyExpenses: baselineMetrics?.averageMonthlyExpenses || 0,
                    averageEssentialExpenses: baselineMetrics?.averageEssentialExpenses || 0,
                    averageSuperfluousExpenses: baselineMetrics?.averageSuperfluousExpenses || 0,
                    averageComfortExpenses: baselineMetrics?.averageComfortExpenses || 0,
                    expensesStdDev: baselineMetrics?.expensesStdDev || 0,
                    freeCashFlowStdDev: baselineMetrics?.freeCashFlowStdDev || 0,
                    monthsAnalyzed: period,
                    activeMonths: baselineMetrics?.activeMonths || 0,
                    activityCoverageRatio: baselineMetrics?.activityCoverageRatio || 0
                }
            })

            await refreshPortfolio()
            await queryClient.invalidateQueries({ queryKey: queryKeys.budget.all })
            await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })

            toast.success("Piano salvato", {
                description: "Il piano e ora attivo nella Dashboard."
            })
        } catch {
            toast.error("Non sono riuscito a salvare il piano")
        }
    }

    const handleReset = () => {
        setActiveScenarioKey("baseline")
        setCustomSavings({ superfluous: 0, comfort: 0 })
    }

    const handleCustomApply = (newSavings: { superfluous: number; comfort: number }) => {
        setCustomSavings(newSavings)
        setActiveScenarioKey("custom")
        toast.info("Scenario personalizzato applicato")
    }

    const handleCreateFirstGoal = async () => {
        setIsCreatingGoal(true)
        try {
            await addGoal("Nuovo Obiettivo", 0, { setAsMain: true })
            toast.success("Obiettivo creato")
        } catch {
            toast.error("Non sono riuscito a creare l'obiettivo. Riprova.")
        } finally {
            setIsCreatingGoal(false)
        }
    }

    const handleAddGoalFromRibbon = async () => {
        try {
            const newGoal = await addGoal("Nuovo Obiettivo", 0, { setAsMain: true })
            toast.success("Obiettivo creato")
            return newGoal
        } catch {
            toast.error("Non sono riuscito a creare l'obiettivo. Riprova.")
            throw new Error("GOAL_CREATE_FAILED")
        }
    }

    return {
        activeGoal,
        baselineMetrics,
        brainAssist,
        categoriesList: categoriesList || [],
        currentScenario,
        customSavings,
        extraSavings,
        goalTargetCents,
        hasInsufficientData,
        isAdvancedSheetOpen,
        isCreatingGoal,
        isDataLoading,
        likelyMonthsForCopy,
        maxMonthsForRange,
        minMonthsForRange,
        period,
        portfolio,
        savingsPercent,
        scenarios,
        simulatedSurplus,
        activeScenarioKey,
        setActiveScenarioKey,
        setIsAdvancedSheetOpen,
        handleAddGoalFromRibbon,
        handleCreateFirstGoal,
        handleCustomApply,
        handleReset,
        handleSavePlan,
        removeGoal,
        setMainGoal,
        updateGoal
    }
}
