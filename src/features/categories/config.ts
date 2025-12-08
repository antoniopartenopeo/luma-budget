import { LucideIcon, Utensils, Bus, Home, Gamepad2, HeartPulse, ShoppingBag, Plane, GraduationCap, TrendingUp, HelpCircle } from "lucide-react"

export type CategoryId =
    | "cibo"
    | "trasporti"
    | "casa"
    | "svago"
    | "salute"
    | "shopping"
    | "viaggi"
    | "istruzione"
    | "investimenti"
    | "altro"

export interface Category {
    id: CategoryId
    label: string
    color: string
    hexColor: string
    icon: LucideIcon
}

export const CATEGORIES: Category[] = [
    {
        id: "cibo",
        label: "Cibo",
        color: "text-orange-600 bg-orange-100",
        hexColor: "#ea580c", // orange-600
        icon: Utensils
    },
    {
        id: "trasporti",
        label: "Trasporti",
        color: "text-blue-600 bg-blue-100",
        hexColor: "#2563eb", // blue-600
        icon: Bus
    },
    {
        id: "casa",
        label: "Casa",
        color: "text-indigo-600 bg-indigo-100",
        hexColor: "#4f46e5", // indigo-600
        icon: Home
    },
    {
        id: "svago",
        label: "Svago",
        color: "text-pink-600 bg-pink-100",
        hexColor: "#db2777", // pink-600
        icon: Gamepad2
    },
    {
        id: "salute",
        label: "Salute",
        color: "text-teal-600 bg-teal-100",
        hexColor: "#0d9488", // teal-600
        icon: HeartPulse
    },
    {
        id: "shopping",
        label: "Shopping",
        color: "text-purple-600 bg-purple-100",
        hexColor: "#9333ea", // purple-600
        icon: ShoppingBag
    },
    {
        id: "viaggi",
        label: "Viaggi",
        color: "text-sky-600 bg-sky-100",
        hexColor: "#0284c7", // sky-600
        icon: Plane
    },
    {
        id: "istruzione",
        label: "Istruzione",
        color: "text-yellow-600 bg-yellow-100",
        hexColor: "#ca8a04", // yellow-600
        icon: GraduationCap
    },
    {
        id: "investimenti",
        label: "Investimenti",
        color: "text-emerald-600 bg-emerald-100",
        hexColor: "#059669", // emerald-600
        icon: TrendingUp
    },
    {
        id: "altro",
        label: "Altro",
        color: "text-gray-600 bg-gray-100",
        hexColor: "#4b5563", // gray-600
        icon: HelpCircle
    },
]

export function getCategoryById(id: string): Category | undefined {
    return CATEGORIES.find(c => c.id === id)
}

export function getCategoryLabel(id: string): string {
    const category = getCategoryById(id)
    return category ? category.label : id
}

export function getCategoryColor(id: string): string {
    const category = getCategoryById(id)
    return category ? category.color : "text-gray-600 bg-gray-100"
}

export function getCategoryIcon(id: string): LucideIcon {
    const category = getCategoryById(id)
    return category ? category.icon : HelpCircle
}
