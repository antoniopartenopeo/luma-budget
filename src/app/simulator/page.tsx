"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, RefreshCw, Sparkles, Target } from "lucide-react"
import { motion } from "framer-motion"
import { useMonthlyAverages } from "@/features/simulator/hooks"
import { SimulationPeriod } from "@/features/simulator/utils"
// import { CategoryIcon } from "@/features/categories/components/category-icon"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatCents } from "@/domain/money"
import { cn } from "@/lib/utils"
import { useGoalPortfolio } from "@/features/goals/hooks/use-goal-portfolio"
import { MacroSection } from "@/components/patterns/macro-section"
import { toast } from "sonner"
import { activateRhythm } from "@/VAULT/goals/logic/rhythm-orchestrator"
import { useQueryClient } from "@tanstack/react-query"
import { useGoalScenarios } from "@/features/goals/hooks/use-goal-scenarios"
import { ScenarioKey } from "@/VAULT/goals/types"
import { ScenarioDeck } from "@/features/goals/components/scenario-deck"
import { AdvancedOptimizerSheet } from "@/features/goals/components/advanced-optimizer-sheet"
import { calculateScenario } from "@/VAULT/goals/logic/scenario-calculator"
import { GoalContextRibbon } from "@/features/goals/components/goal-context-ribbon"
import { generateAIMonitorMessage, getAIMonitorStyles } from "@/features/goals/utils/ai-monitor-copy"
import { queryKeys } from "@/lib/query-keys"
import { KpiCard } from "@/components/patterns/kpi-card"
import { StaggerContainer } from "@/components/patterns/stagger-container"
import { macroItemVariants } from "@/components/patterns/macro-section"
import { buildNatureApplicationMap } from "@/domain/simulation"
import { LOCAL_USER_ID } from "@/lib/runtime-user"

/**
 * Premium background for the Empty State.
 * Simulates a high-tech lab scanning/searching effect.
 */
function RadarBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
            {/* Concentric Scan Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping-slow" />
                <div className="absolute inset-x-20 inset-y-20 rounded-full border border-primary/10 animate-ping-slow animation-delay-500" />
                <div className="absolute inset-x-40 inset-y-40 rounded-full border border-primary/5 animate-ping-slow animation-delay-1000" />
            </div>

            {/* Vertical/Horizontal Scan Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
    )
}

export default function SimulatorPage() {
    const queryClient = useQueryClient()
    const { currency, locale } = useCurrency()
    const [isCreatingGoal, setIsCreatingGoal] = useState(false)

    // 1. Goal & Rhythm State (from VAULT)
    const projectionSettings = useMemo(() => ({
        currentFreeCashFlow: 0,
        historicalVariability: 0.1
    }), [])

    const { portfolio, isLoading: isPortfolioLoading, addGoal, setMainGoal, updateGoal, removeGoal } = useGoalPortfolio({
        globalProjectionInput: projectionSettings
    })

    const activeGoal = portfolio?.goals.find(g => g.id === portfolio.mainGoalId)
    const [goalTargetCents, setGoalTargetCents] = useState<number>(activeGoal?.targetCents || 0)
    const [goalTitle, setGoalTitle] = useState<string>(activeGoal?.title || "")

    // Keep local simulation inputs aligned with the currently selected goal.
    // Without this sync, switching goal or editing target leaves stale values in projections.
    useEffect(() => {
        if (activeGoal?.id) {
            setGoalTargetCents(activeGoal.targetCents)
            setGoalTitle(activeGoal.title)
            return
        }

        setGoalTargetCents(0)
        setGoalTitle("")
    }, [activeGoal?.id, activeGoal?.targetCents, activeGoal?.title])

    // 2. Simulator Config State
    const [period] = useState<SimulationPeriod>(6)
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
        const cats = categoriesList || []
        const customMap = buildNatureApplicationMap(cats, customSavings)

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
                <p className="text-sm font-medium text-muted-foreground">Sto preparando il simulatore...</p>
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
                    monthsAnalyzed: period
                }
            })

            // Invalidate caches BEFORE showing success toast (reliable feedback)
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
                    title="Simulator"
                    description={
                        <>
                            Simula diversi ritmi di risparmio e scopri quando puoi raggiungere il tuo obiettivo.
                        </>
                    }
                />
            </motion.div>

            {/* MONOLITHIC COMMAND CENTER (UBI) */}
            {!activeGoal ? (
                /* EMPTY STATE - Start Flow */
                <motion.div variants={macroItemVariants}>
                    <MacroSection
                        variant="default"
                        title={null}
                        background={<RadarBackground />}
                    >
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-12 max-w-2xl mx-auto relative z-10">
                            <div className="relative">
                                {/* Ambient Glow */}
                                <div className="absolute inset-0 bg-primary/25 blur-[100px] rounded-full scale-110 animate-pulse-soft" />

                                <motion.div
                                    className="relative h-40 w-40 rounded-[3.5rem] glass-card bg-white/40 dark:bg-white/5 backdrop-blur-3xl flex items-center justify-center shadow-2xl border-white/20 dark:border-white/10"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <Target className={cn(
                                        "h-20 w-20 text-primary transition-all duration-700",
                                        isCreatingGoal ? "animate-spin-slow opacity-50" : "animate-pulse-soft"
                                    )} />

                                    {/* Small orbital sparkles */}
                                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-emerald-500/20 blur-lg animate-pulse" />
                                    <div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-primary/10 blur-xl animate-pulse animation-delay-1000" />
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
                                onClick={async () => {
                                    setIsCreatingGoal(true)
                                    try {
                                        await addGoal("Nuovo Obiettivo", 0)
                                        toast.success("Obiettivo creato")
                                    } catch {
                                        toast.error("Non sono riuscito a creare l'obiettivo. Riprova.")
                                    } finally {
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
                        title={null}
                        headerActions={null}
                    >
                        {/* 1. CONTEXT RIBBON (Goal Management + Actions) */}
                        <div className="mb-8">
                            <GoalContextRibbon
                                portfolio={portfolio}
                                activeGoal={activeGoal}
                                activeRhythm={portfolio?.activeRhythm}
                                onSelectGoal={setMainGoal}
                                onAddGoal={() => addGoal("Nuovo Obiettivo", 0)}
                                onUpdateGoal={updateGoal}
                                onRemoveGoal={removeGoal}
                                onReset={handleReset}
                                onSave={handleSavePlan}
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
                            <div className="pt-8 space-y-6 relative z-10">
                                {/* Top Row: 3 KPI Cards */}
                                <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                                    {/* METRIC 1: VELOCITY */}
                                    <motion.div variants={macroItemVariants} className="h-full">
                                        <KpiCard
                                            title="Quanto mettere da parte"
                                            subtitle="Risparmio al mese"
                                            value={formatCents(simulatedSurplus, currency, locale)}
                                            animatedValue={simulatedSurplus}
                                            formatFn={(v) => formatCents(v, currency, locale)}
                                            change={extraSavings > 0 ? `+${formatCents(extraSavings, currency, locale)}` : undefined}
                                            trend={extraSavings > 0 ? "up" : "neutral"}
                                            comparisonLabel={extraSavings > 0 ? "in piu" : undefined}
                                            description={extraSavings > 0 ? "Risparmio extra generato da questo scenario." : "Risparmio stimato con le abitudini attuali."}
                                            icon={Calculator}
                                            tone={extraSavings > 0 ? "positive" : "neutral"}
                                            className={cn(
                                                "h-full min-h-[180px] transition-all duration-300",
                                                extraSavings > 50000 ? "bg-emerald-500/5 dark:bg-emerald-500/10 shadow-[0_0_20px_-12px_rgba(16,185,129,0.3)]" : "hover:bg-white/60"
                                            )}
                                        />
                                    </motion.div>

                                    {/* METRIC 2: HORIZON */}
                                    <motion.div variants={macroItemVariants} className="h-full">
                                        <KpiCard
                                            title="Quando arrivi"
                                            subtitle="Con il ritmo attuale"
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
                                                ? "Con questo ritmo non raggiungi ancora l'obiettivo."
                                                : `Intervallo stimato: ${projection.minMonths}-${projection.maxMonths} mesi`
                                            }
                                            icon={Target}
                                            tone={projection?.canReach ? "positive" : "neutral"}
                                            className={cn(
                                                "h-full min-h-[180px] transition-all duration-500",
                                                projection?.canReach ? "bg-indigo-50/40 dark:bg-indigo-950/20" : "bg-rose-50/40 dark:bg-rose-950/10"
                                            )}
                                        />
                                    </motion.div>

                                    {/* METRIC 3: SUSTAINABILITY */}
                                    <motion.div variants={macroItemVariants} className="h-full">
                                        <KpiCard
                                            title="Sostenibilita"
                                            subtitle="Tenuta del piano"
                                            value={(() => {
                                                const status = currentScenario.sustainability.status
                                                if (status === "secure") return "Molto solido"
                                                if (status === "sustainable") return "Solido"
                                                if (status === "fragile") return "Delicato"
                                                return "A rischio"
                                            })()}
                                            description={currentScenario.sustainability.reason || "Valutazione del sistema su stabilita e possibili imprevisti."}
                                            icon={RefreshCw}
                                            tone={(() => {
                                                const status = currentScenario.sustainability.status
                                                if (status === "secure" || status === "sustainable") return "positive"
                                                if (status === "fragile") return "warning"
                                                return "negative"
                                            })()}
                                            className="h-full min-h-[180px]"
                                        />
                                    </motion.div>
                                </StaggerContainer>

                                {/* Bottom Row: AI Monitor (Full Width) */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        delay: 0.3,
                                        duration: 0.5,
                                        ease: [0.16, 1, 0.3, 1] // Apple-like friction
                                    }}
                                >
                                    {(() => {
                                        const targetDateStr = projection?.likelyDate
                                            ? new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
                                                .format(new Date(projection.likelyDate))
                                                .replace(/^\w/, c => c.toUpperCase())
                                            : null

                                        const aiMonitor = generateAIMonitorMessage({
                                            scenario: currentScenario,
                                            savingsPercent,
                                            monthlySavingsFormatted: formatCents(simulatedSurplus, currency, locale),
                                            monthsToGoal: projection?.likelyMonths || null,
                                            targetDateFormatted: targetDateStr
                                        })
                                        const styles = getAIMonitorStyles(aiMonitor.tone)
                                        return (
                                            <div className={cn(
                                                "glass-card rounded-2xl p-6 border transition-all duration-300",
                                                styles.containerClass,
                                                "hover:shadow-lg"
                                            )}>
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                                                        aiMonitor.tone === "thriving" ? "bg-emerald-500/10" :
                                                            aiMonitor.tone === "stable" ? "bg-indigo-500/10" :
                                                                aiMonitor.tone === "strained" ? "bg-amber-500/10" :
                                                                    "bg-rose-500/10"
                                                    )}>
                                                        <Sparkles className={cn("h-6 w-6", styles.iconClass)} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                                            Monitor piano
                                                        </h4>
                                                        <p className={cn(
                                                            "text-sm font-medium leading-relaxed",
                                                            styles.textClass
                                                        )}>
                                                            &quot;{aiMonitor.message}&quot;
                                                        </p>

                                                        {/* SACRIFICE BADGES (Awareness Layer) */}
                                                        {aiMonitor.sacrifices.length > 0 && (
                                                            <div className="mt-4 flex flex-wrap gap-2">
                                                                {aiMonitor.sacrifices.map((s) => (
                                                                    <Badge
                                                                        key={s.id}
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "bg-white/40 dark:bg-white/5 border-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                                                                            s.intensity === 'high' ? "text-rose-500 border-rose-500/20" :
                                                                                s.intensity === 'medium' ? "text-amber-500 border-amber-500/20" :
                                                                                    "text-indigo-500 border-indigo-500/20"
                                                                        )}
                                                                    >
                                                                        {s.label}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </motion.div>
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
                    onApply={handleCustomApply}
                    baselineMetrics={baselineMetrics}
                    categories={categoriesList || []}
                    goalTargetCents={goalTargetCents}
                    initialSavings={customSavings}
                />
            )}
        </StaggerContainer>
    )
}
