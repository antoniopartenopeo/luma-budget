"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CategoryPicker } from "@/features/categories/components/category-picker"
import { useCategories } from "@/features/categories/api/use-categories"
import { Group, Subgroup, EnrichedRow } from "../../core/types"
import { cn } from "@/lib/utils"
import { formatCents } from "@/domain/money"
import { Category, getCategoryById } from "@/domain/categories"
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

function sortRowsByValueDesc(rows: EnrichedRow[]): EnrichedRow[] {
    return [...rows].sort((a, b) => {
        const absoluteDiff = Math.abs(b.amountCents) - Math.abs(a.amountCents)
        if (absoluteDiff !== 0) return absoluteDiff
        return b.amountCents - a.amountCents
    })
}

function resolveCategoryHexColor(categoryId: string | null, categories: Category[]): string | null {
    if (!categoryId) return null
    const category = getCategoryById(categoryId, categories)
    return category?.hexColor ?? null
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
    const { data: categories = [] } = useCategories({ includeArchived: true })
    const isHighImpact = index < Math.ceil(totalGroups * 0.2) // Top 20%
    const hasMultipleSubgroups = group.subgroups.length > 1
    const groupStripeHex = resolveCategoryHexColor(effectiveCategoryId, categories)
    const singleSubgroupRows = sortRowsByValueDesc(
        (group.subgroups[0]?.rowIds.map(getRowById).filter(Boolean) as EnrichedRow[]) || []
    )

    return (
        <AccordionItem
            value={group.id}
            className={cn(
                "group/merchant relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-sm transition-all",
                "data-[state=open]:border-primary/35 data-[state=open]:bg-card/85 data-[state=open]:shadow-md",
                isHighImpact && "border-primary/35"
            )}
        >
            <div
                className={cn(
                    "absolute inset-y-0 left-0 w-1.5 rounded-r-full",
                    groupStripeHex
                        ? ""
                        : isHighImpact
                        ? "bg-primary/70"
                        : "bg-border group-data-[state=open]/merchant:bg-primary/45"
                )}
                style={groupStripeHex ? { backgroundColor: groupStripeHex } : undefined}
            />

            <div className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_1px_10.5rem] sm:items-start sm:gap-4">
                <AccordionTrigger className="w-full rounded-xl px-2 py-2 hover:bg-muted/25 hover:no-underline [&>svg]:mt-1">
                    <div className="flex w-full min-w-0 items-start justify-between gap-3 pr-2">
                        <div className="min-w-0 flex-1 text-left">
                            <div className="mb-1 flex items-center gap-2">
                                <h3 className="truncate text-sm font-semibold md:text-base text-foreground">
                                    {group.label}
                                </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span>{group.rowCount} movimenti</span>
                                {hasMultipleSubgroups ? (
                                    <>
                                        <span className="h-1 w-1 rounded-full bg-border" />
                                        <span>{group.subgroups.length} sottogruppi</span>
                                    </>
                                ) : null}
                            </div>
                        </div>

                        <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold tabular-nums text-foreground md:text-base">
                                {formatCents(Math.abs(group.totalCents))}
                            </p>
                            <p className="text-[11px] text-muted-foreground">totale gruppo</p>
                        </div>
                    </div>
                </AccordionTrigger>

                <div className="hidden h-6 w-px self-center justify-self-center bg-border/50 sm:block" aria-hidden="true" />

                <div className="space-y-1 sm:pt-1">
                    <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Categoria
                    </p>
                    <CategoryPicker
                        value={effectiveCategoryId || ""}
                        onChange={(val) => onGroupCategoryChange(group.id, val)}
                        type="all"
                        compact
                        className="border-border/60 bg-background/85"
                    />
                </div>
            </div>

            <AccordionContent className="px-4 pb-4 pt-0 sm:px-5">
                {hasMultipleSubgroups ? (
                    <SubgroupList
                        subgroups={group.subgroups}
                        onSubgroupCategoryChange={onSubgroupCategoryChange}
                        getSubgroupEffectiveCategory={getSubgroupEffectiveCategory}
                        getRowById={getRowById}
                        categories={categories}
                    />
                ) : (
                    <RowsList
                        variant="flat"
                        rows={singleSubgroupRows}
                    />
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
    categories: Category[]
}

function SubgroupList({
    subgroups,
    onSubgroupCategoryChange,
    getSubgroupEffectiveCategory,
    getRowById,
    categories
}: SubgroupListProps) {
    return (
        <Accordion type="multiple" className="space-y-2">
            {subgroups.map(sg => {
                const sgCatId = getSubgroupEffectiveCategory(sg)
                const sgRows = sortRowsByValueDesc(sg.rowIds.map(getRowById).filter(Boolean) as EnrichedRow[])
                const sgTotal = sgRows.reduce((sum, r) => sum + r.amountCents, 0)
                const subgroupStripeHex = resolveCategoryHexColor(sgCatId, categories)

                return (
                    <AccordionItem
                        key={sg.id}
                        value={sg.id}
                        className="relative overflow-hidden rounded-xl border border-border/60 bg-background/55 data-[state=open]:bg-background/75"
                    >
                        <div
                            className={cn(
                                "absolute inset-y-0 left-0 w-1 rounded-r-full",
                                subgroupStripeHex ? "" : "bg-border/80"
                            )}
                            style={subgroupStripeHex ? { backgroundColor: subgroupStripeHex } : undefined}
                        />

                        <div className="grid gap-2 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_1px_7.5rem] sm:items-start">
                            <AccordionTrigger className="w-full rounded-lg px-2 py-1.5 text-sm hover:bg-muted/20 hover:no-underline [&>svg]:mt-0.5">
                                <div className="flex min-w-0 flex-1 items-center justify-between gap-2 pr-2">
                                    <span className="truncate text-sm font-medium text-foreground">{sg.label}</span>
                                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                                        {formatCents(Math.abs(sgTotal))}
                                    </span>
                                </div>
                            </AccordionTrigger>

                            <div className="hidden h-5 w-px self-center justify-self-center bg-border/50 sm:block" aria-hidden="true" />

                            <div className="sm:pt-0.5">
                                <CategoryPicker
                                    value={sgCatId || ""}
                                    onChange={(val) => onSubgroupCategoryChange(sg.id, val)}
                                    type="all"
                                    compact
                                    size="sm"
                                    className="border-border/60 bg-background/80"
                                />
                            </div>
                        </div>
                        <AccordionContent className="px-3 pb-3 pt-0">
                            <RowsList rows={sgRows} variant="flat" />
                        </AccordionContent>
                    </AccordionItem>
                )
            })}
        </Accordion>
    )
}
