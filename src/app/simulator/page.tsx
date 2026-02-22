"use client"

import { macroItemVariants } from "@/components/patterns/macro-section"
import { PageHeader } from "@/components/ui/page-header"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { motion } from "framer-motion"
import { RefreshCw } from "lucide-react"

import { ScenarioDeck } from "@/features/goals/components/scenario-deck"
import { useSimulatorCommandCenter } from "@/features/goals/hooks/use-simulator-command-center"
import { FINANCIAL_LAB_COPY } from "@/features/goals/utils/financial-lab-copy"

export default function SimulatorPage() {
    const {
        activeScenarioKey,
        isDataLoading,
        scenarios,
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
                <ScenarioDeck
                    scenarios={scenarios}
                    activeKey={activeScenarioKey}
                    onSelect={setActiveScenarioKey}
                />
            </motion.div>
        </StaggerContainer>
    )
}
