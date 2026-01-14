import { ICON_REGISTRY } from "../icon-registry"
import { useCategories } from "../api/use-categories"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategoryIconProps {
    categoryName: string
    size?: number
    className?: string
    showBackground?: boolean
}

export function CategoryIcon({ categoryName, size = 16, className, showBackground = false }: CategoryIconProps) {
    const { data: categories = [] } = useCategories()

    const category = categories.find(c => c.id === categoryName || c.label === categoryName)

    if (!category) {
        return <HelpCircle size={size} className={cn("text-gray-500", className)} />
    }

    const LucideIcon = ICON_REGISTRY[category.iconName] || HelpCircle

    // Extract text color class from the combined color string "text-X bg-X"
    const colorClass = category.color.split(" ").find(c => c.startsWith("text-")) || "text-gray-600"

    if (showBackground) {
        // Extract bg color class
        const bgClass = category.color.split(" ").find(c => c.startsWith("bg-")) || "bg-gray-100"
        return (
            <div className={cn("rounded-full p-2", bgClass, className)}>
                <LucideIcon size={size} className={colorClass} />
            </div>
        )
    }

    return <LucideIcon size={size} className={cn(colorClass, className)} />
}
