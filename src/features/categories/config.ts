import { LucideIcon } from "lucide-react"
import { getIconByName } from "./icon-registry"

// =====================
// CATEGORY ID TYPES
// =====================

export type ExpenseCategoryId =
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
    | "utenze"
    | "auto"
    | "assicurazioni"
    | "tasse"
    | "famiglia"
    | "servizi-domestici"
    | "lavoro-essenziale"
    | "ristoranti"
    | "benessere"
    | "hobby-sport"
    | "abbonamenti"
    | "animali"
    | "tecnologia"
    | "regali"
    | "arredo"
    | "formazione-extra"
    | "micro-digitali"
    | "lusso"
    | "giochi-scommesse"
    | "extra-impulsivi"

export type IncomeCategoryId =
    | "stipendio"
    | "pensione"
    | "freelance"
    | "bonus"
    | "affitti"
    | "rendite"
    | "vendite"
    | "rimborsi"
    | "regali-ricevuti"
    | "cashback"
    | "entrate-occasionali"

export type CategoryId = string

// =====================
// CATEGORY TYPES
// =====================

export type CategoryKind = "expense" | "income"
export type SpendingNature = "essential" | "comfort" | "superfluous"

export interface Category {
    id: CategoryId
    label: string
    kind: CategoryKind
    color: string
    hexColor: string
    iconName: string
    spendingNature: SpendingNature
    archived?: boolean
    updatedAt?: string
}

// =====================
// CATEGORIES DATA (DEFAULTS)
// =====================

export const CATEGORIES: Category[] = [
    {
        id: "cibo",
        label: "Cibo",
        kind: "expense",
        color: "text-orange-600 bg-orange-100",
        hexColor: "#ea580c",
        iconName: "utensils",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "trasporti",
        label: "Trasporti",
        kind: "expense",
        color: "text-blue-600 bg-blue-100",
        hexColor: "#2563eb",
        iconName: "bus",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "casa",
        label: "Casa",
        kind: "expense",
        color: "text-indigo-600 bg-indigo-100",
        hexColor: "#4f46e5",
        iconName: "home",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "svago",
        label: "Svago",
        kind: "expense",
        color: "text-pink-600 bg-pink-100",
        hexColor: "#db2777",
        iconName: "gamepad2",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: "salute",
        label: "Salute",
        kind: "expense",
        color: "text-teal-600 bg-teal-100",
        hexColor: "#0d9488",
        iconName: "heartPulse",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "shopping",
        label: "Shopping",
        kind: "expense",
        color: "text-purple-600 bg-purple-100",
        hexColor: "#9333ea",
        iconName: "shoppingBag",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: "viaggi",
        label: "Viaggi",
        kind: "expense",
        color: "text-sky-600 bg-sky-100",
        hexColor: "#0284c7",
        iconName: "plane",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: "istruzione",
        label: "Istruzione",
        kind: "expense",
        color: "text-yellow-600 bg-yellow-100",
        hexColor: "#ca8a04",
        iconName: "graduationCap",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "investimenti",
        label: "Investimenti",
        kind: "expense",
        color: "text-emerald-600 bg-emerald-100",
        hexColor: "#059669",
        iconName: "trendingUp",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: "altro",
        label: "Altro",
        kind: "expense",
        color: "text-gray-600 bg-gray-100",
        hexColor: "#4b5563",
        iconName: "helpCircle",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: "utenze",
        label: "Utenze & Bollette",
        kind: "expense",
        color: "text-amber-600 bg-amber-100",
        hexColor: "#d97706",
        iconName: "zap",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "auto",
        label: "Auto & Carburante",
        kind: "expense",
        color: "text-slate-600 bg-slate-100",
        hexColor: "#475569",
        iconName: "car",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "assicurazioni",
        label: "Assicurazioni",
        kind: "expense",
        color: "text-cyan-600 bg-cyan-100",
        hexColor: "#0891b2",
        iconName: "shield",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "tasse",
        label: "Tasse & Contributi",
        kind: "expense",
        color: "text-red-600 bg-red-100",
        hexColor: "#dc2626",
        iconName: "fileText",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "famiglia",
        label: "Famiglia & Figli",
        kind: "expense",
        color: "text-rose-600 bg-rose-100",
        hexColor: "#e11d48",
        iconName: "users",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "servizi-domestici",
        label: "Servizi Domestici",
        kind: "expense",
        color: "text-violet-600 bg-violet-100",
        hexColor: "#7c3aed",
        iconName: "sparkles",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "lavoro-essenziale",
        label: "Lavoro Essenziale",
        kind: "expense",
        color: "text-stone-600 bg-stone-100",
        hexColor: "#57534e",
        iconName: "wrench",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "ristoranti",
        label: "Ristoranti & Bar",
        kind: "expense",
        color: "text-orange-500 bg-orange-50",
        hexColor: "#f97316",
        iconName: "utensilsCrossed",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: "benessere",
        label: "Benessere & Bellezza",
        kind: "expense",
        color: "text-fuchsia-600 bg-fuchsia-100",
        hexColor: "#c026d3",
        iconName: "sparkle",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: "hobby-sport",
        label: "Hobby & Sport",
        kind: "expense",
        color: "text-lime-600 bg-lime-100",
        hexColor: "#65a30d",
        iconName: "dumbbell",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: "abbonamenti",
        label: "Abbonamenti & Media",
        kind: "expense",
        color: "text-blue-500 bg-blue-50",
        hexColor: "#3b82f6",
        iconName: "tv",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: "animali",
        label: "Animali Domestici",
        kind: "expense",
        color: "text-amber-500 bg-amber-50",
        hexColor: "#f59e0b",
        iconName: "pawPrint",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: "tecnologia",
        label: "Tecnologia & Gadget",
        kind: "expense",
        color: "text-indigo-500 bg-indigo-50",
        hexColor: "#6366f1",
        iconName: "laptop",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: "regali",
        label: "Regali & Feste",
        kind: "expense",
        color: "text-pink-500 bg-pink-50",
        hexColor: "#ec4899",
        iconName: "gift",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: "arredo",
        label: "Arredo & Decorazioni",
        kind: "expense",
        color: "text-teal-500 bg-teal-50",
        hexColor: "#14b8a6",
        iconName: "armchair",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: "formazione-extra",
        label: "Formazione Personale Extra",
        kind: "expense",
        color: "text-yellow-500 bg-yellow-50",
        hexColor: "#eab308",
        iconName: "bookOpen",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: "micro-digitali",
        label: "Micro-acquisti Digitali",
        kind: "expense",
        color: "text-sky-500 bg-sky-50",
        hexColor: "#0ea5e9",
        iconName: "smartphone",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: "lusso",
        label: "Lusso & Status",
        kind: "expense",
        color: "text-purple-500 bg-purple-50",
        hexColor: "#a855f7",
        iconName: "gem",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: "giochi-scommesse",
        label: "Giochi & Scommesse",
        kind: "expense",
        color: "text-red-500 bg-red-50",
        hexColor: "#ef4444",
        iconName: "dice5",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: "extra-impulsivi",
        label: "Extra Impulsivi",
        kind: "expense",
        color: "text-orange-600 bg-orange-50",
        hexColor: "#ea580c",
        iconName: "zap",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: "stipendio",
        label: "Stipendio",
        kind: "income",
        color: "text-emerald-600 bg-emerald-100",
        hexColor: "#059669",
        iconName: "briefcase",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "pensione",
        label: "Pensione",
        kind: "income",
        color: "text-teal-600 bg-teal-100",
        hexColor: "#0d9488",
        iconName: "user",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "freelance",
        label: "Lavoro Extra / Freelance",
        kind: "income",
        color: "text-blue-600 bg-blue-100",
        hexColor: "#2563eb",
        iconName: "userCheck",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "bonus",
        label: "Bonus & Premi",
        kind: "income",
        color: "text-yellow-600 bg-yellow-100",
        hexColor: "#ca8a04",
        iconName: "badgeDollarSign",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "affitti",
        label: "Affitti Percepiti",
        kind: "income",
        color: "text-indigo-600 bg-indigo-100",
        hexColor: "#4f46e5",
        iconName: "building2",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "rendite",
        label: "Rendite da Investimenti",
        kind: "income",
        color: "text-green-600 bg-green-100",
        hexColor: "#16a34a",
        iconName: "trendingUp",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "vendite",
        label: "Vendite & Seconda Mano",
        kind: "income",
        color: "text-lime-600 bg-lime-100",
        hexColor: "#65a30d",
        iconName: "recycle",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "rimborsi",
        label: "Rimborsi & Note Spese",
        kind: "income",
        color: "text-cyan-600 bg-cyan-100",
        hexColor: "#0891b2",
        iconName: "creditCard",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "regali-ricevuti",
        label: "Regali Ricevuti",
        kind: "income",
        color: "text-pink-600 bg-pink-100",
        hexColor: "#db2777",
        iconName: "gift",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "cashback",
        label: "Cashback & Punti",
        kind: "income",
        color: "text-amber-600 bg-amber-100",
        hexColor: "#d97706",
        iconName: "coins",
        spendingNature: "essential",
        archived: false
    },
    {
        id: "entrate-occasionali",
        label: "Entrate Occasionali",
        kind: "income",
        color: "text-purple-600 bg-purple-100",
        hexColor: "#9333ea",
        iconName: "trophy",
        spendingNature: "essential",
        archived: false
    },
]

// =====================
// HELPER FUNCTIONS (Pure / Dynamic)
// =====================

export function getCategoryById(id: string, categories: Category[] = CATEGORIES): Category | undefined {
    return categories.find(c => c.id === id)
}

export function getCategoryLabel(id: string, categories: Category[] = CATEGORIES): string {
    const category = getCategoryById(id, categories)
    return category ? category.label : id
}

export function getCategoryColor(id: string, categories: Category[] = CATEGORIES): string {
    const category = getCategoryById(id, categories)
    return category ? category.color : "text-gray-600 bg-gray-100"
}

export function getCategoryIcon(id: string, categories: Category[] = CATEGORIES): LucideIcon {
    const category = getCategoryById(id, categories)
    return getIconByName(category?.iconName || "helpCircle")
}

// =====================
// CATEGORY GROUPING (UI)
// =====================

export type CategoryGroupKey =
    | "essential"
    | "comfort"
    | "superfluous"
    | "income"

export interface CategoryGroup {
    key: CategoryGroupKey
    label: string
    categories: Category[]
}

// Group labels in Italian (UI only)
export const CATEGORY_GROUP_LABELS: Record<CategoryGroupKey, string> = {
    essential: "Spese essenziali",
    comfort: "Spese per il benessere",
    superfluous: "Spese superflue",
    income: "Entrate"
}

// Order of groups in UI
export const CATEGORY_GROUP_ORDER: CategoryGroupKey[] = [
    "essential",
    "comfort",
    "superfluous",
    "income"
]

// Expense-only group order
export const EXPENSE_GROUP_ORDER: CategoryGroupKey[] = [
    "essential",
    "comfort",
    "superfluous"
]

/**
 * Get categories organized by group for UI display
 * Returns only non-empty groups
 */
export function getGroupedCategories(
    kind?: CategoryKind,
    categories: Category[] = CATEGORIES,
    options: { includeArchived?: boolean } = { includeArchived: false }
): CategoryGroup[] {
    const groupOrder = kind === "income"
        ? ["income" as CategoryGroupKey]
        : kind === "expense"
            ? EXPENSE_GROUP_ORDER
            : CATEGORY_GROUP_ORDER

    const filteredCategories = options.includeArchived
        ? categories
        : categories.filter(c => !c.archived)

    return groupOrder
        .map(groupKey => {
            let groupCategories: Category[]

            if (groupKey === "income") {
                groupCategories = filteredCategories.filter(c => c.kind === "income")
            } else {
                groupCategories = filteredCategories.filter(
                    c => c.kind === "expense" && c.spendingNature === groupKey
                )
            }

            return {
                key: groupKey,
                label: CATEGORY_GROUP_LABELS[groupKey],
                categories: groupCategories
            }
        })
        .filter(group => group.categories.length > 0)
}
