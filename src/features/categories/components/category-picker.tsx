"use client"

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { getGroupedCategories, getCategoryById, CategoryKind } from "@/features/categories/config"
import { useCategories } from "@/features/categories/api/use-categories"
import { CategoryIcon } from "./category-icon"
import { cn } from "@/lib/utils"

interface CategoryPickerProps {
    value: string
    onChange: (categoryId: string) => void
    /** Filter by transaction type. "all" shows all categories without grouping headers */
    type?: "expense" | "income" | "all"
    /** Compact mode for inline usage */
    compact?: boolean
    /** Size variant */
    size?: "default" | "sm"
    /** Disabled state */
    disabled?: boolean
    /** Custom class */
    className?: string
}

/**
 * Reusable category picker component.
 * Used by TransactionForm and CSV Import Wizard.
 * Features:
 * - Grouped by spending nature (when type is expense/income)
 * - Shows CategoryIcon
 * - Uses categories from API (includes custom categories)
 */
export function CategoryPicker({
    value,
    onChange,
    type = "expense",
    compact = false,
    size = "default",
    disabled = false,
    className
}: CategoryPickerProps) {
    const { data: categories = [] } = useCategories()
    const selected = getCategoryById(value, categories)

    // For "all" type, show flat list; otherwise show grouped
    const showGrouped = type !== "all"
    const groupedCategories = showGrouped ? getGroupedCategories(categories, type as CategoryKind) : null
    const flatCategories = !showGrouped ? categories : null

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className={cn(
                "w-full transition-colors",
                size === "sm" ? "h-7 text-xs" : size === "default" ? "h-9 text-sm" : "h-10",
                compact && "bg-muted/20 border-transparent hover:border-input",
                !value && "text-muted-foreground/70",
                className
            )}>
                <div className="flex items-center gap-2 overflow-hidden w-full">
                    {selected ? (
                        <>
                            <CategoryIcon categoryName={selected.label} size={compact ? 14 : 16} />
                            <span className="truncate flex-1 text-left">
                                {compact ? selected.label.split(' ')[0] : selected.label}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="w-4 h-4 rounded-full border border-dashed border-foreground/30 shrink-0" />
                            <span className="truncate flex-1 text-left opacity-70">
                                {compact ? "Categoria..." : "Seleziona categoria"}
                            </span>
                        </>
                    )}
                </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
                {showGrouped && groupedCategories?.map((group) => (
                    <div key={group.key}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {group.label}
                        </div>
                        {group.categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                <div className="flex items-center gap-2">
                                    <CategoryIcon categoryName={cat.label} size={16} />
                                    <span>{cat.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </div>
                ))}
                {!showGrouped && flatCategories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                            <CategoryIcon categoryName={cat.label} size={16} />
                            <span>{cat.label}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
