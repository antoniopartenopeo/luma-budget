import { LucideIcon } from "lucide-react"
import { getIconByName } from "./icon-registry"
import { getCategoryById } from "@/domain/categories"
import { Category, CATEGORIES } from "@/domain/categories"

// Re-export everything from domain
export * from "@/domain/categories"

// UI-Specific helper functions (dependent on Lucide React)
export function getCategoryIcon(id: string, categories: Category[]): LucideIcon {
    const category = getCategoryById(id, categories)
    return getIconByName(category?.iconName || "helpCircle")
}
