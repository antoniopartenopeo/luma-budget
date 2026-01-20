import { Category, CategoryGroup, CategoryGroupKey, CategoryKind } from "./types"
import {
    CATEGORIES,
    CATEGORY_GROUP_LABELS,
    CATEGORY_GROUP_ORDER,
    EXPENSE_GROUP_ORDER
} from "./defaults"

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
