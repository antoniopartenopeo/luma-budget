import { CategoryGroupKey } from "@/domain/categories"

// =====================
// BUDGET TYPES
// =====================

export type BudgetGroupId = Exclude<CategoryGroupKey, "income">

export interface GroupBudget {
    groupId: BudgetGroupId
    label: string
    amountCents: number
}

export interface BudgetPlan {
    id: string
    userId: string
    period: string // "YYYY-MM" format
    currency: string
    globalBudgetAmountCents: number
    groupBudgets: GroupBudget[]
    createdAt: string
    updatedAt: string
}

export interface BudgetSpending {
    globalSpentCents: number
    groupSpending: {
        groupId: BudgetGroupId
        label: string
        spentCents: number
    }[]
}

export interface BudgetSummary {
    plan: BudgetPlan | null
    spending: BudgetSpending
    period: string
}

// =====================
// BUDGET GROUP LABELS
// =====================

export const BUDGET_GROUP_LABELS: Record<BudgetGroupId, string> = {
    essential: "Spese essenziali",
    comfort: "Spese per il benessere",
    superfluous: "Spese superflue"
}

export const BUDGET_GROUPS: BudgetGroupId[] = ["essential", "comfort", "superfluous"]

// =====================
// DTO TYPES
// =====================

export interface CreateBudgetDTO {
    period: string
    globalBudgetAmountCents: number
    groupBudgets: GroupBudget[]
}

export interface UpdateBudgetDTO {
    globalBudgetAmountCents?: number
    groupBudgets?: GroupBudget[]
}
