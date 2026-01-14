import { Transaction, CreateTransactionDTO } from "./types"
import { storage } from "@/lib/storage-utils"
import { CATEGORIES } from "../../categories/config"
import { parseCurrencyToCents, normalizeTransactionAmount, euroToCents, formatCentsSignedFromType } from "@/lib/currency-utils"
import { delay } from "@/lib/delay"

// =====================
// STORAGE SYSTEM
// =====================

const STORAGE_KEY = "luma_transactions_v1"
const DEFAULT_USER_ID = "user-1"

/**
 * Initial mock data for development and demo purposes.
 */
export const INITIAL_SEED_TRANSACTIONS: Transaction[] = [
    {
        id: "1",
        amount: "-€85.00",
        amountCents: 8500,
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
        amountCents: 2490,
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
        amountCents: 125000,
        date: "28 Nov, 09:00",
        description: "Stipendio Mensile",
        category: "Entrate",
        categoryId: "altro",
        icon: "💰",
        type: "income",
        timestamp: Date.now() - 86400000 * 3,
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
    {
        id: "4",
        amount: "-€45.00",
        amountCents: 4500,
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
        amountCents: 12000,
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
        amountCents: 30000,
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
        amountCents: 5000,
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
        amountCents: 15000,
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
 * Normalizes transactions on load (backfill amountCents).
 */
function ensureCache(): Transaction[] {
    if (_transactionsCache !== null) return _transactionsCache

    const allData = loadAllFromStorage()
    const userTransactions = allData[DEFAULT_USER_ID]

    if (userTransactions && Array.isArray(userTransactions)) {
        let didChange = false
        // BACKFILL: Normalize on read and detect if persistence is needed
        // Robust handling of legacy formats (number, string, missing cents)
        const normalized = userTransactions.map(t => {
            const raw = t as Transaction & { amount?: number | string }

            // 1. Check if already migrated
            if (raw.amountCents !== undefined && typeof raw.amountCents === 'number') {
                return raw as Transaction
            }

            // 2. Resolve amountCents from any legacy source
            let absCents: number
            if (raw.amount !== undefined) {
                if (typeof raw.amount === 'number') {
                    // Legacy float: format 12.34
                    absCents = Math.abs(Math.round(raw.amount * 100))
                } else if (typeof raw.amount === 'string') {
                    // Legacy string: format "€ 10.50"
                    absCents = Math.abs(parseCurrencyToCents(raw.amount))
                } else {
                    absCents = 0
                }
            } else {
                absCents = 0
            }

            didChange = true

            // Normalize to full Transaction structure
            const normalizedT: Transaction = {
                ...raw,
                amountCents: absCents,
                // Regenerate amount string only if it was a number before or missing
                amount: (typeof raw.amount === 'string' && raw.amount.includes('€'))
                    ? raw.amount
                    : formatCentsSignedFromType(absCents, raw.type)
            }
            return normalizedT
        })

        _transactionsCache = normalized

        // If changes were detected (e.g. legacy data without amountCents), persist back immediately
        if (didChange) {
            syncStorage()
        }
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
    _transactionsCache = [...INITIAL_SEED_TRANSACTIONS].map(t => normalizeTransactionAmount(t))
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
    await delay(800)
    const txs = ensureCache()
    // Return sorted by timestamp desc
    return [...txs].sort((a, b) => b.timestamp - a.timestamp)
}

export const fetchTransactions = async (): Promise<Transaction[]> => {
    await delay(800)
    const txs = ensureCache()
    return [...txs].sort((a, b) => b.timestamp - a.timestamp)
}

/**
 * Generates a unique ID for a transaction.
 * Uses crypto.randomUUID() if available, with a robust fallback.
 */
function generateTransactionId(): string {
    if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID()
    }
    // Fallback logic compatible with previous format (9 chars alfanum)
    return Math.random().toString(36).substring(2, 11)
}

export const createTransaction = async (data: CreateTransactionDTO): Promise<Transaction> => {
    await delay(1000)

    const isIncome = data.type === "income"
    // Source of truth: Cents. Prioritize amountCents from DTO.
    // For new records, we strictly use amountCents.
    const amountCents = Math.abs(Math.round(data.amountCents || 0))

    // Derived string for display only - we won't strictly depend on it for logic
    const formattedAmount = formatCentsSignedFromType(amountCents, data.type)

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
        id: generateTransactionId(),
        amount: formattedAmount,
        amountCents: amountCents, // Persist integer cents
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

export const updateTransaction = async (id: string, data: Partial<CreateTransactionDTO>): Promise<Transaction> => {
    await delay(800)

    const txs = ensureCache()
    const index = txs.findIndex((t) => t.id === id)
    if (index === -1) {
        throw new Error("Transaction not found")
    }

    const currentTransaction = txs[index]
    const nextType = data.type !== undefined ? data.type : currentTransaction.type
    const isIncome = nextType === "income"

    // Recalculate amounts if needed
    let amountCents = currentTransaction.amountCents

    if (data.amountCents !== undefined) {
        amountCents = Math.abs(Math.round(data.amountCents))
    } else if (data.amount !== undefined && typeof data.amount === 'number') {
        // Fallback for partial updates if legacy code still sends float 'amount'
        amountCents = euroToCents(Math.abs(data.amount))
    }

    const formattedAmount = formatCentsSignedFromType(amountCents, nextType)

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
        amountCents: amountCents, // Persist updated cents
        icon: isIncome ? "💰" : "🆕",
        isSuperfluous,
        classificationSource
    }

    txs[index] = updatedTransaction
    syncStorage()

    return updatedTransaction
}

export const deleteTransaction = async (id: string): Promise<void> => {
    await delay(800)

    const txs = ensureCache()
    const index = txs.findIndex((t) => t.id === id)
    if (index !== -1) {
        txs.splice(index, 1)
        syncStorage()
    }
}
