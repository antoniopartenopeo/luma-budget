"use client"

import { useMemo } from "react"
import {
    ChevronRight, ChevronDown, CheckCircle2, AlertCircle,
    Unlink, Link2, HelpCircle, TrendingDown, TrendingUp, Sliders, Info, X
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { formatCents } from "@/lib/currency-utils"
import { getGroupedCategories, getCategoryById } from "@/features/categories/config"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { LoadingOverlay } from "./loading-overlay"
import { cn } from "@/lib/utils"
// Import Types
import type { PreviewRow, MerchantGroupV2, AmountSubgroup } from "../types"
// Import Logic Hook
import { useImportPreviewLogic } from "../hooks/use-import-preview-logic"

interface StepPreviewProps {
    rows: PreviewRow[]
    onRowsChange: (rows: PreviewRow[]) => void
    onToggleRow: (rowIndex: number) => void
    onUpdateCategory: (rowIndex: number, categoryId: string) => void
    onBulkUpdateCategory?: (categoryId: string) => void
}

// Tipologia
const TIPOLOGIA_MAP: Record<string, string> = {
    essential: "Essenziale",
    comfort: "Comfort",
    superfluous: "Superfluo"
}

// Assistant
const ASSISTANT_MESSAGES = {
    initial: {
        title: "Importazione Intelligente",
        message: "Stiamo analizzando le tue transazioni raggruppate per commerciante. I gruppi più significativi sono già selezionati."
    },
    threshold: {
        title: "Soglia di Importanza",
        message: "Regola la soglia. Per un primo import, concentrati sui gruppi più rilevanti — potrai sempre importare il resto dopo."
    },
    subgroups: {
        title: "Transazioni Ricorrenti",
        message: "Abbiamo trovato importi ripetuti (es. abbonamenti). Puoi \"slegare\" un sottogruppo per categorizzarlo diversamente."
    },
    lessSignificant: {
        title: "Gruppi Meno Significativi",
        message: "Questi gruppi sono sotto la soglia. Questa è una fotografia del passato: non serve importare tutto."
    }
}

export function StepPreviewResponsive(props: StepPreviewProps) {
    const logic = useImportPreviewLogic(props.rows, props.onRowsChange, props.onToggleRow)
    const {
        thresholdCents, sliderValue, groups, selectedGroup, expandedGroups, stats, isPending,
        setSliderValue, commitThreshold, toggleExpand, selectGroup,
        updateGroupCategory, updateSubgroupCategory, splitSubgroupAction, mergeSubgroupAction,
        toggleGroupSelection, handleIncludeAllLessSignificant, toggleRow
    } = logic

    // Config categories
    const expenseCatGroups = useMemo(() => getGroupedCategories("expense"), [])
    const incomeCatGroups = useMemo(() => getGroupedCategories("income"), [])

    const getCategoryLabel = (categoryId: string) => getCategoryById(categoryId)?.label || categoryId
    const getTipologia = (categoryId: string) => {
        const allGroups = [...expenseCatGroups, ...incomeCatGroups]
        for (const g of allGroups) {
            if (g.categories.some(c => c.id === categoryId)) return TIPOLOGIA_MAP[g.key]
        }
        return null
    }

    // --- Renderers ---

    // Assistant Card
    const renderAssistantCard = (title: string, message: string, icon: React.ElementType, colorClass = "text-primary") => {
        const Icon = icon
        return (
            <div className="flex-shrink-0 p-3 rounded-lg border bg-background shadow-sm text-sm">
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

    // Subgroup Row
    const renderSubgroup = (group: MerchantGroupV2, subgroup: AmountSubgroup) => {
        // Prepare options
        const categoryGroups = group.type === "income" ? incomeCatGroups : expenseCatGroups

        // --- fix: derived category ---
        const firstRow = props.rows[subgroup.rowIndices[0]]
        const currentCategoryId = firstRow?.selectedCategoryId || group.assignedCategoryId

        return (
            <div
                key={`${group.patternKey}-${subgroup.amountCents}`}
                className={cn(
                    "flex items-center gap-3 px-4 py-2 pl-12 md:pl-16 border-b bg-muted/5",
                    subgroup.isSplit && "bg-primary/5 border-l-2 border-l-primary"
                )}
            >
                {subgroup.isSplit && <Badge variant="default" className="text-[9px] shrink-0">Slegato</Badge>}
                <div className="flex items-center gap-2 min-w-[100px] md:min-w-[120px]">
                    <span className="font-mono text-sm">{formatCents(subgroup.amountCents)}</span>
                    <span className="text-xs text-muted-foreground">× {subgroup.count}</span>
                </div>
                {/* Desktop: Total */}
                <div className="hidden md:block text-sm text-muted-foreground">
                    = {formatCents(subgroup.amountCents * subgroup.count)}
                </div>

                <div className="flex-1" />

                {/* Split/Merge Action */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => subgroup.isSplit ? mergeSubgroupAction(group, subgroup.amountCents) : splitSubgroupAction(group, subgroup.amountCents)}
                >
                    {subgroup.isSplit ? <Link2 className="h-3 w-3 mr-1" /> : <Unlink className="h-3 w-3 mr-1" />}
                    {subgroup.isSplit ? "Unisci" : "Slega"}
                </Button>

                {/* Subgroup Category Select (only if split) */}
                {subgroup.isSplit && (
                    <div className="w-32 md:w-40 shrink-0">
                        <Select
                            key={`${subgroup.amountCents}-${currentCategoryId}`} // Force re-render
                            value={currentCategoryId}
                            onValueChange={(v) => updateSubgroupCategory(subgroup, v)}
                        >
                            <SelectTrigger className="h-7 text-xs">
                                <div className="flex items-center gap-1.5 truncate">
                                    <CategoryIcon categoryId={currentCategoryId} categoryName={getCategoryLabel(currentCategoryId)} size={12} />
                                    <span className="truncate">{getCategoryLabel(currentCategoryId)}</span>
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

    // Main Group Row
    const renderGroupRow = (group: MerchantGroupV2, isLessSignificant = false) => {
        const isExpanded = expandedGroups.has(group.patternKey)
        const categoryGroups = group.type === "income" ? incomeCatGroups : expenseCatGroups
        const tipologia = getTipologia(group.assignedCategoryId)
        const activeCategory = getCategoryLabel(group.assignedCategoryId)

        return (
            <div key={group.patternKey} className={cn("group transition-colors", isLessSignificant && "opacity-60")}>
                <div
                    className={cn(
                        "flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 border-b hover:bg-muted/50 cursor-pointer",
                        isExpanded && "bg-muted/30"
                    )}
                    onClick={() => {
                        // Desktop: Select for side panel. Mobile: Select for sheet
                        selectGroup(group)
                    }}
                >
                    {/* Checkbox (stop propagation) */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={group.isGroupSelected} onCheckedChange={(c) => toggleGroupSelection(group, !!c)} className="shrink-0" />
                    </div>

                    {/* Expand Toggle (stop propagation) */}
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 md:hidden" onClick={(e) => { e.stopPropagation(); toggleExpand(group.patternKey) }}>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hidden md:flex" onClick={(e) => { e.stopPropagation(); toggleExpand(group.patternKey) }}>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>

                    {/* Name & Count */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm md:text-base truncate">{group.displayName}</span>
                            {group.subgroups.length > 0 && <Badge variant="outline" className="text-[9px] px-1 md:hidden">Recurring</Badge>}
                            {group.subgroups.length > 0 && <Badge variant="outline" className="text-[9px] px-1 hidden md:flex">{group.subgroups.length} ricorrenti</Badge>}
                        </div>
                        <div className="hidden md:block text-xs text-muted-foreground line-clamp-1">{group.sampleDescriptions[0]}</div>
                    </div>

                    <Badge variant="secondary" className="shrink-0">{group.count}</Badge>

                    {/* Amount */}
                    <div className={cn("font-bold text-sm shrink-0 w-20 md:w-24 text-right", group.type === "income" && "text-green-600")}>
                        {group.type === "income" ? "+" : "-"}{formatCents(group.totalAbsCents)}
                    </div>

                    {/* Category Select (Desktop Only - on Mobile it's in Sheet, OR we can show it here too if space permits. Let's keep it here for unified look if width allows) */}
                    <div className="shrink-0 w-32 md:w-44 hidden sm:block" onClick={(e) => e.stopPropagation()}>
                        <Select value={group.assignedCategoryId} onValueChange={(v) => updateGroupCategory(group, v)}>
                            <SelectTrigger className="h-8 text-xs">
                                <div className="flex items-center gap-1.5 truncate">
                                    <CategoryIcon categoryId={group.assignedCategoryId} categoryName={activeCategory} size={14} />
                                    <span className="truncate">{activeCategory}</span>
                                    {tipologia && <Badge variant="outline" className="text-[8px] ml-auto py-0 hidden lg:flex">{tipologia}</Badge>}
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

                {/* Subgroups & Transactions Expansion */}
                {isExpanded && (
                    <div className="border-b">
                        {group.subgroups.map(sg => renderSubgroup(group, sg))}
                        {/* Sample rows if needed, or just let specific row toggle handle it */}
                        {props.rows.filter(r => group.rowIndices.includes(r.rowIndex)).slice(0, 10).map(row => (
                            <div key={row.rowIndex} className={cn("flex items-center gap-3 px-4 py-2 pl-12 md:pl-16 border-b bg-background", !row.isValid && "bg-destructive/5")}>
                                <Checkbox checked={row.isSelected} onCheckedChange={() => toggleRow(row.rowIndex)} disabled={!row.isValid} className="shrink-0" />
                                <span className="text-xs text-muted-foreground w-16 md:w-20 shrink-0">{row.date?.slice(0, 10)}</span>
                                <span className="text-sm flex-1 min-w-0 truncate">{row.description}</span>
                                <span className={cn("font-mono text-sm shrink-0", row.type === "income" && "text-green-600")}>{formatCents(Math.abs(row.amountCents))}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    const renderSectionHeader = (type: "expense" | "income", groupsList: MerchantGroupV2[]) => {
        if (groupsList.length === 0) return null
        const Icon = type === "expense" ? TrendingDown : TrendingUp
        const label = type === "expense" ? "Uscite" : "Entrate"
        const total = groupsList.reduce((acc, g) => acc + g.totalAbsCents, 0)
        const colorClass = type === "income" ? "text-green-600" : "text-foreground"

        return (
            <div className="border rounded-md shadow-sm bg-card/50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", colorClass)} />
                        <span className="font-semibold">{label}</span>
                        <Badge variant="secondary">{groupsList.length} gruppi</Badge>
                    </div>
                    <div className={cn("font-bold", colorClass)}>{type === "income" ? "+" : "-"}{formatCents(total)}</div>
                </div>
                <div className="divide-y">
                    {groupsList.map(g => renderGroupRow(g))}
                </div>
            </div>
        )
    }

    // --- Main Layout ---
    return (
        <div className="flex flex-col h-full bg-background relative">
            <LoadingOverlay isLoading={isPending} />

            {/* 1. Toolbar (Stats + Threshold) - Sticky */}
            <div className="flex-shrink-0 border-b bg-background z-20 sticky top-0">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Threshold Control */}
                    <div className="flex-1 min-w-0 max-w-md">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Sliders className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Soglia importanza</span>
                            </div>
                            <span className="text-sm font-mono font-bold">{formatCents(sliderValue)}</span>
                        </div>
                        <Slider
                            value={[sliderValue]}
                            onValueChange={(val) => setSliderValue(val[0])}
                            onValueCommit={(val) => commitThreshold(val[0])}
                            max={50000}
                            step={500}
                            className="cursor-pointer"
                        />
                    </div>

                    {/* Quick Stats Chips */}
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                        <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            {stats.significantGroups} rilevanti
                        </Badge>
                        {stats.lessSignificantGroups > 0 && (
                            <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-amber-900">
                                <AlertCircle className="h-3 w-3 text-amber-600" />
                                {stats.lessSignificantGroups} trascurabili
                            </Badge>
                        )}
                        <Badge variant="secondary" className="ml-auto sm:ml-0">
                            {stats.selectedRows} selezionati
                        </Badge>
                    </div>
                </div>
            </div>

            {/* 2. Main Content Area */}
            <div className="flex-1 flex min-h-0 overflow-hidden">

                {/* 2a. Left Panel: Scrollable List */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Assistant Banner (Mobile visible, Desktop hidden -> moved to side) */}
                    <div className="md:hidden border-b bg-muted/20 p-4 flex gap-3 overflow-x-auto">
                        {renderAssistantCard(ASSISTANT_MESSAGES.threshold.title, ASSISTANT_MESSAGES.threshold.message, Sliders)}
                        {/* More cards can be added here */}
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-6 overscroll-contain">
                        {renderSectionHeader("expense", groups.expense.filter(g => g.isSignificant))}
                        {renderSectionHeader("income", groups.income.filter(g => g.isSignificant))}

                        {/* Less significant toggle/section */}
                        {stats.lessSignificantGroups > 0 && (
                            <div className="border-2 border-dashed rounded-md bg-muted/20 p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-3">Ci sono {stats.lessSignificantGroups} gruppi sotto la soglia di {formatCents(thresholdCents)}.</p>
                                <Button variant="outline" size="sm" onClick={handleIncludeAllLessSignificant}>
                                    Seleziona tutti ({stats.lessSignificantGroups})
                                </Button>
                                {/* We could render them here if toggled, simplistic for now */}
                            </div>
                        )}

                        <div className="h-20" /> {/* Bottom spacer */}
                    </div>
                </div>

                {/* 2b. Right Panel: Detail & Assistant (Desktop Only) */}
                <aside className="hidden md:flex w-80 flex-col border-l bg-muted/10">
                    <div className="p-4 space-y-4 overflow-y-auto">
                        <div className="font-semibold text-sm flex items-center gap-2">
                            <HelpCircle className="h-4 w-4" />
                            Assistente Import
                        </div>
                        {renderAssistantCard(ASSISTANT_MESSAGES.initial.title, ASSISTANT_MESSAGES.initial.message, HelpCircle)}
                        {renderAssistantCard(ASSISTANT_MESSAGES.subgroups.title, ASSISTANT_MESSAGES.subgroups.message, Unlink)}

                        {selectedGroup && (
                            <div className="mt-6 border-t pt-4">
                                <h4 className="font-medium text-sm mb-2">Dettagli Gruppo</h4>
                                <div className="p-3 bg-background border rounded-md shadow-sm">
                                    <div className="font-bold truncate">{selectedGroup.displayName}</div>
                                    <div className="text-xs text-muted-foreground mt-1">Pattern: {selectedGroup.patternKey}</div>
                                    <div className="mt-2 text-sm flex justify-between">
                                        <span>Totale:</span>
                                        <span className="font-mono">{formatCents(selectedGroup.totalAbsCents)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* 3. Mobile Sheet Detail (when group selected) */}
            <Sheet open={!!selectedGroup && window.innerWidth < 768} onOpenChange={(o) => !o && selectGroup(null)}>
                <SheetContent side="bottom" className="h-[80vh] flex flex-col">
                    <SheetHeader>
                        <SheetTitle className="truncate">{selectedGroup?.displayName}</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto min-h-0 mt-4">
                        {selectedGroup && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <span className="text-sm font-medium">Totale</span>
                                    <span className={cn("font-bold font-mono", selectedGroup.type === "income" && "text-green-600")}>
                                        {formatCents(selectedGroup.totalAbsCents)}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Categoria</h4>
                                    <Select value={selectedGroup.assignedCategoryId} onValueChange={(v) => updateGroupCategory(selectedGroup, v)}>
                                        <SelectTrigger>
                                            <div className="flex items-center gap-2">
                                                <CategoryIcon categoryId={selectedGroup.assignedCategoryId} categoryName={getCategoryLabel(selectedGroup.assignedCategoryId)} />
                                                {getCategoryLabel(selectedGroup.assignedCategoryId)}
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(selectedGroup.type === "income" ? incomeCatGroups : expenseCatGroups).map(catGroup => (
                                                <div key={catGroup.key}>
                                                    <div className="px-2 py-1 text-[10px] uppercase font-bold text-muted-foreground">{catGroup.label}</div>
                                                    {catGroup.categories.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                                    ))}
                                                </div>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Subgroups list in sheet */}
                                {selectedGroup.subgroups.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Ricorrenze</h4>
                                        {selectedGroup.subgroups.map(sg => renderSubgroup(selectedGroup, sg))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
