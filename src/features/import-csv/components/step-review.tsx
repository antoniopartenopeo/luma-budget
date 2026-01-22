"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Info, CheckCircle2, HelpCircle, Tags, Store, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { ImportState, Override, Group, Subgroup, EnrichedRow } from "../core/types"
import { resolveCategory } from "../core/overrides"
import { getIncludedGroups, THRESHOLD_MAX_CENTS, THRESHOLD_STEP_CENTS } from "../core/filters"
import { getCategoryById } from "@/features/categories/config"
import { CategoryPicker } from "@/features/categories/components/category-picker"
import { useCategories } from "@/features/categories/api/use-categories"
import { cn } from "@/lib/utils"
import { formatCents } from "@/domain/money"
import { ReviewResult } from "./csv-import-wizard"

interface ImportStepReviewProps {
    initialState: ImportState
    initialOverrides: Override[]
    thresholdCents: number
    onThresholdChange: (cents: number) => void
    onBack: () => void
    onContinue: (result: ReviewResult) => void
}

export function ImportStepReview({
    initialState,
    initialOverrides,
    thresholdCents,
    onThresholdChange,
    onBack,
    onContinue
}: ImportStepReviewProps) {
    const { data: categories = [] } = useCategories()
    const [overrides, setOverrides] = useState<Override[]>(initialOverrides)
    const [viewMode, setViewMode] = useState<"merchant" | "category">("merchant")

    // Visual threshold for slider drag (committed value comes from props)
    const [visualThreshold, setVisualThreshold] = useState(thresholdCents)
    const [isDragging, setIsDragging] = useState(false)

    const { groups, rows } = initialState

    // Use shared filter function for consistency with step-summary
    const { includedGroups: filteredGroups, excludedGroupIds } = useMemo(
        () => getIncludedGroups(groups, thresholdCents),
        [groups, thresholdCents]
    )

    const hiddenGroupsCount = excludedGroupIds.length

    // Override handlers
    const setGroupCategory = (groupId: string, categoryId: string) => {
        setOverrides(prev => {
            const others = prev.filter(o => !(o.targetId === groupId && o.level === "group"))
            return [...others, { targetId: groupId, level: "group", categoryId }]
        })
    }

    const setSubgroupCategory = (subgroupId: string, categoryId: string) => {
        setOverrides(prev => {
            const others = prev.filter(o => !(o.targetId === subgroupId && o.level === "subgroup"))
            return [...others, { targetId: subgroupId, level: "subgroup", categoryId }]
        })
    }

    // Resolve helpers
    const getGroupEffectiveCategory = (group: Group) => {
        const groupOverride = overrides.find(o => o.targetId === group.id && o.level === "group")
        if (groupOverride) return groupOverride.categoryId
        return group.categoryId
    }

    const getSubgroupEffectiveCategory = (subgroup: Subgroup, group: Group) => {
        const subgroupOverride = overrides.find(o => o.targetId === subgroup.id && o.level === "subgroup")
        if (subgroupOverride) return subgroupOverride.categoryId
        // Fall back to group category
        return getGroupEffectiveCategory(group) || subgroup.categoryId
    }

    // Calculate Stats & Category Breakdown (Memoized) - uses filtered groups
    const { stats, categoryGroups } = useMemo(() => {
        let assigned = 0
        let total = 0

        const catMap = new Map<string, {
            id: string,
            label: string,
            color: string,
            amount: number,
            count: number,
            rowIds: string[]
        }>()

        catMap.set("unassigned", {
            id: "unassigned",
            label: "Non Categorizzato",
            color: "bg-muted text-muted-foreground",
            amount: 0,
            count: 0,
            rowIds: []
        })

        filteredGroups.forEach((g: Group) => {
            g.subgroups.forEach((sg: Subgroup) => {
                sg.rowIds.forEach((rid: string) => {
                    const row = rows.find(r => r.id === rid)
                    if (row && row.isSelected) {
                        total++
                        const catId = resolveCategory(row, sg, g, overrides)

                        if (catId) {
                            assigned++
                            const def = getCategoryById(catId, categories)
                            if (!catMap.has(catId) && def) {
                                catMap.set(catId, {
                                    id: catId,
                                    label: def.label,
                                    color: def.color,
                                    amount: 0,
                                    count: 0,
                                    rowIds: []
                                })
                            }

                            const target = catMap.get(catId)!
                            target.amount += row.amountCents
                            target.count++
                            target.rowIds.push(row.id)
                        } else {
                            const target = catMap.get("unassigned")!
                            target.amount += row.amountCents
                            target.count++
                            target.rowIds.push(row.id)
                        }
                    }
                })
            })
        })

        if (catMap.get("unassigned")!.count === 0) {
            catMap.delete("unassigned")
        }

        return {
            stats: { assigned, total },
            categoryGroups: Array.from(catMap.values()).sort((a, b) => b.amount - a.amount)
        }
    }, [filteredGroups, rows, overrides, categories])

    const completionPercent = stats.total > 0 ? (stats.assigned / stats.total) * 100 : 0

    // Rows lookup helper
    const getRowById = (id: string): EnrichedRow | undefined => rows.find(r => r.id === id)

    return (
        <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header - sticky */}
            <div className="p-4 md:p-6 border-b shrink-0 bg-card z-10 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 md:gap-3 mb-1">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs md:text-sm shrink-0">
                                2
                            </div>
                            <h2 className="text-lg md:text-xl font-bold tracking-tight truncate">Revisione Rapida</h2>
                        </div>
                        <p className="text-muted-foreground text-xs md:text-sm truncate">
                            Gruppi ordinati per impatto economico
                        </p>
                    </div>

                    <div className="text-right shrink-0">
                        <div className="text-xl md:text-2xl font-bold font-mono text-primary">
                            {stats.assigned} <span className="text-muted-foreground/40 text-sm md:text-lg">/ {stats.total}</span>
                        </div>
                        <div className="text-[10px] md:text-xs text-muted-foreground font-medium">Classificate</div>
                    </div>
                </div>
            </div>

            {/* Threshold Slider Section */}
            <div className="px-4 md:px-6 py-4 shrink-0 border-b bg-muted/20">
                <div className="flex items-center gap-3 mb-3">
                    <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium">Soglia rilevanza</span>
                    <Badge variant="outline" className="ml-auto font-mono text-xs">
                        {isDragging ? formatCents(visualThreshold) : formatCents(thresholdCents)}
                    </Badge>
                    {hiddenGroupsCount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                            {hiddenGroupsCount} nascosti
                        </Badge>
                    )}
                </div>
                <Slider
                    value={[isDragging ? visualThreshold : thresholdCents]}
                    min={0}
                    max={THRESHOLD_MAX_CENTS}
                    step={THRESHOLD_STEP_CENTS}
                    onValueChange={([v]) => {
                        setVisualThreshold(v)
                        setIsDragging(true)
                    }}
                    onValueCommit={([v]) => {
                        onThresholdChange(v)
                        setIsDragging(false)
                    }}
                    className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Tutti</span>
                    <span>Solo grandi importi</span>
                </div>
            </div>

            {/* Consultant Advice - collapsed by default on mobile */}
            <div className="px-4 md:px-6 pt-4 pb-2 shrink-0">
                {completionPercent < 50 ? (
                    <Alert className="bg-blue-50/50 border-blue-100 text-blue-900 [&>svg]:text-blue-600">
                        <Info className="h-4 w-4" />
                        <AlertTitle className="text-sm">Consiglio Rapido</AlertTitle>
                        <AlertDescription className="text-xs">
                            Non devi classificare tutto ora. Le voci non assegnate andranno in &quot;Altro&quot;.
                        </AlertDescription>
                    </Alert>
                ) : completionPercent < 90 ? (
                    <Alert className="bg-emerald-50/50 border-emerald-100 text-emerald-900 [&>svg]:text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle className="text-sm">Ottimo lavoro!</AlertTitle>
                        <AlertDescription className="text-xs">
                            Hai coperto la maggior parte delle transazioni.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert className="bg-muted/50 border-muted text-muted-foreground">
                        <HelpCircle className="h-4 w-4" />
                        <AlertTitle className="text-sm">Quasi perfetto</AlertTitle>
                        <AlertDescription className="text-xs">
                            Potrai sempre modificare le categorie anche dopo l&apos;import.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Content Area with Tabs - scrollable */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "merchant" | "category")} className="flex-1 flex flex-col min-h-0">
                <div className="px-4 md:px-6 py-2 shrink-0">
                    <TabsList className="grid w-full grid-cols-2 h-9">
                        <TabsTrigger value="merchant" className="gap-1.5 text-xs md:text-sm">
                            <Store className="h-3.5 w-3.5" /> Per Esercente
                        </TabsTrigger>
                        <TabsTrigger value="category" className="gap-1.5 text-xs md:text-sm">
                            <Tags className="h-3.5 w-3.5" /> Per Categoria
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* View: Merchants - Accordion-based with subgroups */}
                <TabsContent value="merchant" className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 min-h-0 data-[state=inactive]:hidden">
                    {filteredGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Filter className="h-10 w-10 text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground text-sm">Nessun gruppo sopra la soglia selezionata</p>
                            <Button variant="ghost" size="sm" className="mt-2" onClick={() => onThresholdChange(0)}>
                                Mostra tutti
                            </Button>
                        </div>
                    ) : (
                        <Accordion type="multiple" className="space-y-2">
                            {filteredGroups.map((group, index) => {
                                const effectiveCatId = getGroupEffectiveCategory(group) ||
                                    group.subgroups[0]?.categoryId ||
                                    rows.find(r => r.merchantKey === group.merchantKey)?.suggestedCategoryId
                                const isHighImpact = index < Math.ceil(filteredGroups.length * 0.2) // Top 20%
                                const hasMultipleSubgroups = group.subgroups.length > 1

                                return (
                                    <AccordionItem
                                        key={group.id}
                                        value={group.id}
                                        className={cn(
                                            "bg-card border rounded-xl shadow-sm overflow-hidden",
                                            isHighImpact && "border-primary/30 ring-1 ring-primary/10"
                                        )}
                                    >
                                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center justify-between w-full gap-3 pr-2">
                                                <div className="flex-1 min-w-0 text-left">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className="font-bold text-sm md:text-base truncate">
                                                            {group.label}
                                                        </h3>
                                                        {isHighImpact && (
                                                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase tracking-wider shrink-0">
                                                                Top
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="font-semibold text-foreground">
                                                            {formatCents(Math.abs(group.totalCents))}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-border" />
                                                        <span>{group.rowCount} tx</span>
                                                        {hasMultipleSubgroups && (
                                                            <>
                                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                                <span>{group.subgroups.length} pattern</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="shrink-0 w-32 md:w-40" onClick={e => e.stopPropagation()}>
                                                    <CategoryPicker
                                                        value={effectiveCatId || ""}
                                                        onChange={(val) => setGroupCategory(group.id, val)}
                                                        type="all"
                                                        compact
                                                    />
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4 pt-0">
                                            {hasMultipleSubgroups ? (
                                                // Nested subgroups accordion
                                                <Accordion type="multiple" className="space-y-1.5 mt-2">
                                                    {group.subgroups.map(sg => {
                                                        const sgCatId = getSubgroupEffectiveCategory(sg, group)
                                                        const sgRows = sg.rowIds.map(getRowById).filter(Boolean) as EnrichedRow[]
                                                        const sgTotal = sgRows.reduce((sum, r) => sum + r.amountCents, 0)

                                                        return (
                                                            <AccordionItem
                                                                key={sg.id}
                                                                value={sg.id}
                                                                className="bg-muted/30 border rounded-lg"
                                                            >
                                                                <AccordionTrigger className="px-3 py-2 hover:no-underline text-sm">
                                                                    <div className="flex items-center justify-between w-full gap-2 pr-2">
                                                                        <div className="flex items-center gap-2 min-w-0">
                                                                            <span className="font-medium truncate">{sg.label}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 shrink-0">
                                                                            <span className="text-xs font-mono text-muted-foreground">
                                                                                {formatCents(Math.abs(sgTotal))}
                                                                            </span>
                                                                            <div onClick={e => e.stopPropagation()} className="w-28">
                                                                                <CategoryPicker
                                                                                    value={sgCatId || ""}
                                                                                    onChange={(val) => setSubgroupCategory(sg.id, val)}
                                                                                    type="all"
                                                                                    compact
                                                                                    size="sm"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </AccordionTrigger>
                                                                <AccordionContent className="px-3 pb-3">
                                                                    <RowsList rows={sgRows} />
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        )
                                                    })}
                                                </Accordion>
                                            ) : (
                                                // Single subgroup - show rows directly
                                                <div className="mt-2">
                                                    <RowsList
                                                        rows={group.subgroups[0]?.rowIds.map(getRowById).filter(Boolean) as EnrichedRow[] || []}
                                                    />
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    )}
                </TabsContent>

                {/* View: Categories (Drill-down) */}
                <TabsContent value="category" className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 min-h-0 data-[state=inactive]:hidden">
                    <div className="space-y-2">
                        <Accordion type="multiple" className="w-full space-y-2">
                            {categoryGroups.map((cg) => (
                                <AccordionItem key={cg.id} value={cg.id} className="bg-card border rounded-xl px-4 shadow-sm">
                                    <AccordionTrigger className="hover:no-underline py-3">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className="flex items-center gap-2">
                                                {cg.id !== 'unassigned' && (
                                                    <div className={cn("w-2.5 h-2.5 rounded-full", cg.color.split(" ")[1])} />
                                                )}
                                                <span className="font-bold text-sm md:text-base">{cg.label}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs md:text-sm">
                                                <Badge variant="outline" className="font-mono">{cg.count}</Badge>
                                                <span className="font-mono font-medium">
                                                    {formatCents(Math.abs(cg.amount))}
                                                </span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-0 pb-4">
                                        <RowsList
                                            rows={cg.rowIds.slice(0, 50).map(getRowById).filter(Boolean) as EnrichedRow[]}
                                            showMore={cg.rowIds.length > 50 ? cg.rowIds.length - 50 : 0}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Footer - sticky */}
            <div className="p-4 md:p-6 border-t bg-card shrink-0 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <Button variant="ghost" onClick={onBack} className="gap-1.5 text-sm">
                    <ArrowLeft className="h-4 w-4" /> Indietro
                </Button>
                <div className="flex items-center gap-3">
                    {hiddenGroupsCount > 0 && (
                        <div className="text-xs text-amber-600 font-medium hidden sm:block">
                            {hiddenGroupsCount} gruppi sotto soglia
                        </div>
                    )}
                    <Button
                        onClick={() => onContinue({ overrides, excludedGroupIds })}
                        className={cn(
                            "gap-1.5 rounded-xl px-6 h-11 shadow-lg hover:translate-y-[-1px] transition-all text-sm",
                            stats.total > stats.assigned && "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200"
                        )}
                        variant={stats.total > stats.assigned ? "outline" : "default"}
                    >
                        {stats.total > stats.assigned ? "Continua" : "Procedi"}
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

// ================================================
// Sub-components
// ================================================

// RowsList sub-component

function RowsList({ rows, showMore = 0 }: { rows: EnrichedRow[], showMore?: number }) {
    if (rows.length === 0) {
        return <p className="text-xs text-muted-foreground text-center py-2">Nessuna transazione</p>
    }

    return (
        <div className="rounded-lg border bg-background divide-y">
            {rows.map(r => (
                <div key={r.id} className="flex justify-between items-center p-2.5 text-xs">
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium truncate">{r.description}</span>
                        <span className="text-[10px] text-muted-foreground">{r.date}</span>
                    </div>
                    <div className={cn(
                        "font-mono font-medium shrink-0 ml-2",
                        r.amountCents >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                        {formatCents(r.amountCents)}
                    </div>
                </div>
            ))}
            {showMore > 0 && (
                <div className="p-2 text-center text-[10px] text-muted-foreground bg-muted/30">
                    ...e altri {showMore}
                </div>
            )}
        </div>
    )
}
