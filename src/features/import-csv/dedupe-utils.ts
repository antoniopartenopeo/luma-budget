/**
 * Deduplication Utilities
 * 
 * Deterministic deduplication based on:
 * - Date (±1 day tolerance)
 * - Normalized description
 * - Amount in cents
 * 
 * V2: Optimized with Set for O(n+m) instead of O(n×m)
 */

import { Transaction } from "@/features/transactions/api/types"
import type { ParsedCSVRow } from "./types"

/**
 * Normalizes a description for comparison
 * Removes common variations, lowercase, trim
 */
export function normalizeDescription(desc: string): string {
    return desc
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[^\w\s]/g, "")
        .trim()
}

/**
 * Generates a dedup key for a transaction
 * Format: "YYYY-MM-DD|normalizedDesc|amountCents"
 */
export function generateDedupKey(
    date: string,
    description: string,
    amountCents: number
): string {
    const dateOnly = date.slice(0, 10) // YYYY-MM-DD
    const normalizedDesc = normalizeDescription(description)
    return `${dateOnly}|${normalizedDesc}|${Math.abs(amountCents)}`
}

/**
 * Generates dedup keys for ±1 day tolerance
 */
export function generateDedupKeysWithTolerance(
    date: string,
    description: string,
    amountCents: number
): string[] {
    const baseDate = new Date(date)
    const keys: string[] = []

    for (let offset = -1; offset <= 1; offset++) {
        const d = new Date(baseDate)
        d.setDate(d.getDate() + offset)
        const iso = d.toISOString().slice(0, 10)
        keys.push(generateDedupKey(iso, description, amountCents))
    }

    return keys
}

/**
 * Builds a Set of dedup keys from existing transactions
 * Pre-compute once, use for O(1) lookups
 */
export function buildExistingKeysSet(transactions: Transaction[]): Set<string> {
    const keys = new Set<string>()
    for (const tx of transactions) {
        keys.add(generateDedupKey(tx.date, tx.description, tx.amountCents))
    }
    return keys
}

/**
 * Builds a Map of dedup keys to transaction info for detailed matching
 */
export function buildExistingKeysMap(transactions: Transaction[]): Map<string, Transaction> {
    const map = new Map<string, Transaction>()
    for (const tx of transactions) {
        const key = generateDedupKey(tx.date, tx.description, tx.amountCents)
        if (!map.has(key)) {
            map.set(key, tx)
        }
    }
    return map
}

/**
 * Checks if a parsed row is a duplicate using pre-built Set (O(1) per row)
 * DEPRECATED: Use checkDuplicateWithMap for detailed reason
 */
export function checkDuplicateFast(
    row: ParsedCSVRow,
    existingKeysSet: Set<string>
): boolean {
    if (!row.date) return false

    const rowKeys = generateDedupKeysWithTolerance(
        row.date,
        row.description,
        row.amountCents
    )

    return rowKeys.some(key => existingKeysSet.has(key))
}

/**
 * Checks if a parsed row is a duplicate using pre-built Map
 * Returns the matching transaction for detailed reason
 */
export function checkDuplicateWithMap(
    row: ParsedCSVRow,
    existingKeysMap: Map<string, Transaction>
): { isDuplicate: boolean; reason?: string; matchedTx?: Transaction } {
    if (!row.date) {
        return { isDuplicate: false }
    }

    const rowKeys = generateDedupKeysWithTolerance(
        row.date,
        row.description,
        row.amountCents
    )

    for (const key of rowKeys) {
        const matchedTx = existingKeysMap.get(key)
        if (matchedTx) {
            return {
                isDuplicate: true,
                matchedTx,
                reason: `Transazione simile trovata: "${matchedTx.description}" del ${matchedTx.date.slice(0, 10)} (${matchedTx.amountCents / 100}€)`
            }
        }
    }

    return { isDuplicate: false }
}

/**
 * OLD API: Checks if a parsed row is a duplicate of existing transactions
 * Kept for backward compatibility, but calls optimized version
 */
export function checkDuplicate(
    row: ParsedCSVRow,
    existingTransactions: Transaction[]
): { isDuplicate: boolean; reason?: string } {
    // Build map on-the-fly (less efficient but backward compatible)
    const map = buildExistingKeysMap(existingTransactions)
    const result = checkDuplicateWithMap(row, map)
    return { isDuplicate: result.isDuplicate, reason: result.reason }
}

/**
 * Checks for duplicates within the import batch itself
 */
export function checkInternalDuplicates(rows: ParsedCSVRow[]): Map<number, string> {
    const seen = new Map<string, number>() // key -> first rowIndex
    const duplicates = new Map<number, string>() // rowIndex -> reason

    for (const row of rows) {
        if (!row.date) continue

        const key = generateDedupKey(row.date, row.description, row.amountCents)
        const existingIdx = seen.get(key)

        if (existingIdx !== undefined) {
            duplicates.set(row.rowIndex, `Duplicato interno (riga ${existingIdx})`)
        } else {
            seen.set(key, row.rowIndex)
        }
    }

    return duplicates
}
