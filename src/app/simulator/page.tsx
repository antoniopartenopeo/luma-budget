"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useMonthlyAverages } from "@/features/simulator/hooks"
import { applySavings, SimulationPeriod, groupAndSortCategories, computeEffectiveSavingsPct, classifySuperfluousSpend } from "@/features/simulator/utils"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatCents } from "@/domain/money"
import { cn } from "@/lib/utils"
import { SpendingNature, CATEGORY_GROUP_LABELS } from "@/features/categories/config"
import { MacroSection } from "@/components/patterns/macro-section"

export default function SimulatorPage() {
    // 1. Local Read-Only State
    const [period, setPeriod] = useState<SimulationPeriod>(6)

    // State for Groups and Overrides
    const [groupSavings, setGroupSavings] = useState<Record<SpendingNature, number>>({
        essential: 0,
        comfort: 0,
        superfluous: 0
    })
    const [categoryOverrides, setCategoryOverrides] = useState<Record<string, number>>({})
    const [expandedGroups, setExpandedGroups] = useState<Record<SpendingNature, boolean>>({
        essential: false,
        comfort: false,
        superfluous: true // Default expanded
    })

    // 2. Data Fetching
    const { data: categoriesList, isLoading, rawAverages } = useMonthlyAverages(period)
    const { currency, locale } = useCurrency()

    // 3. Derived Computation
    // A. Group Data
    const groupedData = useMemo(() => {
        return groupAndSortCategories(rawAverages, categoriesList)
    }, [rawAverages, categoriesList])

    // B. Effective Savings Map
    const effectiveSavingsMap = useMemo(() => {
        const map: Record<string, number> = {}
        // Iterate all active categories
        categoriesList.forEach(cat => {
            if (cat.kind === "expense") {
                const groupPct = groupSavings[cat.spendingNature] || 0
                const overridePct = categoryOverrides[cat.id] ?? null
                map[cat.id] = computeEffectiveSavingsPct(groupPct, overridePct)
            }
        })
        return map
    }, [categoriesList, groupSavings, categoryOverrides])

    // C. Global Simulation Result (using pure util)
    const simulationResult = useMemo(() => {
        return applySavings(rawAverages, effectiveSavingsMap)
    }, [rawAverages, effectiveSavingsMap])

    // D. Superfluous Status
    const superfluousStatus = useMemo(() => {
        const supGroup = groupedData.superfluous
        const totalExpensesBaseline = simulationResult.baselineTotal
        return classifySuperfluousSpend(supGroup.totalBaseline, totalExpensesBaseline)
    }, [groupedData, simulationResult.baselineTotal])


    // Handlers
    const handleGroupSliderChange = (nature: SpendingNature, val: number[]) => {
        setGroupSavings(prev => ({ ...prev, [nature]: val[0] }))
    }

    const handleCategoryOverrideChange = (catId: string, val: number[]) => {
        setCategoryOverrides(prev => ({ ...prev, [catId]: val[0] }))
    }

    const toggleGroupExpansion = (nature: SpendingNature) => {
        setExpandedGroups(prev => ({ ...prev, [nature]: !prev[nature] }))
    }

    const clearGroupOverrides = (nature: SpendingNature) => {
        const newOverrides = { ...categoryOverrides }
        // Remove keys belonging to this group
        groupedData[nature].items.forEach(item => {
            delete newOverrides[item.category.id]
        })
        setCategoryOverrides(newOverrides)
    }

    const handleReset = () => {
        setGroupSavings({ essential: 0, comfort: 0, superfluous: 0 })
        setCategoryOverrides({})
    }

    // Render Helpers
    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Caricamento simulatore...</div>
    }

    // Helper to render group Card
    const renderGroupCard = (nature: SpendingNature) => {
        const group = groupedData[nature]
        // If empty, we still render the card but with empty state or 0 baseline
        // if (group.totalBaseline === 0) return null

        const isExpanded = expandedGroups[nature]
        const currentGroupSaving = groupSavings[nature]
        const groupLabel = CATEGORY_GROUP_LABELS[nature]

        // Calculate Group simulated total for display (sum of its items)
        let groupSimulatedTotal = 0
        group.items.forEach(item => {
            const effPct = computeEffectiveSavingsPct(currentGroupSaving, categoryOverrides[item.category.id] ?? null)
            groupSimulatedTotal += Math.round(item.averageAmount * (1 - effPct / 100))
        })

        // Priority Card Styles for Superfluous
        const isSuperfluous = nature === "superfluous"
        const status = (isSuperfluous && superfluousStatus) ? superfluousStatus : "OK"

        // Dynamic Styles based on status
        let containerClasses = "glass-panel hover:bg-white/70 dark:hover:bg-slate-800/60"
        let statusGlow = ""
        let statusBadge = null

        if (isSuperfluous) {
            if (status === "HIGH") {
                containerClasses = "bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-900/50 backdrop-blur-xl shadow-xl hover:bg-rose-100/50 dark:hover:bg-rose-900/40"
                statusGlow = "shadow-[0_0_30px_-10px_rgba(244,63,94,0.3)]"
                statusBadge = (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100/80 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-bold uppercase tracking-wider border border-rose-200/50 dark:border-rose-500/30">
                        <AlertTriangle className="h-3 w-3" />
                        Alta Priorità
                    </div>
                )
            } else if (status === "WARN") {
                containerClasses = "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-900/50 backdrop-blur-xl shadow-xl hover:bg-amber-100/50 dark:hover:bg-amber-900/40"
                statusGlow = "shadow-[0_0_30px_-10px_rgba(251,191,36,0.3)]"
                statusBadge = (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-200/50 dark:border-amber-500/30">
                        <AlertCircle className="h-3 w-3" />
                        Attenzione
                    </div>
                )
            } else {
                containerClasses = "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-900/50 backdrop-blur-xl shadow-xl hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40"
                statusBadge = (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-200/50 dark:border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" />
                        Sotto controllo
                    </div>
                )
            }
        }

        return (
            <div key={nature} className={cn(
                "group relative overflow-hidden rounded-3xl transition-all duration-300",
                containerClasses,
                statusGlow,
                isExpanded ? "scale-[1.01] shadow-2xl" : "shadow-sm hover:shadow-md"
            )}>
                <div className="p-6 space-y-6">
                    {/* Header Row */}
                    <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => toggleGroupExpansion(nature)}>
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-sm",
                                isExpanded ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                            )}>
                                {isExpanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                            </div>
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                                    <h3 className="font-bold text-lg text-foreground tracking-tight leading-tight">
                                        {groupLabel}
                                    </h3>
                                    <div className="self-start sm:self-auto">
                                        {statusBadge}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Media: <span className="text-foreground/80">{formatCents(group.totalBaseline, currency, locale)}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-foreground tracking-tight">
                                {formatCents(groupSimulatedTotal, currency, locale)}
                            </div>
                            {group.totalBaseline > groupSimulatedTotal && (
                                <div className="text-sm font-semibold text-emerald-600 bg-emerald-100/50 px-3 py-1 rounded-full inline-block mt-1">
                                    -{formatCents(group.totalBaseline - groupSimulatedTotal, currency, locale)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Group Slider */}
                    <div className="flex items-center gap-4 glass-card p-4 rounded-2xl">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider w-24">Risparmio Gruppo</span>
                        <Slider
                            value={[currentGroupSaving]}
                            max={100}
                            step={5}
                            onValueChange={(v: number[]) => handleGroupSliderChange(nature, v)}
                            className="flex-1 py-1"
                        />
                        <div className="w-12 text-right">
                            <span className={cn(
                                "text-lg font-bold",
                                currentGroupSaving > 0 ? "text-primary" : "text-muted-foreground/50"
                            )}>{currentGroupSaving}%</span>
                        </div>
                    </div>

                    {/* Expanded Content: Top 5 Categories */}
                    {isExpanded && (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-300 ease-out">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Spese</span>
                                {Object.keys(categoryOverrides).some(id => groupedData[nature].items.find(i => i.category.id === id)) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-full px-3 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            clearGroupOverrides(nature)
                                        }}
                                    >
                                        Resetta manuali
                                    </Button>
                                )}
                            </div>

                            <div className="grid gap-3">
                                {group.items.map(item => {
                                    const overrideVal = categoryOverrides[item.category.id]
                                    const hasOverride = overrideVal !== undefined && overrideVal !== null
                                    const effectivePct = computeEffectiveSavingsPct(currentGroupSaving, overrideVal ?? null)
                                    const itemSimulated = Math.round(item.averageAmount * (1 - effectivePct / 100))

                                    return (
                                        <div key={item.category.id} className={cn(
                                            "group/item grid grid-cols-1 sm:grid-cols-[2fr_3fr_1fr] gap-4 items-center p-4 rounded-2xl border transition-all duration-200",
                                            hasOverride
                                                ? "bg-primary/5 border-primary/20 shadow-sm"
                                                : "glass-card hover:bg-white/60 dark:hover:bg-white/10"
                                        )}>
                                            {/* Name & Icon */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 text-slate-600">
                                                    <CategoryIcon categoryId={item.category.id} size={18} />
                                                </div>
                                                <div className="truncate">
                                                    <div className="text-sm font-semibold text-foreground truncate">{item.category.label}</div>
                                                    <div className="text-xs text-muted-foreground font-medium">{formatCents(item.averageAmount, currency, locale)}</div>
                                                </div>
                                            </div>

                                            {/* Slider */}
                                            <div className="flex items-center gap-3 px-2">
                                                <Slider
                                                    value={[hasOverride ? overrideVal : currentGroupSaving]}
                                                    max={100}
                                                    step={5}
                                                    onValueChange={(v: number[]) => handleCategoryOverrideChange(item.category.id, v)}
                                                    className={cn("flex-1 transition-opacity", hasOverride ? "opacity-100" : "opacity-50 group-hover/item:opacity-100")}
                                                />
                                            </div>

                                            {/* Result */}
                                            <div className="text-right">
                                                <div className={cn("text-base font-bold tabular-nums", effectivePct > 0 ? "text-primary" : "text-foreground/80")}>
                                                    {formatCents(itemSimulated, currency, locale)}
                                                </div>
                                                {effectivePct > 0 && (
                                                    <div className="text-[10px] font-bold text-emerald-600">-{effectivePct}%</div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}

                                {group.items.length === 0 && (
                                    <div className="text-center py-8 glass-card rounded-2xl border-dashed">
                                        <p className="text-sm text-muted-foreground font-medium">Nessuna spesa rilevante in questo gruppo.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                    }
                </div >
            </div >
        )
    }

    // Microcopy for Superfluous
    const renderSuperfluousAdvice = () => {
        if (superfluousStatus === "HIGH") return "Attenzione: una parte importante delle spese è superflua. Prova a ridurre del 10–20%."
        if (superfluousStatus === "WARN") return "Qui c'è margine: anche piccoli tagli fanno una grande differenza."
        return "Ottimo, le spese superflue sono già sotto controllo."
    }

    return (
        <div className="space-y-8 pb-24 md:pb-12 w-full">
            <PageHeader
                title="Simulatore Spese"
                description="Analizza il tuo stile di vita e simula scenari di risparmio intelligenti."
            />

            {/* HERO RESULTS: Top of the page */}
            {/* HERO RESULTS: Top of the page */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <MacroSection
                    title={
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 border border-border/50 flex items-center justify-center shadow-sm">
                                <Calculator className="h-7 w-7 text-primary fill-primary/20" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                                    Risultati Simulazione
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-2 h-6 font-bold">LIVE</Badge>
                                </h2>
                                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                    Analisi Risparmio Mensile
                                </p>
                            </div>
                        </div>
                    }
                    headerActions={
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 glass-card p-1.5 rounded-xl border-none">
                                <Select value={period.toString()} onValueChange={(v) => setPeriod(parseInt(v) as SimulationPeriod)}>
                                    <SelectTrigger className="w-[150px] h-9 text-xs border-0 bg-transparent focus:ring-0 shadow-none font-bold uppercase tracking-wider">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3">Ultimi 3 Mesi</SelectItem>
                                        <SelectItem value="6">Ultimi 6 Mesi</SelectItem>
                                        <SelectItem value="12">Ultimo Anno</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="h-10 w-10 rounded-full hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                                title="Resetta tutto"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                        </div>
                    }
                    className="w-full"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pt-4">
                        {/* Detailed Stats */}
                        <div className="space-y-4 md:col-span-1">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Spesa Baseline</p>
                                <p className="text-xl font-bold tabular-nums text-foreground/70">{formatCents(simulationResult.baselineTotal, currency, locale)}</p>
                            </div>
                            <Separator className="bg-border/30" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nuova Proiezione</p>
                                <p className="text-xl font-bold tabular-nums text-foreground">{formatCents(simulationResult.simulatedTotal, currency, locale)}</p>
                            </div>
                        </div>

                        {/* Main Result Hero */}
                        <div className="md:col-span-2">
                            {simulationResult.savingsAmount > 0 ? (
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-500" />
                                    <div className="relative bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
                                        <div className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-600 mb-2">Risparmio Stimato</div>
                                        <div className="text-5xl font-black tracking-tighter text-emerald-600 tabular-nums mb-3">
                                            {formatCents(simulationResult.savingsAmount, currency, locale)}
                                        </div>
                                        <div className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-sm font-black shadow-lg shadow-emerald-500/30">
                                            -{simulationResult.savingsPercent}% / Mese
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-border/40 rounded-[2rem] text-muted-foreground/60 italic font-medium">
                                    Regola gli slider sotto per vedere il risparmio
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Semantic Advice Layer */}
                    <div className="mt-8 pt-6 border-t border-border/30 flex gap-4 items-start">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium text-foreground/80 leading-relaxed italic py-1">
                            &quot;{renderSuperfluousAdvice()}&quot;
                        </p>
                    </div>
                </MacroSection>
            </motion.div>

            {/* GROUPS: The interactive part */}
            <div className="space-y-6 pt-4">
                <div className="flex flex-col gap-1 px-1">
                    <h2 className="text-xl font-bold tracking-tight text-foreground/90">Interventi per Categoria</h2>
                    <p className="text-sm text-muted-foreground font-medium">Modula il risparmio per ogni natura di spesa.</p>
                </div>

                <div className="space-y-6">
                    {/* Order: Superfluous (Priority), then others */}
                    {renderGroupCard("superfluous")}
                    {renderGroupCard("comfort")}
                    {renderGroupCard("essential")}

                    {/* Empty State Check */}
                    {simulationResult.baselineTotal === 0 && (
                        <div className="text-center py-20 text-muted-foreground glass-panel rounded-3xl">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                                <Calculator className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">Nessuna spesa trovata</h3>
                            <p className="text-sm text-muted-foreground mt-1">Non ci sono transazioni nel periodo selezionato.</p>
                            <Button variant="link" className="mt-4 text-primary font-semibold">
                                Vai alle Transazioni
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
