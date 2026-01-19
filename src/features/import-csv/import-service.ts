/**
 * Import Service
 * 
 * Handles:
 * - Bulk transaction creation with importId
 * - Import history tracking
 * - Undo (delete by importId)
 */

import { storage } from "@/lib/storage-utils"
import { Transaction } from "@/features/transactions/api/types"
import type { ImportBatch, PreviewRow } from "./types"

const TRANSACTIONS_KEY = "luma_transactions_v1"
const IMPORT_HISTORY_KEY = "luma_import_history_v1"
const DEFAULT_USER_ID = "user-1"

/**
 * Generates a unique import batch ID
 */
export function generateImportId(): string {
    return `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Bulk creates transactions with a shared importId
 * All-or-nothing: either all succeed or none
 */
export function bulkCreateTransactions(
    rows: PreviewRow[],
    importId: string,
    defaultCategoryId: string,
    defaultCategoryLabel: string
): Transaction[] {
    // Load current transactions
    const allData = storage.get<Record<string, Transaction[]>>(TRANSACTIONS_KEY, {})
    const userTransactions = allData[DEFAULT_USER_ID] || []

    const newTransactions: Transaction[] = rows
        .filter(r => r.isSelected && r.isValid)
        .map((row): Transaction => {
            const categoryId = row.selectedCategoryId || defaultCategoryId
            return {
                id: crypto.randomUUID(),
                amount: "", // Will be formatted by display layer
                amountCents: row.amountCents,
                date: row.date || new Date().toISOString(),
                description: row.description,
                category: defaultCategoryLabel,
                categoryId: categoryId,
                icon: row.type === "income" ? "💰" : "📥",
                type: row.type,
                timestamp: row.date ? new Date(row.date).getTime() : Date.now(),
                isSuperfluous: false,
                classificationSource: "manual",
                importId: importId
            }
        })

    // Prepend new transactions
    allData[DEFAULT_USER_ID] = [...newTransactions, ...userTransactions]
    storage.set(TRANSACTIONS_KEY, allData)

    return newTransactions
}

/**
 * Saves import batch to history
 */
export function saveImportBatch(batch: ImportBatch): void {
    const history = storage.get<ImportBatch[]>(IMPORT_HISTORY_KEY, [])
    history.unshift(batch)
    // Keep only last 20 imports
    storage.set(IMPORT_HISTORY_KEY, history.slice(0, 20))
}

/**
 * Gets import history
 */
export function getImportHistory(): ImportBatch[] {
    return storage.get<ImportBatch[]>(IMPORT_HISTORY_KEY, [])
}

/**
 * Deletes all transactions with a given importId (undo)
 * Returns the number of deleted transactions
 */
export function deleteByImportId(importId: string): number {
    const allData = storage.get<Record<string, Transaction[]>>(TRANSACTIONS_KEY, {})
    const userTransactions = allData[DEFAULT_USER_ID] || []

    const before = userTransactions.length
    const filtered = userTransactions.filter(t => t.importId !== importId)
    const deleted = before - filtered.length

    allData[DEFAULT_USER_ID] = filtered
    storage.set(TRANSACTIONS_KEY, allData)

    // Remove from history
    const history = getImportHistory()
    storage.set(IMPORT_HISTORY_KEY, history.filter(b => b.id !== importId))

    return deleted
}

/**
 * Fetches existing transactions for dedup checking
 */
export function fetchExistingTransactions(): Transaction[] {
    const allData = storage.get<Record<string, Transaction[]>>(TRANSACTIONS_KEY, {})
    return allData[DEFAULT_USER_ID] || []
}
