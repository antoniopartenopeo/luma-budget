import { CATEGORIES, getCategoryIcon, getCategoryColor, getCategoryById } from "../config"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryIconProps {
    categoryName: string
    size?: number
    className?: string
    showBackground?: boolean
}

export function CategoryIcon({ categoryName, size = 16, className, showBackground = false }: CategoryIconProps) {
    // Find category by label (name) since that's what we store in transactions
    const category = CATEGORIES.find(c => c.label === categoryName)

    if (!category) {
        return <HelpCircle size={size} className={cn("text-muted-foreground", className)} />
    }

    const Icon = category.icon

    // Extract text color class from the combined color string "text-X bg-X"
    // This is a bit brittle if config changes structure, but works for current "text-orange-600 bg-orange-100" format
    const colorClass = category.color.split(" ").find(c => c.startsWith("text-")) || ""
    const bgClass = category.color.split(" ").find(c => c.startsWith("bg-")) || ""

    if (showBackground) {
        return (
            <div className={cn("rounded-full p-2", bgClass, className)}>
                <Icon size={size} className={colorClass} />
            </div>
        )
    }

    return <Icon size={size} className={cn(colorClass, className)} />
}
