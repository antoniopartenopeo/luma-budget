"use client"

import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { EnrichedRow } from "../../core/types"
import { cn } from "@/lib/utils"
import { formatCents } from "@/domain/money"
import { RowsList } from "./rows-list"

interface CategoryGroup {
    id: string
    label: string
    color: string
    amount: number
    count: number
    rowIds: string[]
}

interface CategoryGroupListProps {
    categoryGroups: CategoryGroup[]
    getRowById: (id: string) => EnrichedRow | undefined
}

/**
 * Accordion list for the category view tab.
 * Groups transactions by category with expandable drill-down.
 */
export function CategoryGroupList({ categoryGroups, getRowById }: CategoryGroupListProps) {
    return (
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
    )
}
