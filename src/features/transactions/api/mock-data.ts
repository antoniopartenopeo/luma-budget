import { Transaction, CreateTransactionDTO } from "./types"

// Initial mock data
import { CATEGORIES } from "../../categories/config"

// =====================
// STORAGE SYSTEM
// =====================

const STORAGE_KEY = "luma_transactions_v1"
const DEFAULT_USER_ID = "user-1"

// Private cache to avoid frequent localStorage reads
let _transactionsCache: Transaction[] | null = null

function isStorageAvailable(): boolean {
    return typeof window !== "undefined" && !!window.localStorage
}

function loadAllFromStorage(): Record<string, Transaction[]> {
    if (!isStorageAvailable()) return {}
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : {}
    } catch (e) {
        console.error("Failed to load transactions from storage", e)
        return {}
    }
}

function saveToStorage(allData: Record<string, Transaction[]>): void {
    if (!isStorageAvailable()) return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData))
    } catch (e) {
        console.error("Failed to save transactions to storage", e)
    }
}

/**
 * Ensures the cache is populated from storage, or seeded if empty.
 */
function ensureCache(): Transaction[] {
    if (_transactionsCache !== null) return _transactionsCache

    const allData = loadAllFromStorage()
    const userTransactions = allData[DEFAULT_USER_ID]

    if (userTransactions && Array.isArray(userTransactions)) {
        _transactionsCache = userTransactions
    } else {
        // SEED: Initialize with mock data if not found
        _transactionsCache = [...INITIAL_MOCK_TRANSACTIONS]
        allData[DEFAULT_USER_ID] = _transactionsCache
        saveToStorage(allData)
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

// =====================
// UTILS
// =====================

// Helper to check rule-based superfluous status
const isSuperfluousRule = (categoryId: string, type: "income" | "expense"): boolean => {
    if (type === "income") return false
    const cat = CATEGORIES.find(c => c.id === categoryId)
    return cat?.spendingNature === "superfluous"
}

// Initial mock data
const INITIAL_MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: "1",
        amount: "-€85.00",
        date: "Oggi, 14:30",
        description: "Spesa Supermercato",
        category: "Cibo",
        categoryId: "cibo",
        icon: "🛒",
        type: "expense",
        timestamp: Date.now(),
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
    {
        id: "2",
        amount: "-€24.90",
        date: "Ieri, 19:15",
        description: "Netflix Subscription",
        category: "Svago",
        categoryId: "svago",
        icon: "🎬",
        type: "expense",
        timestamp: Date.now() - 86400000,
        isSuperfluous: true,
        classificationSource: "ruleBased"
    },
    {
        id: "3",
        amount: "+€1,250.00",
        date: "28 Nov, 09:00",
        description: "Stipendio Mensile",
        category: "Entrate",
        categoryId: "altro", // Fallback for income usually
        icon: "💰",
        type: "income",
        timestamp: Date.now() - 86400000 * 3,
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
    {
        id: "4",
        amount: "-€45.00",
        date: "27 Nov, 18:30",
        description: "Benzina",
        category: "Trasporti",
        categoryId: "trasporti",
        icon: "⛽",
        type: "expense",
        timestamp: Date.now() - 86400000 * 4,
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
    {
        id: "5",
        amount: "-€120.00",
        date: "25 Nov, 20:00",
        description: "Cena Ristorante",
        category: "Cibo",
        categoryId: "cibo",
        icon: "🍽️",
        type: "expense",
        timestamp: Date.now() - 86400000 * 6,
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
    {
        id: "6",
        amount: "-€300.00",
        date: "15 Ago, 10:00",
        description: "Hotel Vacanze",
        category: "Viaggi",
        categoryId: "viaggi",
        icon: "🏨",
        type: "expense",
        timestamp: Date.now() - 86400000 * 115,
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
    {
        id: "7",
        amount: "-€50.00",
        date: "10 Apr, 12:00",
        description: "Regalo",
        category: "Shopping",
        categoryId: "shopping",
        icon: "🎁",
        type: "expense",
        timestamp: Date.now() - 86400000 * 240,
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
    {
        id: "8",
        amount: "-€150.00",
        date: "5 Gen, 09:00",
        description: "Abbonamento Palestra Annuale",
        category: "Salute",
        categoryId: "salute",
        icon: "💪",
        type: "expense",
        timestamp: Date.now() - 86400000 * 330,
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
]

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

    // Simulate random error
    if (Math.random() < 0.1) {
        throw new Error("Failed to create transaction")
    }

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
            parseFloat(currentTransaction.amount.replace(/[^0-9.]/g, ''))

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
