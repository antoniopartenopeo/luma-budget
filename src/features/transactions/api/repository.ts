import { Transaction, CreateTransactionDTO } from "./types"
import { storage } from "@/lib/storage-utils"
import { getCategoryById } from "../../categories/config"
import { getCategories } from "../../categories/api/repository"
import { parseCurrencyToCents } from "@/domain/money"
import { normalizeTransactionAmount, calculateSuperfluousStatus } from "@/domain/transactions"


// =====================
// STORAGE SYSTEM
// =====================

const STORAGE_KEY = "luma_transactions_v1"
const DEFAULT_USER_ID = "user-1"

import { INITIAL_SEED_TRANSACTIONS } from "./seed-data"




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
            const normalizedT = normalizeTransactionAmount(t as unknown as Record<string, unknown>)
            if (normalizedT.amountCents !== (t as unknown as Record<string, unknown>).amountCents) {
                didChange = true
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
    _transactionsCache = [...INITIAL_SEED_TRANSACTIONS].map(t => normalizeTransactionAmount(t as unknown as Record<string, unknown>))
    const allData = loadAllFromStorage()
    allData[DEFAULT_USER_ID] = _transactionsCache
    saveToStorage(allData)
}

// =====================
// UTILS
// =====================

// Migrated to domain/transactions/utils.ts


// =====================
// API FUNCTIONS
// =====================

export const fetchRecentTransactions = async (): Promise<Transaction[]> => {
    // Simulate network delay

    const txs = ensureCache()
    // Return sorted by timestamp desc
    return [...txs].sort((a, b) => b.timestamp - a.timestamp)
}

export const fetchTransactions = async (): Promise<Transaction[]> => {

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


    // const isIncome = data.type === "income"
    // Source of truth: Cents. Prioritize amountCents from DTO.
    // For new records, we strictly use amountCents.
    const amountCents = Math.abs(Math.round(data.amountCents || 0))

    // Determine superfluous status
    let isSuperfluous = false
    let classificationSource: "ruleBased" | "manual" = "ruleBased"

    const categories = await getCategories()
    if (data.classificationSource === "manual" && data.isSuperfluous !== undefined) {
        isSuperfluous = data.isSuperfluous
        classificationSource = "manual"
    } else {
        isSuperfluous = calculateSuperfluousStatus(data.categoryId, data.type, categories)
        classificationSource = "ruleBased"
    }

    const newTransaction: Transaction = {
        id: generateTransactionId(),
        amountCents: amountCents, // Persist integer cents
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(), // Use provided date or now
        description: data.description,
        category: data.category,
        categoryId: data.categoryId,
        type: data.type,
        timestamp: data.date ? new Date(data.date).getTime() : Date.now(),
        isSuperfluous,
        classificationSource
    }

    const txs = ensureCache()
    txs.unshift(newTransaction)
    syncStorage()

    return newTransaction
}

export const createBatchTransactions = async (dataList: CreateTransactionDTO[]): Promise<Transaction[]> => {
    const categories = await getCategories()


    const newTransactions: Transaction[] = dataList.map(data => {
        // const isIncome = data.type === "income"
        const amountCents = Math.abs(Math.round(data.amountCents || 0))

        // Superfluous logic
        let isSuperfluous = false
        let classificationSource: "ruleBased" | "manual" = "ruleBased"

        if (data.classificationSource === "manual" && data.isSuperfluous !== undefined) {
            isSuperfluous = data.isSuperfluous
            classificationSource = "manual"
        } else {
            // NOTE: In a real batch, we should probably fetch categories once outside the loop.
            // But getCategories() has a cache, so it's fine. 
            // However, to be cleaner, we should have fetched it once.
            // Let's optimize: fetch once outside the map.
            isSuperfluous = calculateSuperfluousStatus(data.categoryId, data.type, categories)
            classificationSource = "ruleBased"
        }

        return {
            id: generateTransactionId(),
            amountCents,
            date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
            description: data.description,
            category: data.category,
            categoryId: data.categoryId,
            type: data.type,
            timestamp: data.date ? new Date(data.date).getTime() : Date.now(),
            isSuperfluous,
            classificationSource
        }
    })

    const txs = ensureCache()
    // Prepend all new transactions
    txs.unshift(...newTransactions)
    syncStorage()

    return newTransactions
}

export const updateTransaction = async (id: string, data: Partial<CreateTransactionDTO>): Promise<Transaction> => {


    const txs = ensureCache()
    const index = txs.findIndex((t) => t.id === id)
    if (index === -1) {
        throw new Error("Transaction not found")
    }

    const currentTransaction = txs[index]
    const nextType = data.type !== undefined ? data.type : currentTransaction.type
    // const isIncome = nextType === "income"

    // Recalculate amounts if needed
    let amountCents = currentTransaction.amountCents

    if (data.amountCents !== undefined) {
        amountCents = Math.abs(Math.round(data.amountCents))
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
            const categories = await getCategories()
            const newCatId = data.categoryId || currentTransaction.categoryId
            const newType = (data.type || currentTransaction.type) as "income" | "expense"
            isSuperfluous = calculateSuperfluousStatus(newCatId, newType, categories)
        }
    }

    const updatedTransaction: Transaction = {
        ...currentTransaction,
        ...data,
        // Update date/timestamp only if new date provided
        date: data.date ? new Date(data.date).toISOString() : currentTransaction.date,
        timestamp: data.date ? new Date(data.date).getTime() : currentTransaction.timestamp,
        amountCents: amountCents, // Persist updated cents
        isSuperfluous,
        classificationSource
    } as Transaction

    txs[index] = updatedTransaction
    syncStorage()

    return updatedTransaction
}

export const deleteTransaction = async (id: string): Promise<void> => {


    const txs = ensureCache()
    const index = txs.findIndex((t) => t.id === id)
    if (index !== -1) {
        txs.splice(index, 1)
        syncStorage()
    }
}
