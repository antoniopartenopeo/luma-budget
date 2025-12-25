import { Transaction, CreateTransactionDTO } from "./types"
import { storage } from "@/lib/storage-utils"
import { INITIAL_SEED_TRANSACTIONS } from "@/lib/seed-data"
import { CATEGORIES } from "../../categories/config"
import { parseCurrencyToCents } from "@/lib/currency-utils"

// =====================
// STORAGE SYSTEM
// =====================

const STORAGE_KEY = "luma_transactions_v1"
const DEFAULT_USER_ID = "user-1"

// Private cache to avoid frequent localStorage reads
let _transactionsCache: Transaction[] | null = null

function loadAllFromStorage(): Record<string, Transaction[]> {
    return storage.get(STORAGE_KEY, {})
}

function saveToStorage(allData: Record<string, Transaction[]>): void {
    storage.set(STORAGE_KEY, allData)
}

/**
 * Ensures the cache is populated from storage.
 * Does NOT auto-seed dummy data anymore.
 */
function ensureCache(): Transaction[] {
    if (_transactionsCache !== null) return _transactionsCache

    const allData = loadAllFromStorage()
    const userTransactions = allData[DEFAULT_USER_ID]

    if (userTransactions && Array.isArray(userTransactions)) {
        _transactionsCache = userTransactions
    } else {
        _transactionsCache = []
    }

    return _transactionsCache
}

function syncStorage() {
    if (_transactionsCache === null) return
    const allData = loadAllFromStorage()
    allData[DEFAULT_USER_ID] = _transactionsCache
    saveToStorage(allData)
}

/** @internal - For testing only */
export const __resetTransactionsCache = () => {
    _transactionsCache = null
}

/**
 * Manually seeds the storage with demo data.
 * Can be called from Settings or DevTools.
 */
export function seedTransactions() {
    _transactionsCache = [...INITIAL_SEED_TRANSACTIONS]
    const allData = loadAllFromStorage()
    allData[DEFAULT_USER_ID] = _transactionsCache
    saveToStorage(allData)
}

// =====================
// UTILS
// =====================

// Helper to check rule-based superfluous status
const isSuperfluousRule = (categoryId: string, type: "income" | "expense"): boolean => {
    if (type === "income") return false
    const cat = CATEGORIES.find(c => c.id === categoryId)
    return cat?.spendingNature === "superfluous"
}


// =====================
// API FUNCTIONS
// =====================

export const fetchRecentTransactions = async (): Promise<Transaction[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    const txs = ensureCache()
    // Return sorted by timestamp desc
    return [...txs].sort((a, b) => b.timestamp - a.timestamp)
}

export const fetchTransactions = async (): Promise<Transaction[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const txs = ensureCache()
    return [...txs].sort((a, b) => b.timestamp - a.timestamp)
}

export const createTransaction = async (data: CreateTransactionDTO): Promise<Transaction> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const isIncome = data.type === "income"
    const amount = isIncome ? Math.abs(data.amount) : -Math.abs(data.amount)
    const formattedAmount = isIncome
        ? `+€${amount.toFixed(2)}`
        : `-€${Math.abs(amount).toFixed(2)}`

    // Determine superfluous status
    let isSuperfluous = false
    let classificationSource: "ruleBased" | "manual" = "ruleBased"

    if (data.classificationSource === "manual" && data.isSuperfluous !== undefined) {
        isSuperfluous = data.isSuperfluous
        classificationSource = "manual"
    } else {
        isSuperfluous = isSuperfluousRule(data.categoryId, data.type)
        classificationSource = "ruleBased"
    }

    const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        amount: formattedAmount,
        date: "Adesso",
        description: data.description,
        category: data.category,
        categoryId: data.categoryId,
        icon: isIncome ? "💰" : "🆕",
        type: data.type,
        timestamp: Date.now(),
        isSuperfluous,
        classificationSource
    }

    const txs = ensureCache()
    txs.unshift(newTransaction)
    syncStorage()

    return newTransaction
}

export const getTransactions = () => ensureCache()

export const updateTransaction = async (id: string, data: Partial<CreateTransactionDTO>): Promise<Transaction> => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const txs = ensureCache()
    const index = txs.findIndex((t) => t.id === id)
    if (index === -1) {
        throw new Error("Transaction not found")
    }

    const currentTransaction = txs[index]
    const isIncome = data.type ? data.type === "income" : currentTransaction.type === "income"

    // Recalculate formatted amount if amount or type changed
    let formattedAmount = currentTransaction.amount
    if (data.amount !== undefined || data.type !== undefined) {
        const amountValue = data.amount !== undefined ? data.amount :
            Math.abs(parseCurrencyToCents(currentTransaction.amount)) / 100

        const finalAmount = isIncome ? Math.abs(amountValue) : -Math.abs(amountValue)
        formattedAmount = isIncome
            ? `+€${finalAmount.toFixed(2)}`
            : `-€${Math.abs(finalAmount).toFixed(2)}`
    }

    // Determine superflous logic update
    let isSuperfluous = currentTransaction.isSuperfluous
    let classificationSource = currentTransaction.classificationSource

    if (data.classificationSource === "manual" && data.isSuperfluous !== undefined) {
        isSuperfluous = data.isSuperfluous
        classificationSource = "manual"
    }
    else if ((data.categoryId && data.categoryId !== currentTransaction.categoryId) || (data.type && data.type !== currentTransaction.type)) {
        if (classificationSource === "ruleBased") {
            const newCatId = data.categoryId || currentTransaction.categoryId
            const newType = (data.type || currentTransaction.type) as "income" | "expense"
            isSuperfluous = isSuperfluousRule(newCatId, newType)
        }
    }

    const updatedTransaction: Transaction = {
        ...currentTransaction,
        ...data,
        amount: formattedAmount,
        icon: isIncome ? "💰" : "🆕",
        isSuperfluous,
        classificationSource
    }

    txs[index] = updatedTransaction
    syncStorage()

    return updatedTransaction
}

export const deleteTransaction = async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const txs = ensureCache()
    const index = txs.findIndex((t) => t.id === id)
    if (index !== -1) {
        txs.splice(index, 1)
        syncStorage()
    }
}
