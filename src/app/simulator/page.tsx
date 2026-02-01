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

export default function SimulatorPage() {
    const queryClient = useQueryClient()
    const { currency, locale } = useCurrency()

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
        <div className="space-y-8 pb-24 md:pb-12 w-full">
            <PageHeader
                title="Financial Lab"
                description="Crea obiettivi di risparmio e genera piani d'azione personalizzati per raggiungerli."
            />

            {/* MONOLITHIC COMMAND CENTER (UBI) */}
            {!activeGoal ? (
                /* EMPTY STATE - Start Flow */
                <MacroSection
                    variant="default"
                    className="animate-enter-up"
                    title={null}
                >
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-8">
                        <div className="h-24 w-24 rounded-[3rem] bg-emerald-500/10 flex items-center justify-center shadow-inner ring-1 ring-emerald-500/20">
                            <Target className="h-12 w-12 text-emerald-500 animate-pulse-soft" />
                        </div>
                        <div className="space-y-3 max-w-xl">
                            <h2 className="text-3xl font-black text-foreground tracking-tight">Inizia dal tuo Obiettivo</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                Crea un obiettivo di risparmio, scopri quanto mettere da parte ogni mese e attiva un piano operativo sulla Dashboard.
                            </p>
                        </div>
                        <Button
                            size="lg"
                            className="rounded-full px-12 h-14 text-base font-black tracking-tight shadow-xl shadow-emerald-500/20 hover:scale-105 transition-transform"
                            onClick={() => addGoal("Nuovo Obiettivo", 0)}
                        >
                            Crea Obiettivo
                        </Button>
                    </div>
                </MacroSection>
            ) : (
                /* ACTIVE SIMULATION v3 */
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                    <MacroSection
                        variant="premium"
                        className="overflow-visible"
                        title={
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 border border-border/50 flex items-center justify-center shadow-sm">
                                    <Calculator className="h-7 w-7 text-primary fill-primary/20" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                                        Command Center
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-2 h-6 font-bold animate-pulse-soft">LIVE</Badge>
                                    </h2>
                                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                        Simulazione e Ottimizzazione
                                    </p>
                                </div>
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
                            <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                                {/* METRIC 1: VELOCITY */}
                                <div className="md:col-span-1 rounded-[2rem] bg-white/40 dark:bg-black/20 border border-white/10 p-6 relative overflow-hidden group hover:bg-white/60 transition-colors">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Calculator className="h-16 w-16 rotate-12" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                                        Risparmio Mensile
                                    </span>
                                    <div className="text-3xl sm:text-4xl font-black text-foreground tabular-nums tracking-tighter">
                                        {formatCents(simulatedSurplus, currency, locale)}
                                    </div>
                                    {extraSavings > 0 && (
                                        <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                            +{formatCents(extraSavings, currency, locale)} boost
                                        </div>
                                    )}
                                </div>

                                {/* METRIC 2: HORIZON */}
                                <div className={cn(
                                    "md:col-span-1 rounded-[2rem] border p-6 relative overflow-hidden group transition-all duration-500",
                                    projection?.canReach ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-800/50" : "bg-rose-50/40 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-900/50"
                                )}>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                                        Tempo Stimato
                                    </span>

                                    <div className="text-3xl sm:text-4xl font-black text-foreground tabular-nums tracking-tighter mb-1">
                                        {!projection?.canReach
                                            ? <span className="text-muted-foreground">—</span>
                                            : projection?.likelyMonths === 0
                                                ? <span className="text-emerald-600">Raggiunto!</span>
                                                : <span>{projection?.likelyMonths} <span className="text-xl text-muted-foreground font-bold">Mesi</span></span>
                                        }
                                    </div>
                                    {!projection?.canReach && (
                                        <p className="text-xs text-muted-foreground mt-1">Aumenta il risparmio per stimare</p>
                                    )}

                                    {/* Horizon Details */}
                                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                                        <div>
                                            <span className="text-[9px] font-bold uppercase text-muted-foreground block">Ottimista</span>
                                            <span className={cn("text-lg font-bold tabular-nums", !projection?.canReach ? "text-muted-foreground" : "text-emerald-600")}>
                                                {!projection?.canReach ? "—" : `${projection?.minMonths}m`}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-bold uppercase text-muted-foreground block">Prudente</span>
                                            <span className={cn("text-lg font-bold tabular-nums", !projection?.canReach ? "text-muted-foreground" : "text-amber-600")}>
                                                {!projection?.canReach ? "—" : `${projection?.maxMonths}m`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* METRIC 3: AI ADVISOR */}
                                {(() => {
                                    const aiMonitor = generateAIMonitorMessage({
                                        scenario: currentScenario,
                                        savingsPercent,
                                        baselineExpenses: baselineMetrics?.averageMonthlyExpenses || 0
                                    })
                                    const styles = getAIMonitorStyles(aiMonitor.tone)
                                    return (
                                        <div className={cn("md:col-span-1 rounded-[2rem] border p-6 flex flex-col justify-between", styles.containerClass)}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles className={cn("h-4 w-4 animate-pulse-soft", styles.iconClass)} />
                                                <span className={cn("text-[10px] font-bold uppercase tracking-widest", styles.textClass)}>AI Monitor</span>
                                            </div>
                                            <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                                                &quot;{aiMonitor.message}&quot;
                                            </p>
                                        </div>
                                    )
                                })()}
                            </div>
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
        </div>
    )
}
