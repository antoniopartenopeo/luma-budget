"use client"

import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CategoryPicker } from "@/features/categories/components/category-picker"
import { Group, Subgroup, EnrichedRow } from "../../core/types"
import { cn } from "@/lib/utils"
import { formatCents } from "@/domain/money"
import { RowsList } from "./rows-list"

interface MerchantGroupCardProps {
    group: Group
    index: number
    totalGroups: number
    effectiveCategoryId: string | null
    onGroupCategoryChange: (groupId: string, categoryId: string) => void
    onSubgroupCategoryChange: (subgroupId: string, categoryId: string) => void
    getSubgroupEffectiveCategory: (subgroup: Subgroup) => string | null
    getRowById: (id: string) => EnrichedRow | undefined
}

/**
 * Accordion card for a merchant group with subgroups.
 * Handles both single and multiple subgroup scenarios.
 */
export function MerchantGroupCard({
    group,
    index,
    totalGroups,
    effectiveCategoryId,

    onGroupCategoryChange,
    onSubgroupCategoryChange,
    getSubgroupEffectiveCategory,
    getRowById
}: MerchantGroupCardProps) {
    const isHighImpact = index < Math.ceil(totalGroups * 0.2) // Top 20%
    const hasMultipleSubgroups = group.subgroups.length > 1

    return (
        <AccordionItem
            value={group.id}
            className={cn(
                "overflow-hidden rounded-xl border border-border/70 bg-background/70",
                isHighImpact && "border-primary/35"
            )}
        >
            <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/20">
                <div className="flex-1 min-w-0">
                    <AccordionTrigger className="px-0 py-0 hover:no-underline">
                        <div className="flex items-center justify-between w-full gap-3 pr-2">
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="truncate text-sm font-semibold md:text-base">
                                        {group.label}
                                    </h3>
                                    {isHighImpact && (
                                        <Badge className="shrink-0 border-primary/20 bg-primary/10 text-xs font-medium text-primary">
                                            Rilevante
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-semibold text-foreground tabular-nums">
                                        {formatCents(Math.abs(group.totalCents))}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span>{group.rowCount} movimenti</span>
                                    {hasMultipleSubgroups && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span>{group.subgroups.length} gruppi interni</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </AccordionTrigger>
                </div>
                <div className="w-32 shrink-0 md:w-40">
                    <CategoryPicker
                        value={effectiveCategoryId || ""}
                        onChange={(val) => onGroupCategoryChange(group.id, val)}
                        type="all"
                        compact
                    />
                </div>
            </div>
            <AccordionContent className="px-4 pb-4 pt-0">
                {hasMultipleSubgroups ? (
                    <SubgroupList
                        subgroups={group.subgroups}
                        onSubgroupCategoryChange={onSubgroupCategoryChange}
                        getSubgroupEffectiveCategory={getSubgroupEffectiveCategory}
                        getRowById={getRowById}
                    />
                ) : (
                    <div className="mt-2">
                        <RowsList
                            variant="flat"
                            rows={group.subgroups[0]?.rowIds.map(getRowById).filter(Boolean) as EnrichedRow[] || []}
                        />
                    </div>
                )}
            </AccordionContent>
        </AccordionItem>
    )
}

// ============================================
// SubgroupList sub-component
// ============================================

interface SubgroupListProps {
    subgroups: Subgroup[]
    onSubgroupCategoryChange: (subgroupId: string, categoryId: string) => void
    getSubgroupEffectiveCategory: (subgroup: Subgroup) => string | null
    getRowById: (id: string) => EnrichedRow | undefined
}

function SubgroupList({
    subgroups,
    onSubgroupCategoryChange,
    getSubgroupEffectiveCategory,
    getRowById
}: SubgroupListProps) {
    return (
        <Accordion type="multiple" className="mt-2 space-y-2">
            {subgroups.map(sg => {
                const sgCatId = getSubgroupEffectiveCategory(sg)
                const sgRows = sg.rowIds.map(getRowById).filter(Boolean) as EnrichedRow[]
                const sgTotal = sgRows.reduce((sum, r) => sum + r.amountCents, 0)

                return (
                    <AccordionItem
                        key={sg.id}
                        value={sg.id}
                        className="rounded-lg border border-border/60 bg-muted/15"
                    >
                        <div className="flex items-center gap-2 px-3 py-2">
                            <div className="flex-1 min-w-0">
                                <AccordionTrigger className="px-0 py-0 text-sm hover:no-underline">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="truncate text-sm font-medium">{sg.label}</span>
                                        <span className="text-xs tabular-nums text-muted-foreground">
                                            {formatCents(Math.abs(sgTotal))}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="w-28">
                                    <CategoryPicker
                                        value={sgCatId || ""}
                                        onChange={(val) => onSubgroupCategoryChange(sg.id, val)}
                                        type="all"
                                        compact
                                        size="sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <AccordionContent className="px-3 pb-3">
                            <RowsList rows={sgRows} variant="flat" />
                        </AccordionContent>
                    </AccordionItem>
                )
            })}
        </Accordion>
    )
}
