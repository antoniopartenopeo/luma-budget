"use client"

import { Button } from "@/components/ui/button"
import { MacroSection, macroItemVariants } from "@/components/patterns/macro-section"
import { PageHeader } from "@/components/ui/page-header"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { RefreshCw, Target } from "lucide-react"

import { AdvancedOptimizerSheet } from "@/features/goals/components/advanced-optimizer-sheet"
import { GoalContextRibbon } from "@/features/goals/components/goal-context-ribbon"
import { ScenarioDeck } from "@/features/goals/components/scenario-deck"
import { SimulatorResultsPanel } from "@/features/goals/components/simulator-results-panel"
import { useSimulatorCommandCenter } from "@/features/goals/hooks/use-simulator-command-center"

function RadarBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
                <div className="absolute inset-0 rounded-full border border-primary/20" />
                <div className="absolute inset-x-20 inset-y-20 rounded-full border border-primary/10" />
                <div className="absolute inset-x-40 inset-y-40 rounded-full border border-primary/5" />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
    )
}

export default function SimulatorPage() {
    const {
        activeGoal,
        activeScenarioKey,
        baselineMetrics,
        categoriesList,
        currentScenario,
        customSavings,
        goalMonthlyCapacityRealtime,
        goalTargetCents,
        hasInsufficientData,
        isAdvancedSheetOpen,
        isCreatingGoal,
        isDataLoading,
        likelyMonthsForCopy,
        portfolio,
        realtimeWindowMonths,
        savingsPercent,
        scenarios,
        simulatedSurplusBase,
        simulatedSurplus,
        realtimeCapacityFactor,
        handleAddGoalFromRibbon,
        handleCreateFirstGoal,
        handleCustomApply,
        handleReset,
        handleSavePlan,
        removeGoal,
        setActiveScenarioKey,
        setIsAdvancedSheetOpen,
        setMainGoal,
        updateGoal
    } = useSimulatorCommandCenter()

    if (isDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">Sto preparando Financial Lab...</p>
            </div>
        )
    }

    return (
        <StaggerContainer className="space-y-8 pb-24 md:pb-12 w-full">
            <motion.div variants={macroItemVariants}>
                <PageHeader
                    title="Financial Lab"
                    description="Confronta ritmi diversi e scopri quando puoi raggiungere il tuo obiettivo."
                />
            </motion.div>

            {!activeGoal ? (
                <motion.div variants={macroItemVariants}>
                    <MacroSection variant="default" title={null} background={<RadarBackground />}>
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-12 max-w-2xl mx-auto relative z-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/25 blur-[100px] rounded-full scale-110 animate-pulse-soft" />
                                <motion.div
                                    className="relative h-40 w-40 rounded-[3.5rem] glass-card bg-white/40 dark:bg-white/5 backdrop-blur-3xl flex items-center justify-center shadow-2xl border-white/20 dark:border-white/10"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <Target className={cn(
                                        "h-20 w-20 text-primary transition-all duration-700",
                                        isCreatingGoal ? "animate-spin-slow opacity-50" : ""
                                    )} />
                                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-emerald-500/20 blur-lg" />
                                    <div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-primary/10 blur-xl" />
                                </motion.div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
                                    Pronto a creare il primo obiettivo
                                </h2>
                                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium max-w-lg mx-auto">
                                    Imposta un obiettivo e vedi un piano realistico basato sulle tue spese reali.
                                </p>
                            </div>

                            <Button
                                size="lg"
                                disabled={isCreatingGoal}
                                className="rounded-full px-16 h-16 text-lg font-bold tracking-tight shadow-2xl shadow-primary/30 hover:scale-105 transition-all active:scale-95 group relative overflow-hidden"
                                onClick={handleCreateFirstGoal}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isCreatingGoal ? (
                                        <>
                                            <RefreshCw className="h-5 w-5 animate-spin" />
                                            Sto creando...
                                        </>
                                    ) : (
                                        "Crea Primo Obiettivo"
                                    )}
                                </span>
                            </Button>
                        </div>
                    </MacroSection>
                </motion.div>
            ) : (
                <motion.div variants={macroItemVariants}>
                    <MacroSection
                        variant="premium"
                        className="overflow-visible"
                        status={currentScenario?.sustainability.status === "unsafe" ? "critical" : currentScenario?.sustainability.status === "fragile" ? "warning" : "default"}
                        title={null}
                        headerActions={null}
                    >
                        <div className="mb-8">
                            <GoalContextRibbon
                                portfolio={portfolio}
                                activeGoal={activeGoal}
                                activeRhythm={portfolio?.activeRhythm}
                                onSelectGoal={setMainGoal}
                                onAddGoal={handleAddGoalFromRibbon}
                                onUpdateGoal={updateGoal}
                                onRemoveGoal={removeGoal}
                                onReset={handleReset}
                                onSave={handleSavePlan}
                            />
                        </div>

                        <div className="pb-8 border-b border-border/40">
                            <ScenarioDeck
                                scenarios={scenarios}
                                activeKey={activeScenarioKey}
                                onSelect={setActiveScenarioKey}
                                onCustomConfigClick={() => setIsAdvancedSheetOpen(true)}
                            />
                        </div>

                        {currentScenario && (
                            <SimulatorResultsPanel
                                scenario={currentScenario}
                                simulatedSurplusBase={simulatedSurplusBase}
                                simulatedSurplus={simulatedSurplus}
                                realtimeCapacityFactor={realtimeCapacityFactor}
                                goalMonthlyCapacityRealtime={goalMonthlyCapacityRealtime}
                                realtimeWindowMonths={realtimeWindowMonths}
                                savingsPercent={savingsPercent}
                                likelyMonthsForCopy={likelyMonthsForCopy}
                                hasInsufficientData={hasInsufficientData}
                            />
                        )}
                    </MacroSection>
                </motion.div>
            )}

            {currentScenario && (
                <AdvancedOptimizerSheet
                    open={isAdvancedSheetOpen}
                    onOpenChange={setIsAdvancedSheetOpen}
                    onApply={handleCustomApply}
                    baselineMetrics={baselineMetrics}
                    categories={categoriesList}
                    goalTargetCents={goalTargetCents}
                    initialSavings={customSavings}
                />
            )}
        </StaggerContainer>
    )
}
