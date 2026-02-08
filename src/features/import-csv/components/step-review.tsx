"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Filter, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion } from "@/components/ui/accordion"
import { ImportState, Override, Group, Subgroup } from "../core/types"
import { resolveCategory } from "../core/overrides"
import { getIncludedGroups } from "../core/filters"
import { cn } from "@/lib/utils"
import { ReviewResult } from "./csv-import-wizard"
import { WizardShell } from "./wizard-shell"
import { MacroSection } from "@/components/patterns/macro-section"

// Sub-components
import {
    ReviewAdvice,
    ThresholdSlider,
    MerchantGroupCard
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
    const [overrides, setOverrides] = useState<Override[]>(initialOverrides)

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
    const parseErrorsCount = initialState.errors.length

    const groupsByDirection = useMemo(() => {
        const expenses: Group[] = []
        const incomes: Group[] = []
        const mixed: Group[] = []

        filteredGroups.forEach((group) => {
            let hasIncome = false
            let hasExpense = false

            for (const subgroup of group.subgroups) {
                for (const rowId of subgroup.rowIds) {
                    const row = rows.find(r => r.id === rowId)
                    if (!row) continue
                    if (row.amountCents > 0) hasIncome = true
                    if (row.amountCents < 0) hasExpense = true
                    if (hasIncome && hasExpense) break
                }
                if (hasIncome && hasExpense) break
            }

            if (hasIncome && hasExpense) mixed.push(group)
            else if (hasIncome) incomes.push(group)
            else expenses.push(group)
        })

        return { expenses, incomes, mixed }
    }, [filteredGroups, rows])

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
    // Stats (Memoized)
    // ============================================

    const stats = useMemo(() => {
        let assigned = 0
        let total = 0

        filteredGroups.forEach((g: Group) => {
            g.subgroups.forEach((sg: Subgroup) => {
                sg.rowIds.forEach((rid: string) => {
                    const row = rows.find(r => r.id === rid)
                    if (row && row.isSelected) {
                        total++
                        const catId = resolveCategory(row, sg, g, overrides)

                        if (catId) {
                            assigned++
                        }
                    }
                })
            })
        })

        return { assigned, total }
    }, [filteredGroups, rows, overrides])

    const completionPercent = stats.total > 0 ? (stats.assigned / stats.total) * 100 : 0
    const getRowById = (id: string) => rows.find(r => r.id === id)

    // ============================================
    // Render Helpers
    // ============================================

    const footer = (
        <div className="flex w-full justify-between items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="h-12 px-5 gap-1.5 text-sm">
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
                        "gap-1.5 rounded-xl px-6 h-12 shadow-lg hover:translate-y-[-1px] transition-all text-sm",
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

                {parseErrorsCount > 0 && (
                    <div className="rounded-xl border border-amber-300/50 bg-amber-50/60 dark:bg-amber-950/20 p-3 text-amber-900 dark:text-amber-200">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <div className="text-xs md:text-sm">
                                Ho rilevato <strong>{parseErrorsCount}</strong> righe non importabili nel CSV.
                                Le transazioni valide sono già pronte qui sotto.
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <MacroSection contentClassName="p-0">
                    {filteredGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Filter className="h-10 w-10 text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground text-sm">Nessun gruppo sopra la soglia selezionata</p>
                            <Button variant="ghost" size="sm" className="mt-2" onClick={() => onThresholdChange(0)}>
                                Mostra tutti
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {groupsByDirection.expenses.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                                            Uscite
                                        </h4>
                                        <span className="text-xs text-muted-foreground">{groupsByDirection.expenses.length} gruppi</span>
                                    </div>
                                    <Accordion type="multiple" className="space-y-2">
                                        {groupsByDirection.expenses.map((group, index) => {
                                            const firstGroupRowId = group.subgroups[0]?.rowIds[0]
                                            const firstGroupRow = firstGroupRowId ? rows.find(r => r.id === firstGroupRowId) : undefined
                                            const effectiveCatId = getGroupEffectiveCategory(group) ||
                                                group.subgroups[0]?.categoryId ||
                                                firstGroupRow?.suggestedCategoryId

                                            return (
                                                <MerchantGroupCard
                                                    key={group.id}
                                                    group={group}
                                                    index={index}
                                                    totalGroups={groupsByDirection.expenses.length}
                                                    effectiveCategoryId={effectiveCatId || null}
                                                    onGroupCategoryChange={setGroupCategory}
                                                    onSubgroupCategoryChange={setSubgroupCategory}
                                                    getSubgroupEffectiveCategory={(sg) => getSubgroupEffectiveCategory(sg, group)}
                                                    getRowById={getRowById}
                                                />
                                            )
                                        })}
                                    </Accordion>
                                </div>
                            )}

                            {groupsByDirection.incomes.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                                            Entrate
                                        </h4>
                                        <span className="text-xs text-muted-foreground">{groupsByDirection.incomes.length} gruppi</span>
                                    </div>
                                    <Accordion type="multiple" className="space-y-2">
                                        {groupsByDirection.incomes.map((group, index) => {
                                            const firstGroupRowId = group.subgroups[0]?.rowIds[0]
                                            const firstGroupRow = firstGroupRowId ? rows.find(r => r.id === firstGroupRowId) : undefined
                                            const effectiveCatId = getGroupEffectiveCategory(group) ||
                                                group.subgroups[0]?.categoryId ||
                                                firstGroupRow?.suggestedCategoryId

                                            return (
                                                <MerchantGroupCard
                                                    key={group.id}
                                                    group={group}
                                                    index={index}
                                                    totalGroups={groupsByDirection.incomes.length}
                                                    effectiveCategoryId={effectiveCatId || null}
                                                    onGroupCategoryChange={setGroupCategory}
                                                    onSubgroupCategoryChange={setSubgroupCategory}
                                                    getSubgroupEffectiveCategory={(sg) => getSubgroupEffectiveCategory(sg, group)}
                                                    getRowById={getRowById}
                                                />
                                            )
                                        })}
                                    </Accordion>
                                </div>
                            )}

                            {groupsByDirection.mixed.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                                            Misti
                                        </h4>
                                        <span className="text-xs text-muted-foreground">{groupsByDirection.mixed.length} gruppi</span>
                                    </div>
                                    <Accordion type="multiple" className="space-y-2">
                                        {groupsByDirection.mixed.map((group, index) => {
                                            const firstGroupRowId = group.subgroups[0]?.rowIds[0]
                                            const firstGroupRow = firstGroupRowId ? rows.find(r => r.id === firstGroupRowId) : undefined
                                            const effectiveCatId = getGroupEffectiveCategory(group) ||
                                                group.subgroups[0]?.categoryId ||
                                                firstGroupRow?.suggestedCategoryId

                                            return (
                                                <MerchantGroupCard
                                                    key={group.id}
                                                    group={group}
                                                    index={index}
                                                    totalGroups={groupsByDirection.mixed.length}
                                                    effectiveCategoryId={effectiveCatId || null}
                                                    onGroupCategoryChange={setGroupCategory}
                                                    onSubgroupCategoryChange={setSubgroupCategory}
                                                    getSubgroupEffectiveCategory={(sg) => getSubgroupEffectiveCategory(sg, group)}
                                                    getRowById={getRowById}
                                                />
                                            )
                                        })}
                                    </Accordion>
                                </div>
                            )}
                        </div>
                    )}
                </MacroSection>
            </div>
        </WizardShell>
    )
}
