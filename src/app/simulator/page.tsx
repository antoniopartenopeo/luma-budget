
"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react"
import { useMonthlyAverages } from "@/features/simulator/hooks"
import { applySavings, SimulationPeriod, groupAndSortCategories, computeEffectiveSavingsPct, classifySuperfluousSpend } from "@/features/simulator/utils"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatCents } from "@/lib/currency-utils"
import { cn } from "@/lib/utils"
import { SpendingNature, CATEGORY_GROUP_LABELS } from "@/features/categories/config"

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
        let containerClasses = "bg-white/60 hover:bg-white/80 border-white/40"
        let statusGlow = ""
        let statusBadge = null

        if (isSuperfluous) {
            if (status === "HIGH") {
                containerClasses = "bg-rose-50/60 hover:bg-rose-50/80 border-rose-100 dark:bg-rose-900/10"
                statusGlow = "shadow-[0_0_30px_-10px_rgba(244,63,94,0.3)]"
                statusBadge = (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100/80 text-rose-700 text-[10px] font-bold uppercase tracking-wider border border-rose-200/50">
                        <AlertTriangle className="h-3 w-3" />
                        Alta Priorità
                    </div>
                )
            } else if (status === "WARN") {
                containerClasses = "bg-amber-50/60 hover:bg-amber-50/80 border-amber-100 dark:bg-amber-900/10"
                statusGlow = "shadow-[0_0_30px_-10px_rgba(251,191,36,0.3)]"
                statusBadge = (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200/50">
                        <AlertCircle className="h-3 w-3" />
                        Attenzione
                    </div>
                )
            } else {
                containerClasses = "bg-emerald-50/60 hover:bg-emerald-50/80 border-emerald-100 dark:bg-emerald-900/10"
                statusBadge = (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200/50">
                        <CheckCircle2 className="h-3 w-3" />
                        Sotto controllo
                    </div>
                )
            }
        }

        return (
            <div key={nature} className={cn(
                "group relative overflow-hidden rounded-3xl border backdrop-blur-xl transition-all duration-300",
                containerClasses,
                statusGlow,
                isExpanded ? "shadow-lg scale-[1.01]" : "shadow-sm hover:shadow-md"
            )}>
                <div className="p-6 space-y-6">
                    {/* Header Row */}
                    <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => toggleGroupExpansion(nature)}>
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-sm",
                                isExpanded ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-white text-slate-400"
                            )}>
                                {isExpanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-lg text-slate-900 tracking-tight">
                                        {groupLabel}
                                    </h3>
                                    {statusBadge}
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Media: <span className="text-slate-700">{formatCents(group.totalBaseline, currency, locale)}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">
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
                    <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/60 shadow-inner">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Risparmio Gruppo</span>
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
                                currentGroupSaving > 0 ? "text-primary" : "text-slate-300"
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
                                                : "bg-white/40 border-slate-100 hover:bg-white/60"
                                        )}>
                                            {/* Name & Icon */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 text-slate-600">
                                                    <CategoryIcon categoryId={item.category.id} size={18} />
                                                </div>
                                                <div className="truncate">
                                                    <div className="text-sm font-semibold text-slate-900 truncate">{item.category.label}</div>
                                                    <div className="text-xs text-slate-400 font-medium">{formatCents(item.averageAmount, currency, locale)}</div>
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
                                                <div className={cn("text-base font-bold tabular-nums", effectivePct > 0 ? "text-primary" : "text-slate-700")}>
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
                                    <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-sm text-slate-500 font-medium">Nessuna spesa rilevante in questo gruppo.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Microcopy for Superfluous
    const renderSuperfluousAdvice = () => {
        if (superfluousStatus === "HIGH") return "Attenzione: una parte importante delle spese è superflua. Prova a ridurre del 10–20%."
        if (superfluousStatus === "WARN") return "Qui c'è margine: anche piccoli tagli fanno una grande differenza."
        return "Ottimo, le spese superflue sono già sotto controllo."
    }

    return (
        <div className="space-y-8 pb-24 md:pb-12 max-w-7xl mx-auto">
            <PageHeader
                title="Simulatore Spese"
                description="Analizza il tuo stile di vita e simula scenari di risparmio intelligenti."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COL: Groups & Controls */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Compact Toolbar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1">
                        <div className="flex items-center gap-3 bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-sm backdrop-blur-md">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-3">Analisi:</span>
                            <Select value={period.toString()} onValueChange={(v) => setPeriod(parseInt(v) as SimulationPeriod)}>
                                <SelectTrigger className="w-[160px] h-9 text-sm border-0 bg-transparent focus:ring-0 shadow-none font-medium">
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
                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 h-9 rounded-xl px-4 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resetta tutto
                        </Button>
                    </div>

                    {/* Groups List */}
                    <div className="space-y-6">
                        {/* Order: Superfluous (Priority), then others */}
                        {renderGroupCard("superfluous")}
                        {renderGroupCard("comfort")}
                        {renderGroupCard("essential")}

                        {/* Empty State Check */}
                        {simulationResult.baselineTotal === 0 && (
                            <div className="text-center py-20 text-muted-foreground bg-white/40 border border-white/50 backdrop-blur-sm rounded-3xl">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                                    <Calculator className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">Nessuna spesa trovata</h3>
                                <p className="text-sm text-slate-500 mt-1">Non ci sono transazioni nel periodo selezionato.</p>
                                <Button variant="link" className="mt-4 text-primary font-semibold">
                                    Vai alle Transazioni
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COL: Sticky Results */}
                <div className="lg:col-span-4 sticky top-6 space-y-6">
                    <Card className="relative overflow-hidden rounded-[2.5rem] border-0 shadow-2xl bg-slate-900 text-white p-8 group">
                        {/* Dynamic Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />

                        {/* Glow Effects */}
                        <div className="absolute top-[-50%] right-[-50%] w-[150%] h-[150%] bg-gradient-to-br from-primary/20 to-transparent pointer-events-none opacity-50 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8 opacity-90">
                                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                                    <Calculator className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight text-white">Risultati</h2>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                        Stima mensile
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Baseline vs Simulated */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center group/row">
                                        <span className="text-sm text-slate-400 font-medium group-hover/row:text-slate-300 transition-colors">Spesa Attuale</span>
                                        <span className="text-base font-medium text-slate-300 tabular-nums">{formatCents(simulationResult.baselineTotal, currency, locale)}</span>
                                    </div>

                                    <Separator className="bg-white/10" />

                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-semibold text-white">Nuova Spesa</span>
                                        <span className="text-2xl font-bold text-white tabular-nums tracking-tight animate-in fade-in zoom-in-95 duration-300 key={simulationResult.simulatedTotal}">
                                            {formatCents(simulationResult.simulatedTotal, currency, locale)}
                                        </span>
                                    </div>
                                </div>

                                {/* Savings Big KPI */}
                                {simulationResult.savingsAmount > 0 ? (
                                    <div className="bg-emerald-500 text-white shadow-xl shadow-emerald-900/50 rounded-[1.5rem] p-6 text-center transform transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-emerald-900/30 border border-emerald-400/20 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                                        <div className="relative">
                                            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-100 mb-2">
                                                Risparmio Mensile
                                            </div>
                                            <div className="text-4xl font-black tracking-tight drop-shadow-sm tabular-nums">
                                                {formatCents(simulationResult.savingsAmount, currency, locale)}
                                            </div>
                                            <div className="inline-flex items-center gap-1.5 mt-2 bg-emerald-600/30 px-3 py-1 rounded-full border border-emerald-400/30">
                                                <span className="text-sm font-bold text-emerald-50">-{simulationResult.savingsPercent}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 rounded-[1.5rem] p-6 text-center text-slate-500 border border-white/5 backdrop-blur-sm">
                                        <p className="text-sm font-medium">Nessuna modifica</p>
                                        <p className="text-xs mt-1 text-slate-600">Muovi gli slider a sinistra per simulare</p>
                                    </div>
                                )}

                                {/* Microcopy / Advice */}
                                <div className="text-xs text-center leading-relaxed text-slate-400 italic">
                                    &quot;{renderSuperfluousAdvice()}&quot;
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
