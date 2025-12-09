import { BudgetPlan, CreateBudgetDTO, UpdateBudgetDTO, BUDGET_GROUP_LABELS, BudgetGroupId } from "./types"

// =====================
// IN-MEMORY STORAGE
// =====================

const budgetPlans: Map<string, BudgetPlan> = new Map()

// Helper to create budget key from userId and period
function getBudgetKey(userId: string, period: string): string {
    return `${userId}:${period}`
}

// =====================
// API FUNCTIONS
// =====================

export async function fetchBudget(userId: string, period: string): Promise<BudgetPlan | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200))

    const key = getBudgetKey(userId, period)
    return budgetPlans.get(key) || null
}

export async function createBudget(userId: string, data: CreateBudgetDTO): Promise<BudgetPlan> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const key = getBudgetKey(userId, data.period)

    // Check if already exists
    if (budgetPlans.has(key)) {
        throw new Error("Budget for this period already exists")
    }

    const now = new Date().toISOString()
    const budget: BudgetPlan = {
        id: `budget-${Date.now()}`,
        userId,
        period: data.period,
        currency: "EUR",
        globalBudgetAmount: data.globalBudgetAmount,
        groupBudgets: data.groupBudgets.length > 0
            ? data.groupBudgets
            : createDefaultGroupBudgets(),
        createdAt: now,
        updatedAt: now
    }

    budgetPlans.set(key, budget)
    return budget
}

export async function updateBudget(userId: string, period: string, data: UpdateBudgetDTO): Promise<BudgetPlan> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const key = getBudgetKey(userId, period)
    const existing = budgetPlans.get(key)

    if (!existing) {
        throw new Error("Budget not found")
    }

    const updated: BudgetPlan = {
        ...existing,
        globalBudgetAmount: data.globalBudgetAmount ?? existing.globalBudgetAmount,
        groupBudgets: data.groupBudgets ?? existing.groupBudgets,
        updatedAt: new Date().toISOString()
    }

    budgetPlans.set(key, updated)
    return updated
}

export async function deleteBudget(userId: string, period: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const key = getBudgetKey(userId, period)
    budgetPlans.delete(key)
}

// =====================
// HELPERS
// =====================

function createDefaultGroupBudgets() {
    return (["essential", "comfort", "superfluous"] as BudgetGroupId[]).map(groupId => ({
        groupId,
        label: BUDGET_GROUP_LABELS[groupId],
        amount: 0
    }))
}

// Create or update budget helper (upsert)
export async function upsertBudget(userId: string, period: string, data: CreateBudgetDTO): Promise<BudgetPlan> {
    const existing = await fetchBudget(userId, period)

    if (existing) {
        return updateBudget(userId, period, {
            globalBudgetAmount: data.globalBudgetAmount,
            groupBudgets: data.groupBudgets
        })
    } else {
        return createBudget(userId, data)
    }
}
