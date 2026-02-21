"use client"

import { MacroSection, macroItemVariants } from "@/components/patterns/macro-section"
import { PageHeader } from "@/components/ui/page-header"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { motion } from "framer-motion"
import { RefreshCw } from "lucide-react"

import { ScenarioDeck } from "@/features/goals/components/scenario-deck"
import { SimulatorResultsPanel } from "@/features/goals/components/simulator-results-panel"
import { useSimulatorCommandCenter } from "@/features/goals/hooks/use-simulator-command-center"
import { FINANCIAL_LAB_COPY } from "@/features/goals/utils/financial-lab-copy"

export default function SimulatorPage() {
    const {
        activeScenarioKey,
        currentScenario,
        monthlyQuotaRealtimeCents,
        hasInsufficientData,
        isDataLoading,
        realtimeWindowMonths,
        savingsPercent,
        scenarios,
        simulatedSurplusBase,
        simulatedSurplus,
        realtimeCapacityFactor,
        setActiveScenarioKey,
    } = useSimulatorCommandCenter()

    if (isDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <RefreshCw className="h-8 w-8 text-primary animate-spin-slow" />
                <p className="text-sm font-medium text-muted-foreground">{FINANCIAL_LAB_COPY.page.loading}</p>
            </div>
        )
    }

    return (
        <StaggerContainer className="space-y-8 pb-24 md:pb-12 w-full">
            <motion.div variants={macroItemVariants}>
                <PageHeader
                    title={FINANCIAL_LAB_COPY.page.title}
                    description={FINANCIAL_LAB_COPY.page.description}
                />
            </motion.div>

            <motion.div variants={macroItemVariants}>
                <MacroSection
                    variant="premium"
                    className="overflow-visible"
                    status={currentScenario?.sustainability.status === "unsafe" ? "critical" : currentScenario?.sustainability.status === "fragile" ? "warning" : "default"}
                    title={null}
                    headerActions={null}
                >
                    <div className="pb-8 border-b border-border/40">
                        <ScenarioDeck
                            scenarios={scenarios}
                            activeKey={activeScenarioKey}
                            onSelect={setActiveScenarioKey}
                        />
                    </div>

                    {currentScenario && (
                        <SimulatorResultsPanel
                            scenario={currentScenario}
                            simulatedSurplusBase={simulatedSurplusBase}
                            simulatedSurplus={simulatedSurplus}
                            realtimeCapacityFactor={realtimeCapacityFactor}
                            monthlyQuotaRealtimeCents={monthlyQuotaRealtimeCents}
                            realtimeWindowMonths={realtimeWindowMonths}
                            savingsPercent={savingsPercent}
                            hasInsufficientData={hasInsufficientData}
                        />
                    )}
                </MacroSection>
            </motion.div>
        </StaggerContainer>
    )
}
