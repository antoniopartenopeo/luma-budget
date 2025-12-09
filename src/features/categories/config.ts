import {
    LucideIcon,
    Utensils,
    Bus,
    Home,
    Gamepad2,
    HeartPulse,
    ShoppingBag,
    Plane,
    GraduationCap,
    TrendingUp,
    HelpCircle,
    // New expense icons
    Zap,
    Car,
    Shield,
    FileText,
    Users,
    Sparkles,
    Wrench,
    UtensilsCrossed,
    Sparkle,
    Dumbbell,
    Tv,
    PawPrint,
    Laptop,
    Gift,
    Armchair,
    BookOpen,
    Smartphone,
    Gem,
    Dice5,
    // Income icons
    Briefcase,
    User,
    UserCheck,
    BadgeDollarSign,
    Building2,
    Recycle,
    CreditCard,
    Coins,
    Trophy
} from "lucide-react"

// =====================
// CATEGORY ID TYPES
// =====================

// Existing expense category IDs (unchanged)
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
    // New essential expense categories
    | "utenze"
    | "auto"
    | "assicurazioni"
    | "tasse"
    | "famiglia"
    | "servizi-domestici"
    | "lavoro-essenziale"
    // New comfort expense categories
    | "ristoranti"
    | "benessere"
    | "hobby-sport"
    | "abbonamenti"
    | "animali"
    | "tecnologia"
    | "regali"
    | "arredo"
    | "formazione-extra"
    // New superfluous expense categories
    | "micro-digitali"
    | "lusso"
    | "giochi-scommesse"
    | "extra-impulsivi"

// Income category IDs
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

export type CategoryId = ExpenseCategoryId | IncomeCategoryId

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
    icon: LucideIcon
    spendingNature: SpendingNature
}

// =====================
// CATEGORIES DATA
// =====================

export const CATEGORIES: Category[] = [
    // ===================================
    // EXISTING EXPENSE CATEGORIES (unchanged except for kind field)
    // ===================================
    {
        id: "cibo",
        label: "Cibo",
        kind: "expense",
        color: "text-orange-600 bg-orange-100",
        hexColor: "#ea580c",
        icon: Utensils,
        spendingNature: "essential"
    },
    {
        id: "trasporti",
        label: "Trasporti",
        kind: "expense",
        color: "text-blue-600 bg-blue-100",
        hexColor: "#2563eb",
        icon: Bus,
        spendingNature: "essential"
    },
    {
        id: "casa",
        label: "Casa",
        kind: "expense",
        color: "text-indigo-600 bg-indigo-100",
        hexColor: "#4f46e5",
        icon: Home,
        spendingNature: "essential"
    },
    {
        id: "svago",
        label: "Svago",
        kind: "expense",
        color: "text-pink-600 bg-pink-100",
        hexColor: "#db2777",
        icon: Gamepad2,
        spendingNature: "superfluous"
    },
    {
        id: "salute",
        label: "Salute",
        kind: "expense",
        color: "text-teal-600 bg-teal-100",
        hexColor: "#0d9488",
        icon: HeartPulse,
        spendingNature: "essential"
    },
    {
        id: "shopping",
        label: "Shopping",
        kind: "expense",
        color: "text-purple-600 bg-purple-100",
        hexColor: "#9333ea",
        icon: ShoppingBag,
        spendingNature: "comfort"
    },
    {
        id: "viaggi",
        label: "Viaggi",
        kind: "expense",
        color: "text-sky-600 bg-sky-100",
        hexColor: "#0284c7",
        icon: Plane,
        spendingNature: "comfort"
    },
    {
        id: "istruzione",
        label: "Istruzione",
        kind: "expense",
        color: "text-yellow-600 bg-yellow-100",
        hexColor: "#ca8a04",
        icon: GraduationCap,
        spendingNature: "essential"
    },
    {
        id: "investimenti",
        label: "Investimenti",
        kind: "expense",
        color: "text-emerald-600 bg-emerald-100",
        hexColor: "#059669",
        icon: TrendingUp,
        spendingNature: "comfort"
    },
    {
        id: "altro",
        label: "Altro",
        kind: "expense",
        color: "text-gray-600 bg-gray-100",
        hexColor: "#4b5563",
        icon: HelpCircle,
        spendingNature: "superfluous"
    },

    // ===================================
    // NEW EXPENSE CATEGORIES - ESSENTIAL
    // ===================================
    {
        id: "utenze",
        label: "Utenze & Bollette",
        kind: "expense",
        color: "text-amber-600 bg-amber-100",
        hexColor: "#d97706",
        icon: Zap,
        spendingNature: "essential"
    },
    {
        id: "auto",
        label: "Auto & Carburante",
        kind: "expense",
        color: "text-slate-600 bg-slate-100",
        hexColor: "#475569",
        icon: Car,
        spendingNature: "essential"
    },
    {
        id: "assicurazioni",
        label: "Assicurazioni",
        kind: "expense",
        color: "text-cyan-600 bg-cyan-100",
        hexColor: "#0891b2",
        icon: Shield,
        spendingNature: "essential"
    },
    {
        id: "tasse",
        label: "Tasse & Contributi",
        kind: "expense",
        color: "text-red-600 bg-red-100",
        hexColor: "#dc2626",
        icon: FileText,
        spendingNature: "essential"
    },
    {
        id: "famiglia",
        label: "Famiglia & Figli",
        kind: "expense",
        color: "text-rose-600 bg-rose-100",
        hexColor: "#e11d48",
        icon: Users,
        spendingNature: "essential"
    },
    {
        id: "servizi-domestici",
        label: "Servizi Domestici",
        kind: "expense",
        color: "text-violet-600 bg-violet-100",
        hexColor: "#7c3aed",
        icon: Sparkles,
        spendingNature: "essential"
    },
    {
        id: "lavoro-essenziale",
        label: "Lavoro Essenziale",
        kind: "expense",
        color: "text-stone-600 bg-stone-100",
        hexColor: "#57534e",
        icon: Wrench,
        spendingNature: "essential"
    },

    // ===================================
    // NEW EXPENSE CATEGORIES - COMFORT
    // ===================================
    {
        id: "ristoranti",
        label: "Ristoranti & Bar",
        kind: "expense",
        color: "text-orange-500 bg-orange-50",
        hexColor: "#f97316",
        icon: UtensilsCrossed,
        spendingNature: "comfort"
    },
    {
        id: "benessere",
        label: "Benessere & Bellezza",
        kind: "expense",
        color: "text-fuchsia-600 bg-fuchsia-100",
        hexColor: "#c026d3",
        icon: Sparkle,
        spendingNature: "comfort"
    },
    {
        id: "hobby-sport",
        label: "Hobby & Sport",
        kind: "expense",
        color: "text-lime-600 bg-lime-100",
        hexColor: "#65a30d",
        icon: Dumbbell,
        spendingNature: "comfort"
    },
    {
        id: "abbonamenti",
        label: "Abbonamenti & Media",
        kind: "expense",
        color: "text-blue-500 bg-blue-50",
        hexColor: "#3b82f6",
        icon: Tv,
        spendingNature: "comfort"
    },
    {
        id: "animali",
        label: "Animali Domestici",
        kind: "expense",
        color: "text-amber-500 bg-amber-50",
        hexColor: "#f59e0b",
        icon: PawPrint,
        spendingNature: "comfort"
    },
    {
        id: "tecnologia",
        label: "Tecnologia & Gadget",
        kind: "expense",
        color: "text-indigo-500 bg-indigo-50",
        hexColor: "#6366f1",
        icon: Laptop,
        spendingNature: "comfort"
    },
    {
        id: "regali",
        label: "Regali & Feste",
        kind: "expense",
        color: "text-pink-500 bg-pink-50",
        hexColor: "#ec4899",
        icon: Gift,
        spendingNature: "comfort"
    },
    {
        id: "arredo",
        label: "Arredo & Decorazioni",
        kind: "expense",
        color: "text-teal-500 bg-teal-50",
        hexColor: "#14b8a6",
        icon: Armchair,
        spendingNature: "comfort"
    },
    {
        id: "formazione-extra",
        label: "Formazione Personale Extra",
        kind: "expense",
        color: "text-yellow-500 bg-yellow-50",
        hexColor: "#eab308",
        icon: BookOpen,
        spendingNature: "comfort"
    },

    // ===================================
    // NEW EXPENSE CATEGORIES - SUPERFLUOUS
    // ===================================
    {
        id: "micro-digitali",
        label: "Micro-acquisti Digitali",
        kind: "expense",
        color: "text-sky-500 bg-sky-50",
        hexColor: "#0ea5e9",
        icon: Smartphone,
        spendingNature: "superfluous"
    },
    {
        id: "lusso",
        label: "Lusso & Status",
        kind: "expense",
        color: "text-purple-500 bg-purple-50",
        hexColor: "#a855f7",
        icon: Gem,
        spendingNature: "superfluous"
    },
    {
        id: "giochi-scommesse",
        label: "Giochi & Scommesse",
        kind: "expense",
        color: "text-red-500 bg-red-50",
        hexColor: "#ef4444",
        icon: Dice5,
        spendingNature: "superfluous"
    },
    {
        id: "extra-impulsivi",
        label: "Extra Impulsivi",
        kind: "expense",
        color: "text-orange-600 bg-orange-50",
        hexColor: "#ea580c",
        icon: Zap,
        spendingNature: "superfluous"
    },

    // ===================================
    // INCOME CATEGORIES
    // ===================================
    {
        id: "stipendio",
        label: "Stipendio",
        kind: "income",
        color: "text-emerald-600 bg-emerald-100",
        hexColor: "#059669",
        icon: Briefcase,
        spendingNature: "essential"
    },
    {
        id: "pensione",
        label: "Pensione",
        kind: "income",
        color: "text-teal-600 bg-teal-100",
        hexColor: "#0d9488",
        icon: User,
        spendingNature: "essential"
    },
    {
        id: "freelance",
        label: "Lavoro Extra / Freelance",
        kind: "income",
        color: "text-blue-600 bg-blue-100",
        hexColor: "#2563eb",
        icon: UserCheck,
        spendingNature: "essential"
    },
    {
        id: "bonus",
        label: "Bonus & Premi",
        kind: "income",
        color: "text-yellow-600 bg-yellow-100",
        hexColor: "#ca8a04",
        icon: BadgeDollarSign,
        spendingNature: "essential"
    },
    {
        id: "affitti",
        label: "Affitti Percepiti",
        kind: "income",
        color: "text-indigo-600 bg-indigo-100",
        hexColor: "#4f46e5",
        icon: Building2,
        spendingNature: "essential"
    },
    {
        id: "rendite",
        label: "Rendite da Investimenti",
        kind: "income",
        color: "text-green-600 bg-green-100",
        hexColor: "#16a34a",
        icon: TrendingUp,
        spendingNature: "essential"
    },
    {
        id: "vendite",
        label: "Vendite & Seconda Mano",
        kind: "income",
        color: "text-lime-600 bg-lime-100",
        hexColor: "#65a30d",
        icon: Recycle,
        spendingNature: "essential"
    },
    {
        id: "rimborsi",
        label: "Rimborsi & Note Spese",
        kind: "income",
        color: "text-cyan-600 bg-cyan-100",
        hexColor: "#0891b2",
        icon: CreditCard,
        spendingNature: "essential"
    },
    {
        id: "regali-ricevuti",
        label: "Regali Ricevuti",
        kind: "income",
        color: "text-pink-600 bg-pink-100",
        hexColor: "#db2777",
        icon: Gift,
        spendingNature: "essential"
    },
    {
        id: "cashback",
        label: "Cashback & Punti",
        kind: "income",
        color: "text-amber-600 bg-amber-100",
        hexColor: "#d97706",
        icon: Coins,
        spendingNature: "essential"
    },
    {
        id: "entrate-occasionali",
        label: "Entrate Occasionali",
        kind: "income",
        color: "text-purple-600 bg-purple-100",
        hexColor: "#9333ea",
        icon: Trophy,
        spendingNature: "essential"
    },
]

// =====================
// HELPER FUNCTIONS
// =====================

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

// New helper functions for filtering by kind
export function getExpenseCategories(): Category[] {
    return CATEGORIES.filter(c => c.kind === "expense")
}

export function getIncomeCategories(): Category[] {
    return CATEGORIES.filter(c => c.kind === "income")
}

export function getCategoriesByKind(kind: CategoryKind): Category[] {
    return CATEGORIES.filter(c => c.kind === kind)
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
export function getGroupedCategories(kind?: CategoryKind): CategoryGroup[] {
    const groupOrder = kind === "income"
        ? ["income" as CategoryGroupKey]
        : kind === "expense"
            ? EXPENSE_GROUP_ORDER
            : CATEGORY_GROUP_ORDER

    return groupOrder
        .map(groupKey => {
            let categories: Category[]

            if (groupKey === "income") {
                categories = CATEGORIES.filter(c => c.kind === "income")
            } else {
                categories = CATEGORIES.filter(
                    c => c.kind === "expense" && c.spendingNature === groupKey
                )
            }

            return {
                key: groupKey,
                label: CATEGORY_GROUP_LABELS[groupKey],
                categories
            }
        })
        .filter(group => group.categories.length > 0) // Hide empty groups
}

/**
 * Get expense categories organized by spending nature
 */
export function getGroupedExpenseCategories(): CategoryGroup[] {
    return getGroupedCategories("expense")
}

/**
 * Get income categories as a single group
 */
export function getGroupedIncomeCategories(): CategoryGroup[] {
    return getGroupedCategories("income")
}

