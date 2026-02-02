"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExpandableCard } from "@/components/patterns/expandable-card"
import { Calculator, RefreshCw, Sparkles, Target, Save } from "lucide-react"
import { motion } from "framer-motion"
import { useMonthlyAverages } from "@/features/simulator/hooks"
import { SimulationPeriod } from "@/features/simulator/utils"
// import { CategoryIcon } from "@/features/categories/components/category-icon"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatCents } from "@/domain/money"
import { cn } from "@/lib/utils"
import { useGoalPortfolio } from "@/VAULT/goals/logic/use-goal-portfolio"
import { MacroSection } from "@/components/patterns/macro-section"
import { toast } from "sonner"
import { activateRhythm } from "@/VAULT/goals/logic/rhythm-orchestrator"
import { useQueryClient } from "@tanstack/react-query"
import { useGoalScenarios } from "@/VAULT/goals/logic/use-goal-scenarios"
import { Sheet } from "@/components/ui/sheet"
import { ScenarioKey } from "@/VAULT/goals/types"
import { ScenarioDeck } from "@/features/goals/components/scenario-deck"
import { AdvancedOptimizerSheet } from "@/features/goals/components/advanced-optimizer-sheet"
import { calculateScenario } from "@/VAULT/goals/logic/scenario-calculator"
import { GoalContextRibbon } from "@/features/goals/components/goal-context-ribbon"
import { generateAIMonitorMessage, getAIMonitorStyles } from "@/features/goals/utils/ai-monitor-copy"
import { queryKeys } from "@/lib/query-keys"
import { KpiCard } from "@/components/patterns/kpi-card"
import { StateMessage } from "@/components/ui/state-message"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { macroItemVariants } from "@/components/patterns/macro-section"

export default function SimulatorPage() {
    const queryClient = useQueryClient()
    const { currency, locale } = useCurrency()
    const [isCreatingGoal, setIsCreatingGoal] = useState(false)

    // 1. Goal & Rhythm State (from VAULT)
    const { portfolio, isLoading: isPortfolioLoading, addGoal, setMainGoal, updateGoal, removeGoal } = useGoalPortfolio({
        globalProjectionInput: {
            currentFreeCashFlow: 0,
            historicalVariability: 0.1
        }
    })

    const activeGoal = portfolio?.goals.find(g => g.id === portfolio.mainGoalId)
    const [goalTargetCents, setGoalTargetCents] = useState<number>(activeGoal?.targetCents || 0)
    const [goalTitle, setGoalTitle] = useState<string>(activeGoal?.title || "")

    // Sync local goal state with portfolio only when id changes to avoid loop
    useEffect(() => {
        if (activeGoal) {
            Promise.resolve().then(() => {
                setGoalTargetCents(activeGoal.targetCents)
                setGoalTitle(activeGoal.title)
            })
        }
    }, [activeGoal?.id, activeGoal]) // Only when goal itself changes

    // 2. Simulator Config State
    const [period, setPeriod] = useState<SimulationPeriod>(6)
    const [activeScenarioKey, setActiveScenarioKey] = useState<ScenarioKey>("baseline")
    const [isAdvancedSheetOpen, setIsAdvancedSheetOpen] = useState(false)

    // Custom overrides (only active when key is 'custom')
    const [customSavings, setCustomSavings] = useState<{ superfluous: number; comfort: number }>({
        superfluous: 0,
        comfort: 0
    })

    // 3. Facade Data Fetching
    const { data: categoriesList, rawAverages: manualAverages } = useMonthlyAverages(period)

    const {
        scenarios,
        baselineMetrics,
        isLoading: isFacadeLoading
    } = useGoalScenarios({
        goalTargetCents,
        simulationPeriod: period,
        categories: categoriesList || []
    })

    const isDataLoading = isFacadeLoading || isPortfolioLoading

    // 4. Resolve Current Scenario (Scenario-First Arch)
    const currentScenario = useMemo(() => {
        // A. Standard Scenarios (Pre-calculated by Core)
        if (activeScenarioKey !== "custom") {
            const found = scenarios.find(s => s.key === activeScenarioKey)
            // Fallback to baseline if not found (safety)
            return found || scenarios.find(s => s.key === "baseline")
        }

        // B. Custom Scenario (Calculated On-Demand using Pure Logic)
        // Ensure we have necessary data
        if (!baselineMetrics || !manualAverages) return null

        // Reconstruct application map from slider values
        // Note: In a real advanced implementation, we might want per-category overrides.
        // For now, we replicate "Rhythm-like" group application.
        const customMap: Record<string, number> = {}
        const cats = categoriesList || []
        cats.forEach(cat => {
            if (cat.spendingNature === 'superfluous') {
                customMap[cat.id] = customSavings.superfluous
            } else if (cat.spendingNature === 'comfort') {
                customMap[cat.id] = customSavings.comfort
            } else {
                customMap[cat.id] = 0 // Essential fixed at 0 for now
            }
        })

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

    }, [activeScenarioKey, scenarios, baselineMetrics, manualAverages, customSavings, categoriesList, goalTargetCents])

    // Safety check for rendering
    if (isDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">Inizializzazione Lab...</p>
            </div>
        )
    }

    // 5. Handlers
    const handleSavePlan = async () => {
        if (!currentScenario) return

        try {
            // Create goal if needed
            if (!activeGoal?.id) {
                await addGoal(goalTitle || "Mio Obiettivo", goalTargetCents)
            }

            await activateRhythm({
                userId: "user-1",
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
                    expensesStdDev: baselineMetrics?.expensesStdDev || 0,
                    monthsAnalyzed: period
                },
                categories: categoriesList || []
            })

            // Invalidate caches BEFORE showing success toast (reliable feedback)
            await queryClient.invalidateQueries({ queryKey: queryKeys.budget.all })
            await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })

            toast.success("Piano salvato con successo", {
                description: "Il tuo nuovo piano operativo è ora attivo sulla Dashboard."
            })
        } catch (error) {
            toast.error("Errore durante il salvataggio")
        }
    }

    const handleReset = () => {
        setActiveScenarioKey("baseline")
        setCustomSavings({ superfluous: 0, comfort: 0 })
    }

    const handleCustomApply = (newSavings: { superfluous: number; comfort: number }) => {
        setCustomSavings(newSavings)
        setActiveScenarioKey("custom")
        toast.info("Scenario Personalizzato Applicato")
    }

    // Display helpers
    const savingsPercent = currentScenario
        ? Math.round(100 - (currentScenario.simulatedExpenses / (baselineMetrics?.averageMonthlyExpenses || 1)) * 100)
        : 0

    // Calculate display values
    const simulatedSurplus = (baselineMetrics?.averageMonthlyIncome || 0) - (currentScenario?.simulatedExpenses || 0)
    const extraSavings = simulatedSurplus - ((baselineMetrics?.averageMonthlyIncome || 0) - (baselineMetrics?.averageMonthlyExpenses || 0))

    const projection = currentScenario?.projection

    return (
        <StaggerContainer className="space-y-8 pb-24 md:pb-12 w-full">
            <motion.div variants={macroItemVariants}>
                <PageHeader
                    title="Financial Lab"
                    description="Crea obiettivi di risparmio e genera piani d'azione personalizzati per raggiungerli."
                />
            </motion.div>

            {/* MONOLITHIC COMMAND CENTER (UBI) */}
            {!activeGoal ? (
                /* EMPTY STATE - Start Flow */
                <motion.div variants={macroItemVariants}>
                    <MacroSection
                        variant="default"
                        title={null}
                    >
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-10 max-w-2xl mx-auto">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse-soft" />
                                <div className="relative h-32 w-32 rounded-[3.5rem] bg-white dark:bg-slate-900 flex items-center justify-center shadow-2xl ring-1 ring-primary/20">
                                    <Target className="h-16 w-16 text-primary animate-pulse-soft" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-foreground tracking-tight leading-tight">
                                    Il tuo Financial Lab è pronto
                                </h2>
                                <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                    Inizia definendo il tuo primo obiettivo. Ti aiuteremo a scoprire il ritmo giusto per raggiungerlo in modo sostenibile.
                                </p>
                            </div>

                            <Button
                                size="lg"
                                disabled={isCreatingGoal}
                                className="rounded-full px-16 h-16 text-xl font-black tracking-tight shadow-2xl shadow-primary/30 hover:scale-105 transition-all active:scale-95 group relative overflow-hidden"
                                onClick={async () => {
                                    setIsCreatingGoal(true)
                                    try {
                                        await addGoal("Nuovo Obiettivo", 0)
                                        toast.success("Laboratorio attivato!")
                                    } catch (e) {
                                        toast.error("Errore durante l'attivazione.")
                                        setIsCreatingGoal(false)
                                    }
                                }}
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
                /* ACTIVE SIMULATION v3 */
                <motion.div
                    variants={macroItemVariants}
                >
                    <MacroSection
                        variant="premium"
                        className="overflow-visible"
                        status={currentScenario?.sustainability.status === "unsafe" ? "critical" : currentScenario?.sustainability.status === "fragile" ? "warning" : "default"}
                        title={
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Command Center</h2>
                                <p className="text-sm font-medium text-muted-foreground">Simulazione e Ottimizzazione</p>
                            </div>
                        }
                        headerActions={
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReset}
                                    className="h-9 rounded-full px-4 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <RefreshCw className="mr-2 h-3 w-3" /> Reset
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSavePlan}
                                    className="h-10 rounded-xl px-6 text-xs font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    <Save className="mr-2 h-4 w-4" /> Salva Piano
                                </Button>
                            </div>
                        }
                    >
                        {/* 1. CONTEXT RIBBON (Goal Management) */}
                        <div className="mb-8">
                            <GoalContextRibbon
                                portfolio={portfolio}
                                activeGoal={activeGoal}
                                activeRhythm={portfolio?.activeRhythm}
                                onSelectGoal={setMainGoal}
                                onAddGoal={() => addGoal("Nuovo Obiettivo", 0)}
                                onUpdateGoal={updateGoal}
                                onRemoveGoal={removeGoal}
                            />
                        </div>

                        {/* 2. SCENARIO DECK (The Variables) */}
                        <div className="pb-8 border-b border-border/40">
                            <ScenarioDeck
                                scenarios={scenarios}
                                activeKey={activeScenarioKey}
                                onSelect={setActiveScenarioKey}
                                onCustomConfigClick={() => setIsAdvancedSheetOpen(true)}
                            />
                        </div>

                        {/* 3. PROJECTION & RESULTS (The Output) */}
                        {currentScenario && (
                            <StaggerContainer className="pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                                {/* METRIC 1: VELOCITY */}
                                <motion.div variants={macroItemVariants}>
                                    <KpiCard
                                        title="Risparmio Mensile"
                                        value={formatCents(simulatedSurplus, currency, locale)}
                                        change={extraSavings > 0 ? `+${formatCents(extraSavings, currency, locale)}` : undefined}
                                        trend={extraSavings > 0 ? "up" : "neutral"}
                                        comparisonLabel={extraSavings > 0 ? "boost" : undefined}
                                        icon={Calculator}
                                        tone="neutral"
                                        className="h-full hover:bg-white/60 transition-colors"
                                    />
                                </motion.div>

                                {/* METRIC 2: HORIZON */}
                                <motion.div variants={macroItemVariants}>
                                    <KpiCard
                                        title="Tempo Stimato"
                                        value={!projection?.canReach
                                            ? "—"
                                            : projection?.likelyDate
                                                ? new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
                                                    .format(new Date(projection.likelyDate))
                                                    .replace(/^\w/, c => c.toUpperCase())
                                                : "—"
                                        }
                                        change={projection?.canReach && projection?.likelyMonths > 0 ? `${projection.likelyMonths} mesi` : undefined}
                                        description={!projection?.canReach
                                            ? "Aumenta il risparmio per proiettare"
                                            : `Range: ${projection.minMonths}-${projection.maxMonths} mesi`
                                        }
                                        icon={Target}
                                        tone={projection?.canReach ? "positive" : "neutral"}
                                        className={cn(
                                            "h-full transition-all duration-500",
                                            projection?.canReach ? "bg-indigo-50/40 dark:bg-indigo-950/20" : "bg-rose-50/40 dark:bg-rose-950/10"
                                        )}
                                    />
                                </motion.div>

                                {/* METRIC 3: SUSTAINABILITY */}
                                <motion.div variants={macroItemVariants}>
                                    <KpiCard
                                        title="Sostenibilità"
                                        value={(() => {
                                            const status = currentScenario.sustainability.status
                                            if (status === "secure") return "Sicuro"
                                            if (status === "sustainable") return "Sostenibile"
                                            if (status === "fragile") return "Fragile"
                                            return "A Rischio"
                                        })()}
                                        description={currentScenario.sustainability.reason || "Assetto verificato"}
                                        icon={RefreshCw}
                                        tone={(() => {
                                            const status = currentScenario.sustainability.status
                                            if (status === "secure" || status === "sustainable") return "positive"
                                            if (status === "fragile") return "warning"
                                            return "negative"
                                        })()}
                                        className="h-full"
                                    />
                                </motion.div>

                                {/* METRIC 4: AI ADVISOR */}
                                <motion.div variants={macroItemVariants}>
                                    {(() => {
                                        const aiMonitor = generateAIMonitorMessage({
                                            scenario: currentScenario,
                                            savingsPercent,
                                            baselineExpenses: baselineMetrics?.averageMonthlyExpenses || 0
                                        })
                                        const styles = getAIMonitorStyles(aiMonitor.tone)
                                        return (
                                            <KpiCard
                                                title="AI Monitor"
                                                value={`"${aiMonitor.message}"`}
                                                icon={Sparkles}
                                                tone={aiMonitor.tone === "thriving" ? "positive" : (aiMonitor.tone === "stable" || aiMonitor.tone === "strained") ? "warning" : "negative"}
                                                valueClassName="text-sm sm:text-sm lg:text-sm font-medium leading-relaxed italic !tracking-normal !font-sans opacity-80"
                                                className={cn("h-full", styles.containerClass, "bg-opacity-40 hover:bg-opacity-60")}
                                            />
                                        )
                                    })()}
                                </motion.div>
                            </StaggerContainer>
                        )}
                    </MacroSection>
                </motion.div>
            )}


            {/* 2. Advanced Optimizer Sheet */}
            {currentScenario && (
                <AdvancedOptimizerSheet
                    open={isAdvancedSheetOpen}
                    onOpenChange={setIsAdvancedSheetOpen}
                    currentResult={currentScenario}
                    onApply={handleCustomApply}
                />
            )}
        </StaggerContainer>
    )
}
