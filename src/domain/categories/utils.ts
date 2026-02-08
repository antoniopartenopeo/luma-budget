import { Category, CategoryGroup, CategoryGroupKey, CategoryKind } from "./types"
import {
    CATEGORY_GROUP_LABELS,
    CATEGORY_GROUP_ORDER,
    EXPENSE_GROUP_ORDER
} from "./defaults"

// =====================
// HELPER FUNCTIONS (Pure / Dynamic)
// =====================

export function getCategoryById(id: string, categories: Category[]): Category | undefined {
    return categories.find(c => c.id === id)
}

/**
 * Robust lookup that returns a dummy category instead of undefined
 */
export function getCategoryOrFallback(id: string, categories: Category[]): Category {
    const found = getCategoryById(id, categories)
    if (found) return found

    return {
        id: id,
        label: id === "" ? "Nessuna Categoria" : `ID: ${id}`,
        kind: "expense",
        color: "text-gray-400 bg-gray-50",
        hexColor: "#94a3b8",
        iconName: "helpCircle",
        spendingNature: "comfort",
        archived: true
    }
}

export function getCategoryLabel(id: string, categories: Category[]): string {
    const category = getCategoryById(id, categories)
    return category ? category.label : id
}

export function getCategoryColor(id: string, categories: Category[]): string {
    const category = getCategoryById(id, categories)
    return category ? category.color : "text-gray-600 bg-gray-100"
}

/**
 * Get categories organized by group for UI display
 * Returns only non-empty groups
 */
export function getGroupedCategories(
    categories: Category[],
    kind?: CategoryKind,
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
