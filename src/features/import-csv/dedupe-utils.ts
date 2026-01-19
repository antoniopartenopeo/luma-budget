/**
 * Deduplication Utilities
 * 
 * Deterministic deduplication based on:
 * - Date (±1 day tolerance)
 * - Normalized description
 * - Amount in cents
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
 * Checks if a parsed row is a duplicate of existing transactions
 * Returns the reason if duplicate, null otherwise
 */
export function checkDuplicate(
    row: ParsedCSVRow,
    existingTransactions: Transaction[]
): { isDuplicate: boolean; reason?: string } {
    if (!row.date) {
        return { isDuplicate: false }
    }

    // Generate keys for this row (with tolerance)
    const rowKeys = generateDedupKeysWithTolerance(
        row.date,
        row.description,
        row.amountCents
    )

    // Build set of existing keys
    for (const tx of existingTransactions) {
        const txKey = generateDedupKey(tx.date, tx.description, tx.amountCents)
        if (rowKeys.includes(txKey)) {
            return {
                isDuplicate: true,
                reason: `Transazione simile trovata: "${tx.description}" del ${tx.date.slice(0, 10)} (${tx.amountCents / 100}€)`
            }
        }
    }

    return { isDuplicate: false }
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
