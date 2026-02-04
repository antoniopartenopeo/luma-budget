"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Store, Tags, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImportState, Override, Group, Subgroup, EnrichedRow } from "../core/types"
import { resolveCategory } from "../core/overrides"
import { getIncludedGroups } from "../core/filters"
import { getCategoryById } from "@/features/categories/config"
import { useCategories } from "@/features/categories/api/use-categories"
import { cn } from "@/lib/utils"
import { ReviewResult } from "./csv-import-wizard"
import { WizardShell } from "./wizard-shell"
import { MacroSection } from "@/components/patterns/macro-section"

// Sub-components
import {
    ReviewAdvice,
    ThresholdSlider,
    MerchantGroupCard,
    CategoryGroupList
} from "./review"

// ============================================
// Types
// ============================================

interface ImportStepReviewProps {
    initialState: ImportState
    initialOverrides: Override[]
    thresholdCents: number
    onThresholdChange: (cents: number) => void
    onBack: () => void
    onContinue: (result: ReviewResult) => void
}

interface CategoryGroup {
    id: string
    label: string
    color: string
    amount: number
    count: number
    rowIds: string[]
}

// ============================================
// Main Component
// ============================================

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

    // ============================================
    // Override Handlers
    // ============================================

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

    // ============================================
    // Category Resolution Helpers
    // ============================================

    const getGroupEffectiveCategory = (group: Group) => {
        const groupOverride = overrides.find(o => o.targetId === group.id && o.level === "group")
        if (groupOverride) return groupOverride.categoryId
        return group.categoryId
    }

    const getSubgroupEffectiveCategory = (subgroup: Subgroup, group: Group) => {
        const subgroupOverride = overrides.find(o => o.targetId === subgroup.id && o.level === "subgroup")
        if (subgroupOverride) return subgroupOverride.categoryId
        return getGroupEffectiveCategory(group) || subgroup.categoryId
    }

    // ============================================
    // Stats & Category Breakdown (Memoized)
    // ============================================

    const { stats, categoryGroups } = useMemo(() => {
        let assigned = 0
        let total = 0

        const catMap = new Map<string, CategoryGroup>()

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

    // ============================================
    // Render Helpers
    // ============================================

    const footer = (
        <div className="flex w-full justify-between items-center gap-4">
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
    )

    const headerExtra = (
        <div className="text-right shrink-0 bg-muted/50 p-2 px-4 rounded-xl border">
            <div className="text-xl md:text-2xl font-bold font-mono text-primary flex items-baseline justify-end gap-1">
                {stats.assigned} <span className="text-muted-foreground/40 text-sm md:text-base font-sans">di {stats.total}</span>
            </div>
            <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Classificate</div>
        </div>
    )

    const topBar = (
        <ThresholdSlider
            thresholdCents={thresholdCents}
            visualThreshold={visualThreshold}
            isDragging={isDragging}
            hiddenGroupsCount={hiddenGroupsCount}
            onVisualChange={setVisualThreshold}
            onCommit={onThresholdChange}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
        />
    )

    // ============================================
    // Main Render
    // ============================================

    return (
        <WizardShell
            title="Revisione Rapida"
            subtitle="Controlla come abbiamo raggruppato le tue spese."
            step="review"
            headerExtra={headerExtra}
            topBar={topBar}
            footer={footer}
        >
            <div className="space-y-6">

                {/* Consultant Advice */}
                <div className="shrink-0">
                    <ReviewAdvice completionPercent={completionPercent} />
                </div>

                {/* Content Area with Tabs */}
                <MacroSection contentClassName="p-0">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "merchant" | "category")} className="flex-1 flex flex-col min-h-0">
                        <div className="pb-4 shrink-0">
                            <TabsList className="grid w-full grid-cols-2 h-9">
                                <TabsTrigger value="merchant" className="gap-1.5 text-xs md:text-sm">
                                    <Store className="h-3.5 w-3.5" /> Per Esercente
                                </TabsTrigger>
                                <TabsTrigger value="category" className="gap-1.5 text-xs md:text-sm">
                                    <Tags className="h-3.5 w-3.5" /> Per Categoria
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* View: Merchants */}
                        <TabsContent value="merchant" className="flex-1 min-h-0 data-[state=inactive]:hidden mt-0">
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

                                        return (
                                            <MerchantGroupCard
                                                key={group.id}
                                                group={group}
                                                index={index}
                                                totalGroups={filteredGroups.length}
                                                effectiveCategoryId={effectiveCatId || null}

                                                onGroupCategoryChange={setGroupCategory}
                                                onSubgroupCategoryChange={setSubgroupCategory}
                                                getSubgroupEffectiveCategory={(sg) => getSubgroupEffectiveCategory(sg, group)}
                                                getRowById={getRowById}
                                            />
                                        )
                                    })}
                                </Accordion>
                            )}
                        </TabsContent>

                        {/* View: Categories */}
                        <TabsContent value="category" className="flex-1 min-h-0 data-[state=inactive]:hidden mt-0">
                            <CategoryGroupList
                                categoryGroups={categoryGroups}
                                getRowById={getRowById}
                            />
                        </TabsContent>
                    </Tabs>
                </MacroSection>
            </div>
        </WizardShell>
    )
}
