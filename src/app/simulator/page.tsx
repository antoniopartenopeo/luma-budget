
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
import { formatEuroNumber } from "@/lib/currency-utils"
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
        // If empty, don't render? Or render empty? User said "expanded groups".
        // If empty baseline, maybe skip.
        if (group.totalBaseline === 0) return null

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
        let borderColor = "border-slate-200"
        let priorityBadge = null

        if (isSuperfluous) {
            if (superfluousStatus === "HIGH") {
                borderColor = "border-red-500 ring-1 ring-red-500/20"
                priorityBadge = <Badge variant="destructive" className="ml-2 gap-1"><AlertTriangle className="h-3 w-3" /> Alta Priorità</Badge>
            } else if (superfluousStatus === "WARN") {
                borderColor = "border-orange-400 ring-1 ring-orange-400/20"
                priorityBadge = <Badge variant="outline" className="ml-2 text-orange-600 border-orange-200 gap-1"><AlertCircle className="h-3 w-3" /> Attenzione</Badge>
            } else {
                borderColor = "border-emerald-500/50"
                priorityBadge = <Badge variant="outline" className="ml-2 text-emerald-600 border-emerald-200 gap-1"><CheckCircle2 className="h-3 w-3" /> Sotto controllo</Badge>
            }
        }

        return (
            <Card key={nature} className={cn("overflow-hidden transition-all duration-300 shadow-sm", borderColor)}>
                <div className="p-4 space-y-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => toggleGroupExpansion(nature)}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500",
                                isExpanded && "bg-primary/10 text-primary"
                            )}>
                                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </div>
                            <div>
                                <h3 className="font-semibold text-base flex items-center">
                                    {groupLabel}
                                    {priorityBadge}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Spesa media: <span className="font-medium text-slate-700">{formatEuroNumber(group.totalBaseline, currency, locale)}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-slate-900">
                                {formatEuroNumber(groupSimulatedTotal, currency, locale)}
                            </div>
                            {group.totalBaseline > groupSimulatedTotal && (
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                                    -{formatEuroNumber(group.totalBaseline - groupSimulatedTotal, currency, locale)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Group Slider */}
                    <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl">
                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap w-20">Risparmio Gruppo</span>
                        <Slider
                            value={[currentGroupSaving]}
                            max={100}
                            step={5}
                            onValueChange={(v: number[]) => handleGroupSliderChange(nature, v)}
                            className="flex-1"
                        />
                        <span className="text-sm font-bold w-10 text-right">{currentGroupSaving}%</span>
                    </div>

                    {/* Expanded Content: Top 5 Categories */}
                    {isExpanded && (
                        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Spese</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px] text-muted-foreground hover:text-primary"
                                    onClick={() => clearGroupOverrides(nature)}
                                >
                                    Resetta Overrides
                                </Button>
                            </div>

                            {group.items.slice(0, 5).map(item => {
                                const overrideVal = categoryOverrides[item.category.id]
                                const hasOverride = overrideVal !== undefined && overrideVal !== null
                                const effectivePct = computeEffectiveSavingsPct(currentGroupSaving, overrideVal ?? null)
                                const itemSimulated = Math.round(item.averageAmount * (1 - effectivePct / 100))

                                return (
                                    <div key={item.category.id} className="grid grid-cols-1 sm:grid-cols-[2fr_3fr_1fr] gap-3 items-center p-3 rounded-lg border border-slate-100 bg-white/50">
                                        {/* Name & Icon */}
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                                <CategoryIcon categoryId={item.category.id} size={16} />
                                            </div>
                                            <div className="truncate">
                                                <div className="text-sm font-medium truncate">{item.category.label}</div>
                                                <div className="text-[10px] text-slate-400">{formatEuroNumber(item.averageAmount, currency, locale)}</div>
                                            </div>
                                        </div>

                                        {/* Slider */}
                                        <div className="flex items-center gap-2">
                                            <Slider
                                                value={[hasOverride ? overrideVal : currentGroupSaving]} // If no override, visualize group val? Or 0? Usually better to visualize effective.
                                                // BUT if I drag, I set override.
                                                // If I haven't overridden, showing the group slider position is good feedback.
                                                max={100}
                                                step={5}
                                                onValueChange={(v: number[]) => handleCategoryOverrideChange(item.category.id, v)}
                                                className={cn("flex-1", hasOverride ? "opacity-100" : "opacity-60")}
                                            />
                                        </div>

                                        {/* Result */}
                                        <div className="text-right">
                                            <div className={cn("text-sm font-bold", effectivePct > 0 ? "text-primary" : "text-slate-700")}>
                                                {formatEuroNumber(itemSimulated, currency, locale)}
                                            </div>
                                            {effectivePct > 0 && (
                                                <div className="text-[10px] text-emerald-600">-{effectivePct}%</div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}

                            {group.items.length > 5 && (
                                <div className="text-center text-xs text-muted-foreground py-2">
                                    + altre {group.items.length - 5} categorie minori
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        )
    }

    // Microcopy for Superfluous
    const renderSuperfluousAdvice = () => {
        if (superfluousStatus === "HIGH") return "Attenzione: una parte importante delle spese è superflua. Prova a ridurre del 10–20%."
        if (superfluousStatus === "WARN") return "Qui c'è margine: anche piccoli tagli fanno una grande differenza."
        return "Ottimo, le spese superflue sono già sotto controllo."
    }

    return (
        <div className="space-y-6 pb-20 md:pb-6">
            <PageHeader
                title="Simulatore"
                description="Analizza e riduci le tue spese per gruppi o categorie."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COL: Groups & Controls */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Compact Toolbar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-500">Analisi su:</span>
                            <Select value={period.toString()} onValueChange={(v) => setPeriod(parseInt(v) as SimulationPeriod)}>
                                <SelectTrigger className="w-[180px] h-9 text-sm">
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
                            className="text-slate-500 hover:text-red-500 hover:bg-red-50 h-9"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resetta
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
                            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
                                Nessuna spesa trovata nel periodo selezionato.
                                <Button variant="link" className="mt-2 block mx-auto">
                                    Vai alle Transazioni
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COL: Sticky Results */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <Card className="relative overflow-hidden rounded-[2rem] border border-white/40 shadow-xl bg-white/40 backdrop-blur-3xl p-6">
                            {/* Ambient Glows */}
                            <div className="absolute top-[-50%] right-[-50%] w-[150%] h-[150%] bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />

                            <CardHeader className="p-0 pb-4 relative z-10">
                                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                                    <Calculator className="h-5 w-5 text-primary" />
                                    Risultati
                                </CardTitle>
                                <p className="text-xs text-slate-500 font-medium">
                                    Stima mensile (Media {period} mesi)
                                </p>
                            </CardHeader>

                            <CardContent className="space-y-6 p-0 relative z-10">
                                {/* Baseline vs Simulated */}
                                <div className="space-y-2 bg-white/50 rounded-xl p-4 border border-white/50 shadow-sm">
                                    <div className="flex justify-between text-sm text-slate-500 font-medium">
                                        <span>Spesa Attuale</span>
                                        <span>{formatEuroNumber(simulationResult.baselineTotal, currency, locale)}</span>
                                    </div>
                                    <Separator className="bg-slate-200/50" />
                                    <div className="flex justify-between text-xl font-bold text-slate-900 items-baseline">
                                        <span>Nuova Spesa</span>
                                        <span>{formatEuroNumber(simulationResult.simulatedTotal, currency, locale)}</span>
                                    </div>
                                </div>

                                {/* Savings Big KPI */}
                                {simulationResult.savingsAmount > 0 ? (
                                    <div className="bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rounded-2xl p-5 text-center transform transition-all hover:scale-[1.02]">
                                        <div className="text-xs uppercase tracking-wider font-bold text-emerald-100 mb-1">
                                            Risparmio Mensile
                                        </div>
                                        <div className="text-3xl font-extrabold">
                                            {formatEuroNumber(simulationResult.savingsAmount, currency, locale)}
                                        </div>
                                        <div className="text-sm font-semibold text-emerald-100 mt-1">
                                            -{simulationResult.savingsPercent}% del totale
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-100 rounded-2xl p-5 text-center text-slate-400">
                                        <div className="text-sm font-medium">Nessuna modifica</div>
                                        <div className="text-xs mt-1">Muovi gli slider per simulare</div>
                                    </div>
                                )}

                                {/* Microcopy / Advice */}
                                <div className="text-xs text-center px-4 py-2 bg-slate-50 rounded-lg text-slate-500 italic">
                                    &quot;{renderSuperfluousAdvice()}&quot;
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
