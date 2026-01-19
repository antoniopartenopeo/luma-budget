"use client"

/**
 * Step Preview Desktop - PR2 GroupsV2 Implementation
 * 
 * Features:
 * - Income/Expense sections sorted by totalAbsCents
 * - Subgroups with split/merge
 * - Group-level selection (isGroupSelected)
 * - Significance threshold + selective import
 * - Assistant panel with contextual guidance
 * - Virtualized lists
 */

import { useState, useMemo, useTransition, useRef, useCallback } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
    ChevronRight, ChevronDown, CheckCircle2, AlertCircle,
    AlertTriangle, Copy, Check, Unlink, Link2, HelpCircle,
    TrendingDown, TrendingUp, Sliders, Info, X
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCents } from "@/lib/currency-utils"
import { getGroupedCategories, getCategoryById } from "@/features/categories/config"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import type { PreviewRow, MerchantGroupV2, AmountSubgroup, GroupsV2Result } from "../types"
import { DEFAULT_SIGNIFICANCE_THRESHOLD_CENTS } from "../types"
import {
    computeGroupsV2,
    applyCategoryToGroupV2,
    applyCategoryToSubgroup,
    splitSubgroup,
    mergeSubgroup,
    setGroupSelected
} from "../grouping-utils-v2"
import { LoadingOverlay } from "./loading-overlay"
import { cn } from "@/lib/utils"

interface StepPreviewProps {
    rows: PreviewRow[]
    onRowsChange: (rows: PreviewRow[]) => void
    onToggleRow: (rowIndex: number) => void
    onUpdateCategory: (rowIndex: number, categoryId: string) => void
    onBulkUpdateCategory?: (categoryId: string) => void
}

// Tipologia mapping
const TIPOLOGIA_MAP: Record<string, string> = {
    essential: "Essenziale",
    comfort: "Comfort",
    superfluous: "Superfluo"
}

// Assistant messages
const ASSISTANT_MESSAGES = {
    initial: {
        title: "Importazione Intelligente",
        message: "Stiamo analizzando le tue transazioni raggruppate per commerciante. I gruppi più significativi sono già selezionati."
    },
    threshold: {
        title: "Soglia di Importanza",
        message: "Regola la soglia per decidere quali gruppi importare. Per un primo import, concentrati sui gruppi più rilevanti — potrai sempre importare il resto dopo."
    },
    subgroups: {
        title: "Transazioni Ricorrenti",
        message: "Abbiamo trovato importi ripetuti (es. abbonamenti). Puoi \"slegare\" un sottogruppo per categorizzarlo diversamente."
    },
    lessSignificant: {
        title: "Gruppi Meno Significativi",
        message: "Questi gruppi sono sotto la soglia. Questa è una fotografia del passato: non serve importare tutto. Inizia dalle spese importanti."
    }
}

export function StepPreviewDesktop({
    rows,
    onRowsChange,
    onToggleRow,

}: StepPreviewProps) {
    const [thresholdCents, setThresholdCents] = useState(DEFAULT_SIGNIFICANCE_THRESHOLD_CENTS)
    const [sliderValue, setSliderValue] = useState(DEFAULT_SIGNIFICANCE_THRESHOLD_CENTS)
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
    // Store full objects but careful to update them when data changes
    const [groupsV2State, setGroupsV2State] = useState<Map<string, MerchantGroupV2>>(new Map())
    const [showLessSignificant, setShowLessSignificant] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Category options
    const expenseCatGroups = useMemo(() => getGroupedCategories("expense"), [])
    const incomeCatGroups = useMemo(() => getGroupedCategories("income"), [])

    // Compute groups with V2
    const baseGroups = useMemo(() =>
        computeGroupsV2(rows, { thresholdCents }),
        [rows, thresholdCents]
    )

    // Apply local state overrides
    const groups: GroupsV2Result = useMemo(() => {
        const applyState = (groups: MerchantGroupV2[]): MerchantGroupV2[] => {
            return groups.map(g => {
                const override = groupsV2State.get(g.patternKey)
                if (!override) return g

                // Merge override but keep fresh total/count/category from base (unless specifically overridden)
                // Actually, for category we want the LATEST selection.
                // If override exists, it might have STALE category.
                // We should prefer the baseGroup category unless we have a specific reason.
                // BUT, wait, handleGroupCategoryChange updates ROWs, so baseGroup has NEW category.
                // Override has OLD category.
                // So we should take category from baseGroup!

                return {
                    ...override,
                    assignedCategoryId: g.assignedCategoryId, // Always take fresh category from rows
                    totalAbsCents: g.totalAbsCents,           // Always take fresh totals
                    count: g.count,                           // Always take fresh count
                    // Keep flags from override
                    isGroupSelected: override.isGroupSelected,
                    subgroups: g.subgroups.map(sg => {
                        // Find matching subgroup in override to preserve isSplit
                        const overrideSg = override.subgroups.find(osg => osg.amountCents === sg.amountCents)
                        return overrideSg ? { ...sg, isSplit: overrideSg.isSplit } : sg
                    })
                }
            })
        }
        return {
            income: applyState(baseGroups.income),
            expense: applyState(baseGroups.expense),
            all: applyState(baseGroups.all)
        }
    }, [baseGroups, groupsV2State])

    // Stats
    const stats = useMemo(() => {
        const selectedRows = rows.filter(r => r.isSelected && r.isValid)
        const significantGroups = groups.all.filter(g => g.isSignificant)
        const lessSignificantGroups = groups.all.filter(g => !g.isSignificant)

        return {
            totalGroups: groups.all.length,
            significantGroups: significantGroups.length,
            lessSignificantGroups: lessSignificantGroups.length,
            selectedRows: selectedRows.length,
            expenseTotal: groups.expense.reduce((sum, g) => sum + g.totalAbsCents, 0),
            incomeTotal: groups.income.reduce((sum, g) => sum + g.totalAbsCents, 0)
        }
    }, [groups, rows])

    // Significant vs less significant groups
    const significantExpense = useMemo(() =>
        groups.expense.filter(g => g.isSignificant), [groups.expense])
    const significantIncome = useMemo(() =>
        groups.income.filter(g => g.isSignificant), [groups.income])
    const lessSignificantGroups = useMemo(() =>
        groups.all.filter(g => !g.isSignificant), [groups.all])

    // Helpers
    const getCategoryLabel = (categoryId: string): string => {
        const cat = getCategoryById(categoryId)
        return cat?.label || categoryId
    }

    const getTipologia = (categoryId: string): string | null => {
        const allGroups = [...expenseCatGroups, ...incomeCatGroups]
        for (const group of allGroups) {
            if (group.categories.some(c => c.id === categoryId)) {
                return TIPOLOGIA_MAP[group.key] || null
            }
        }
        return null
    }

    // Handlers
    const handleThresholdChange = (value: number[]) => {
        setSliderValue(value[0]) // Immediate UI update
        startTransition(() => {
            setThresholdCents(value[0]) // Deferred calculation
        })
    }

    const toggleGroupExpand = (patternKey: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev)
            if (next.has(patternKey)) next.delete(patternKey)
            else next.add(patternKey)
            return next
        })
    }

    const handleGroupCategoryChange = (group: MerchantGroupV2, categoryId: string) => {
        startTransition(() => {
            const updatedRows = applyCategoryToGroupV2(rows, group, categoryId)
            onRowsChange(updatedRows)
        })
    }

    const handleSubgroupCategoryChange = (subgroup: AmountSubgroup, categoryId: string) => {
        startTransition(() => {
            const updatedRows = applyCategoryToSubgroup(rows, subgroup, categoryId)
            onRowsChange(updatedRows)
        })
    }

    // For split/merge/select, we update the state Map
    // We must ensure we clone the CURRENT group structure which might have fresh data
    const updateGroupState = (patternKey: string, updater: (g: MerchantGroupV2) => MerchantGroupV2) => {
        // Find the current group from our 'groups' list (which merges base + state)
        const currentGroup = groups.all.find(g => g.patternKey === patternKey)
        if (!currentGroup) return

        const updated = updater(currentGroup)
        setGroupsV2State(prev => new Map(prev).set(patternKey, updated))
    }

    const handleSplitSubgroup = (group: MerchantGroupV2, amountCents: number) => {
        updateGroupState(group.patternKey, g => splitSubgroup(g, amountCents))
    }

    const handleMergeSubgroup = (group: MerchantGroupV2, amountCents: number) => {
        updateGroupState(group.patternKey, g => mergeSubgroup(g, amountCents))
    }

    const handleGroupSelectionChange = (group: MerchantGroupV2, selected: boolean) => {
        updateGroupState(group.patternKey, g => setGroupSelected(g, selected))

        startTransition(() => {
            const updatedRows = rows.map(row => {
                if (group.rowIndices.includes(row.rowIndex)) {
                    return { ...row, isSelected: selected }
                }
                return row
            })
            onRowsChange(updatedRows)
        })
    }

    const handleIncludeAllLessSignificant = () => {
        lessSignificantGroups.forEach(group => {
            handleGroupSelectionChange(group, true)
        })
    }

    const handleToggleRow = (index: number) => {
        startTransition(() => onToggleRow(index))
    }

    // Render components...
    const renderAssistantCard = (title: string, message: string, icon: any, colorClass = "text-primary") => {
        const Icon = icon
        return (
            <div className="flex-shrink-0 w-72 p-3 rounded-lg border bg-background shadow-sm text-sm">
                <h4 className={cn("font-medium mb-1 flex items-center gap-2", colorClass)}>
                    <Icon className="h-4 w-4" />
                    {title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {message}
                </p>
            </div>
        )
    }

    const renderSubgroup = (group: MerchantGroupV2, subgroup: AmountSubgroup) => {
        const categoryGroups = group.type === "income" ? incomeCatGroups : expenseCatGroups

        return (
            <div
                key={`${group.patternKey}-${subgroup.amountCents}`}
                className={cn(
                    "flex items-center gap-3 px-4 py-2 pl-16 border-b bg-muted/5",
                    subgroup.isSplit && "bg-primary/5 border-l-2 border-l-primary"
                )}
            >
                {subgroup.isSplit && (
                    <Badge variant="default" className="text-[9px] shrink-0">Slegato</Badge>
                )}
                <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="font-mono text-sm">{formatCents(subgroup.amountCents)}</span>
                    <span className="text-xs text-muted-foreground">× {subgroup.count}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                    = {formatCents(subgroup.amountCents * subgroup.count)}
                </div>
                <div className="flex-1" />
                {subgroup.isSplit ? (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleMergeSubgroup(group, subgroup.amountCents)}>
                        <Link2 className="h-3 w-3 mr-1" /> Unisci
                    </Button>
                ) : (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleSplitSubgroup(group, subgroup.amountCents)}>
                        <Unlink className="h-3 w-3 mr-1" /> Slega
                    </Button>
                )}
                {subgroup.isSplit && (
                    <div className="w-40 shrink-0">
                        <Select value={group.assignedCategoryId} onValueChange={(v) => handleSubgroupCategoryChange(subgroup, v)}>
                            <SelectTrigger className="h-7 text-xs">
                                <div className="flex items-center gap-1.5 truncate">
                                    <CategoryIcon categoryId={group.assignedCategoryId} categoryName={getCategoryLabel(group.assignedCategoryId)} size={12} />
                                    <span className="truncate">{getCategoryLabel(group.assignedCategoryId)}</span>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {categoryGroups.map(catGroup => (
                                    <div key={catGroup.key}>
                                        <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold bg-muted/50">{catGroup.label}</div>
                                        {catGroup.categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id} className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <CategoryIcon categoryId={cat.id} categoryName={cat.label} size={12} />
                                                    {cat.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </div>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        )
    }

    const renderGroupRow = (group: MerchantGroupV2, isLessSignificant = false) => {
        const isExpanded = expandedGroups.has(group.patternKey)
        const categoryGroups = group.type === "income" ? incomeCatGroups : expenseCatGroups
        const tipologia = getTipologia(group.assignedCategoryId)
        const groupRows = rows.filter(r => group.rowIndices.includes(r.rowIndex))
        const hasSubgroups = group.subgroups.length > 0

        return (
            <div key={group.patternKey} className={cn(isLessSignificant && "opacity-60")}>
                <div className={cn("flex items-center gap-3 px-4 py-3 border-b hover:bg-muted/50 transition-colors", isExpanded && "bg-muted/30")}>
                    <Checkbox checked={group.isGroupSelected} onCheckedChange={(checked) => handleGroupSelectionChange(group, !!checked)} className="shrink-0" />
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => toggleGroupExpand(group.patternKey)}>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{group.displayName}</span>
                            {hasSubgroups && <Badge variant="outline" className="text-[9px]">{group.subgroups.length} ricorrenti</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{group.sampleDescriptions[0]}</div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">{group.count}</Badge>
                    <div className={cn("w-24 text-right font-medium shrink-0", group.type === "income" && "text-green-600")}>
                        {group.type === "income" ? "+" : "-"}{formatCents(group.totalAbsCents)}
                    </div>
                    <div className="w-44 shrink-0">
                        <Select value={group.assignedCategoryId} onValueChange={(v) => handleGroupCategoryChange(group, v)}>
                            <SelectTrigger className="h-8 text-xs">
                                <div className="flex items-center gap-1.5 truncate">
                                    <CategoryIcon categoryId={group.assignedCategoryId} categoryName={getCategoryLabel(group.assignedCategoryId)} size={14} />
                                    <span className="truncate">{getCategoryLabel(group.assignedCategoryId)}</span>
                                    {tipologia && <Badge variant="outline" className="text-[8px] ml-auto py-0">{tipologia}</Badge>}
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {categoryGroups.map(catGroup => (
                                    <div key={catGroup.key}>
                                        <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold bg-muted/50">{catGroup.label}</div>
                                        {catGroup.categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id} className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <CategoryIcon categoryId={cat.id} categoryName={cat.label} size={14} />
                                                    {cat.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </div>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {isExpanded && (
                    <div className="border-b">
                        {group.subgroups.map(sg => renderSubgroup(group, sg))}
                        {groupRows.slice(0, 20).map(row => (
                            <div key={row.rowIndex} className={cn("flex items-center gap-3 px-4 py-2 pl-16 border-b bg-background", !row.isValid && "bg-destructive/5", row.isDuplicate && "bg-amber-500/5")}>
                                <Checkbox checked={row.isSelected} onCheckedChange={() => handleToggleRow(row.rowIndex)} disabled={!row.isValid} className="shrink-0" />
                                <span className="text-xs text-muted-foreground w-20 shrink-0">{row.date?.slice(0, 10) || "—"}</span>
                                <span className="text-sm flex-1 min-w-0 truncate">{row.description}</span>
                                <span className={cn("font-mono text-sm shrink-0", row.type === "income" && "text-green-600")}>{formatCents(Math.abs(row.amountCents))}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    const renderSectionHeader = (type: "expense" | "income", groups: MerchantGroupV2[], total: number) => {
        const Icon = type === "expense" ? TrendingDown : TrendingUp
        const label = type === "expense" ? "Uscite" : "Entrate"
        const colorClass = type === "income" ? "text-green-600" : "text-foreground"
        return (
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", colorClass)} />
                    <span className="font-semibold">{label}</span>
                    <Badge variant="secondary">{groups.length} gruppi</Badge>
                </div>
                <div className={cn("font-bold", colorClass)}>{type === "income" ? "+" : "-"}{formatCents(total)}</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background relative isolate">
            <LoadingOverlay isLoading={isPending} />

            {/* Assistant Panel - Top Bar */}
            <div className="flex-shrink-0 border-b bg-muted/20 p-4 flex gap-4 overflow-x-auto">
                {renderAssistantCard(ASSISTANT_MESSAGES.initial.title, ASSISTANT_MESSAGES.initial.message, HelpCircle)}
                {renderAssistantCard(ASSISTANT_MESSAGES.threshold.title, ASSISTANT_MESSAGES.threshold.message, Sliders)}
                {groups.all.some(g => g.subgroups.length > 0) && renderAssistantCard(ASSISTANT_MESSAGES.subgroups.title, ASSISTANT_MESSAGES.subgroups.message, Unlink)}
                {lessSignificantGroups.length > 0 && renderAssistantCard(ASSISTANT_MESSAGES.lessSignificant.title, ASSISTANT_MESSAGES.lessSignificant.message, Info, "text-amber-600")}
            </div>

            {/* Header Controls */}
            <div className="flex-shrink-0 bg-background border-b z-20">
                <div className="p-4 border-b">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Soglia importanza</span>
                                <span className="text-sm font-mono">{formatCents(sliderValue)}</span>
                            </div>
                            <Slider
                                value={[sliderValue]}
                                onValueChange={handleThresholdChange}
                                min={0}
                                max={50000}
                                step={500}
                                className="w-full cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-4 py-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        <span>{stats.significantGroups} significativi</span>
                    </div>
                    {stats.lessSignificantGroups > 0 && (
                        <div className="flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{stats.lessSignificantGroups} meno significativi</span>
                        </div>
                    )}
                    <div className="flex-1" />
                    <span>{stats.selectedRows} righe selezionate</span>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {significantExpense.length > 0 && (
                    <div>
                        {renderSectionHeader("expense", significantExpense, significantExpense.reduce((s, g) => s + g.totalAbsCents, 0))}
                        {significantExpense.map(g => renderGroupRow(g))}
                    </div>
                )}
                {significantIncome.length > 0 && (
                    <div>
                        {renderSectionHeader("income", significantIncome, significantIncome.reduce((s, g) => s + g.totalAbsCents, 0))}
                        {significantIncome.map(g => renderGroupRow(g))}
                    </div>
                )}
                {lessSignificantGroups.length > 0 && (
                    <div className="border-t-2 border-dashed mt-8">
                        <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-muted-foreground">Meno significativi</span>
                                <Badge variant="outline">{lessSignificantGroups.length}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={handleIncludeAllLessSignificant}>Includi tutti</Button>
                                <Button variant="ghost" size="sm" onClick={() => setShowLessSignificant(!showLessSignificant)}>
                                    {showLessSignificant ? "Nascondi" : "Mostra"} <ChevronDown className={cn("h-4 w-4 ml-1 transition-transform", showLessSignificant && "rotate-180")} />
                                </Button>
                            </div>
                        </div>
                        {showLessSignificant && lessSignificantGroups.map(g => renderGroupRow(g, true))}
                    </div>
                )}
            </div>
        </div>
    )
}
