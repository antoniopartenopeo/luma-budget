import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { isFinancialLabRealtimeOverlayEnabled } from "@/lib/feature-flags"
import { queryKeys } from "@/lib/query-keys"
import { LOCAL_USER_ID } from "@/lib/runtime-user"
import { deriveRealtimeOverlaySignal } from "@/VAULT/goals/logic/realtime-overlay"
import { BrainAssistSignal, RealtimeOverlaySignal, ScenarioKey } from "@/VAULT/goals/types"
import { useAIAdvisor } from "@/features/insights/use-ai-advisor"
import { useMonthlyAverages } from "@/features/simulator/hooks"
import { SimulationPeriod } from "@/features/simulator/utils"

import { resetFinancialLabLegacyState } from "../utils/reset-financial-lab-legacy"
import { useQuotaScenarios } from "./use-quota-scenarios"

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

export function useSimulatorCommandCenter() {
    const queryClient = useQueryClient()

    const [period] = useState<SimulationPeriod>(6)
    const [activeScenarioKey, setActiveScenarioKey] = useState<ScenarioKey>("baseline")

    const {
        data: categoriesList,
        rawAverages: monthlyAverages,
        transactions,
        isLoading: isReadModelLoading
    } = useMonthlyAverages(period)

    const { brainSignal, forecast, facts } = useAIAdvisor({ mode: "readonly" })
    const brainAssist = useMemo<BrainAssistSignal | null>(() => {
        if (!brainSignal.isReady) return null
        if (brainSignal.riskScore === null || brainSignal.confidenceScore === null) return null
        return {
            riskScore: brainSignal.riskScore,
            confidence: brainSignal.confidenceScore
        }
    }, [brainSignal])

    const realtimeOverlayEnabled = useMemo(
        () => isFinancialLabRealtimeOverlayEnabled(LOCAL_USER_ID),
        []
    )
    const averageMonthlyExpensesCents = useMemo(
        () => Object.values(monthlyAverages?.categories || {}).reduce((sum, category) => sum + category.averageAmount, 0),
        [monthlyAverages]
    )
    const computedRealtimeOverlay = useMemo(
        () => deriveRealtimeOverlaySignal({
            flagEnabled: realtimeOverlayEnabled,
            forecast,
            facts,
            brainSignal,
            avgMonthlyExpensesCents: averageMonthlyExpensesCents
        }),
        [realtimeOverlayEnabled, forecast, facts, brainSignal, averageMonthlyExpensesCents]
    )
    const [realtimeOverlay, setRealtimeOverlay] = useState<RealtimeOverlaySignal | null>(null)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setRealtimeOverlay(computedRealtimeOverlay)
        }, 700)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [computedRealtimeOverlay])

    useEffect(() => {
        void (async () => {
            const didReset = await resetFinancialLabLegacyState()
            if (!didReset) return

            await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })

            toast.info("Financial Lab aggiornato", {
                description: "Stato legacy verificato e riallineato al modello quota sostenibile."
            })
        })()
    }, [queryClient])

    const {
        scenarios,
        baselineMetrics,
        isLoading: isFacadeLoading
    } = useQuotaScenarios({
        simulationPeriod: period,
        categories: categoriesList || [],
        transactions,
        averages: monthlyAverages,
        isLoading: isReadModelLoading,
        brainAssist,
        realtimeOverlay
    })

    const isDataLoading = isFacadeLoading

    const currentScenario = useMemo(() => {
        const found = scenarios.find((scenario) => scenario.key === activeScenarioKey)
        return found || scenarios.find((scenario) => scenario.key === "baseline") || null
    }, [activeScenarioKey, scenarios])

    const simulatedSurplusBase = currentScenario?.quota.baseMonthlyMarginCents || 0
    const simulatedSurplus = currentScenario?.quota.realtimeMonthlyMarginCents || 0
    const realtimeCapacityFactor = currentScenario?.quota.realtimeCapacityFactor || 1
    const realtimeWindowMonths = currentScenario?.quota.realtimeWindowMonths || 0
    const monthlyQuotaRealtimeCents = currentScenario?.quota.realtimeMonthlyCapacityCents || 0
    const baselineExpenses = baselineMetrics?.averageMonthlyExpenses || 0
    const savingsPercent = currentScenario && baselineExpenses > 0
        ? clamp(
            Math.round(((baselineExpenses - currentScenario.simulatedExpenses) / baselineExpenses) * 100),
            -100,
            100
        )
        : 0

    const hasInsufficientData = !monthlyAverages
        || (monthlyAverages.incomeCents <= 0 && Object.keys(monthlyAverages.categories).length === 0)

    return {
        currentScenario,
        monthlyQuotaRealtimeCents,
        hasInsufficientData,
        isDataLoading,
        period,
        savingsPercent,
        scenarios,
        simulatedSurplusBase,
        simulatedSurplus,
        realtimeCapacityFactor,
        realtimeWindowMonths,
        activeScenarioKey,
        setActiveScenarioKey,
    }
}
