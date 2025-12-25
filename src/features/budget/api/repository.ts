import { BudgetPlan, CreateBudgetDTO, UpdateBudgetDTO, BUDGET_GROUP_LABELS, BudgetGroupId } from "./types"
import { storage } from "@/lib/storage-utils"

// =====================
// STORAGE HELPERS
// =====================

const STORAGE_KEY = "luma_budget_plans_v1"

// Helper to create budget key from userId and period
function getBudgetKey(userId: string, period: string): string {
    return `${userId}:${period}`
}

function loadFromStorage(): Record<string, BudgetPlan> {
    return storage.get(STORAGE_KEY, {})
}

function saveToStorage(data: Record<string, BudgetPlan>): void {
    storage.set(STORAGE_KEY, data)
}

// =====================
// API FUNCTIONS
// =====================

export async function fetchBudget(userId: string, period: string): Promise<BudgetPlan | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200))

    const plans = loadFromStorage()
    const key = getBudgetKey(userId, period)
    return plans[key] || null
}

export async function createBudget(userId: string, data: CreateBudgetDTO): Promise<BudgetPlan> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const plans = loadFromStorage()
    const key = getBudgetKey(userId, data.period)

    // Check if already exists
    if (plans[key]) {
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

    plans[key] = budget
    saveToStorage(plans)
    return budget
}

export async function updateBudget(userId: string, period: string, data: UpdateBudgetDTO): Promise<BudgetPlan> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const plans = loadFromStorage()
    const key = getBudgetKey(userId, period)
    const existing = plans[key]

    if (!existing) {
        throw new Error("Budget not found")
    }

    const updated: BudgetPlan = {
        ...existing,
        globalBudgetAmount: data.globalBudgetAmount ?? existing.globalBudgetAmount,
        groupBudgets: data.groupBudgets ?? existing.groupBudgets,
        updatedAt: new Date().toISOString()
    }

    plans[key] = updated
    saveToStorage(plans)
    return updated
}

export async function deleteBudget(userId: string, period: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const plans = loadFromStorage()
    const key = getBudgetKey(userId, period)
    delete plans[key]
    saveToStorage(plans)
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
