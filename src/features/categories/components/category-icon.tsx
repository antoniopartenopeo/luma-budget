import { ICON_REGISTRY } from "../icon-registry"
import { useCategories } from "../api/use-categories"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryIconProps {
    categoryName?: string
    categoryId?: string
    size?: number
    className?: string
    showBackground?: boolean
}

export function CategoryIcon({ categoryName, categoryId, size = 16, className, showBackground = false }: CategoryIconProps) {
    const { data: categories = [] } = useCategories({ includeArchived: true })

    // "Virtual Join" Strategy:
    // 1. Try to find by ID first (Robust against renames)
    // 2. Fallback to matching Label or ID string (Legacy/Loose support)
    const category = categoryId
        ? categories.find(c => c.id === categoryId)
        : categories.find(c => c.id === categoryName || c.label === categoryName)

    if (!category) {
        // If not found (e.g. hard deleted), use the passed name as fallback title or just show generic
        // Could technically assume the icon is default if we can't find config
        return <HelpCircle size={size} className={cn("text-gray-500", className)} />
    }

    const LucideIcon = ICON_REGISTRY[category.iconName] || HelpCircle

    // Extract text color class from the combined color string "text-X bg-X"
    const colorClass = category.color.split(" ").find(c => c.startsWith("text-")) || "text-gray-600"

    if (showBackground) {
        // Extract bg color class
        const bgClass = category.color.split(" ").find(c => c.startsWith("bg-")) || "bg-gray-100"
        return (
            <div className={cn("rounded-full p-2", bgClass, className)} title={category.label}>
                <LucideIcon size={size} className={colorClass} />
            </div>
        )
    }

    return (
        <span title={category.label} className={className}>
            <LucideIcon size={size} className={colorClass} />
        </span>
    )
}
