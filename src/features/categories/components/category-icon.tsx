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
    // Try to find by ID first, then by Label
    const category = CATEGORIES.find(c => c.id === categoryName || c.label === categoryName)

    if (!category) {
        return <HelpCircle size={size} className={cn("text-gray-500", className)} />
    }

    const Icon = category.icon

    // Extract text color class from the combined color string "text-X bg-X"
    const colorClass = category.color.split(" ").find(c => c.startsWith("text-")) || "text-gray-600"
    const bgClass = category.color.split(" ").find(c => c.startsWith("bg-")) || "bg-gray-100"

    if (showBackground) {
        return (
            <div className={cn("rounded-full p-2", bgClass, className)}>
                <Icon size={size} className={colorClass} />
            </div>
        )
    }

    return <Icon size={size} className={cn(colorClass, className)} />
}
