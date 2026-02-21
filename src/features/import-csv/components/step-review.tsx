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

// Sub-components
import {
    ThresholdSlider,
    MerchantGroupCard,
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
    const rowsById = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows])

    // Use shared filter function for consistency with step-summary
    const { includedGroups: filteredGroups, excludedGroupIds } = useMemo(
        () => getIncludedGroups(groups, thresholdCents),
        [groups, thresholdCents]
    )

    const hiddenGroupsCount = excludedGroupIds.length
    const parseErrorsCount = initialState.summary.parseErrors.length

    const importVisibility = useMemo(() => {
        let duplicatesConfirmed = 0
        let duplicatesSuspected = 0

        rows.forEach((row) => {
            if (row.duplicateStatus === "confirmed") duplicatesConfirmed++
            if (row.duplicateStatus === "suspected") duplicatesSuspected++
        })

        return {
            totalValidRows: initialState.summary.totalRows,
            importableRows: initialState.summary.selectedRows,
            duplicatesTotal: duplicatesConfirmed + duplicatesSuspected,
            duplicatesConfirmed,
            duplicatesSuspected
        }
    }, [rows, initialState.summary.totalRows, initialState.summary.selectedRows])

    const groupsByDirection = useMemo(() => {
        const expenses: Group[] = []
        const incomes: Group[] = []
        const mixed: Group[] = []

        filteredGroups.forEach((group) => {
            let hasIncome = false
            let hasExpense = false

            for (const subgroup of group.subgroups) {
                for (const rowId of subgroup.rowIds) {
                    const row = rowsById.get(rowId)
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
    }, [filteredGroups, rowsById])

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
                    const row = rowsById.get(rid)
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
    }, [filteredGroups, rowsById, overrides])

    const getRowById = (id: string) => rowsById.get(id)
    const getGroupSuggestedCategory = (group: Group) => {
        const firstGroupRowId = group.subgroups[0]?.rowIds[0]
        const firstGroupRow = firstGroupRowId ? rowsById.get(firstGroupRowId) : undefined
        return getGroupEffectiveCategory(group) || group.subgroups[0]?.categoryId || firstGroupRow?.suggestedCategoryId || null
    }

    const directionSections = [
        { key: "expenses", title: "Uscite", groups: groupsByDirection.expenses },
        { key: "incomes", title: "Entrate", groups: groupsByDirection.incomes },
        { key: "mixed", title: "Misti", groups: groupsByDirection.mixed },
    ] as const

    // ============================================
    // Render Helpers
    // ============================================

    const footer = (
        <div className="flex w-full justify-between items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="h-12 px-5 gap-1.5 text-sm">
                <ArrowLeft className="h-4 w-4" /> Indietro
            </Button>
            <Button
                onClick={() => onContinue({ overrides, excludedGroupIds })}
                className={cn(
                    "h-12 gap-1.5 rounded-xl px-6 text-sm shadow-lg transition-all hover:-translate-y-[1px]",
                    stats.total > stats.assigned && "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200"
                )}
                variant={stats.total > stats.assigned ? "outline" : "default"}
            >
                Continua
                <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    )

    // ============================================
    // Main Render
    // ============================================

    return (
        <WizardShell
            title="Controlla i movimenti"
            subtitle="Rivedi gruppi e categorie prima del salvataggio."
            step="review"
            footer={footer}
        >
            <div className="space-y-5">
                <section className="space-y-3 rounded-xl border border-border/60 bg-muted/10 p-4">
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

                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-lg border border-border/60 bg-background/50 px-3 py-2.5">
                            <div className="text-xs font-medium text-muted-foreground">Righe valide</div>
                            <div className="text-xl font-semibold tabular-nums">{importVisibility.totalValidRows}</div>
                        </div>
                        <div className="rounded-lg border border-emerald-500/20 bg-background/50 px-3 py-2.5">
                            <div className="text-xs font-medium text-muted-foreground">Pronte da aggiungere</div>
                            <div className="text-xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">{importVisibility.importableRows}</div>
                        </div>
                        <div className="rounded-lg border border-amber-500/20 bg-background/50 px-3 py-2.5">
                            <div className="text-xs font-medium text-muted-foreground">Duplicati esclusi</div>
                            <div className="text-xl font-semibold tabular-nums text-amber-700 dark:text-amber-300">{importVisibility.duplicatesTotal}</div>
                            {importVisibility.duplicatesTotal > 0 && (
                                <div className="text-xs text-muted-foreground">
                                    {importVisibility.duplicatesConfirmed} certi + {importVisibility.duplicatesSuspected} sospetti
                                </div>
                            )}
                        </div>
                        <div className="rounded-lg border border-rose-500/20 bg-background/50 px-3 py-2.5">
                            <div className="text-xs font-medium text-muted-foreground">Righe non leggibili</div>
                            <div className="text-xl font-semibold tabular-nums text-rose-700 dark:text-rose-300">{parseErrorsCount}</div>
                        </div>
                    </div>
                </section>

                {parseErrorsCount > 0 && (
                    <div className="rounded-xl border border-amber-300/50 bg-amber-50/60 dark:bg-amber-950/20 p-3 text-amber-900 dark:text-amber-200">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <div className="text-xs md:text-sm">
                                Ho trovato <strong>{parseErrorsCount}</strong> righe non leggibili nel file.
                                I movimenti validi sono già pronti qui sotto.
                            </div>
                        </div>
                    </div>
                )}

                {filteredGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Filter className="h-10 w-10 text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground text-sm">Con il filtro attuale non vedo gruppi disponibili</p>
                        <Button variant="ghost" size="sm" className="mt-2" onClick={() => onThresholdChange(0)}>
                            Mostra tutti
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {directionSections.map((section) => (
                            section.groups.length > 0 ? (
                                <div key={section.key} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-base font-semibold text-foreground">
                                            {section.title}
                                        </h4>
                                        <span className="text-xs text-muted-foreground">{section.groups.length} gruppi</span>
                                    </div>
                                    <Accordion type="multiple" className="space-y-2">
                                        {section.groups.map((group, index) => (
                                            <MerchantGroupCard
                                                key={group.id}
                                                group={group}
                                                index={index}
                                                totalGroups={section.groups.length}
                                                effectiveCategoryId={getGroupSuggestedCategory(group)}
                                                onGroupCategoryChange={setGroupCategory}
                                                onSubgroupCategoryChange={setSubgroupCategory}
                                                getSubgroupEffectiveCategory={(sg) => getSubgroupEffectiveCategory(sg, group)}
                                                getRowById={getRowById}
                                            />
                                        ))}
                                    </Accordion>
                                </div>
                            ) : null
                        ))}
                    </div>
                )}
            </div>
        </WizardShell>
    )
}
