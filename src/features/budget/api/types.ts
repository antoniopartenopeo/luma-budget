// =====================
// BUDGET TYPES
// =====================

export type BudgetGroupId = "essential" | "comfort" | "superfluous"

export interface GroupBudget {
    groupId: BudgetGroupId
    label: string
    amount: number
}

export interface BudgetPlan {
    id: string
    userId: string
    period: string // "YYYY-MM" format
    currency: string
    globalBudgetAmount: number
    groupBudgets: GroupBudget[]
    createdAt: string
    updatedAt: string
}

export interface BudgetSpending {
    globalSpent: number
    groupSpending: {
        groupId: BudgetGroupId
        label: string
        spent: number
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
    globalBudgetAmount: number
    groupBudgets: GroupBudget[]
}

export interface UpdateBudgetDTO {
    globalBudgetAmount?: number
    groupBudgets?: GroupBudget[]
}
