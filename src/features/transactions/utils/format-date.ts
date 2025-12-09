import { Transaction } from "@/features/transactions/api/types"

/**
 * Format a transaction date to DD/MM/YYYY format
 * Uses timestamp field for reliable date parsing
 * This is the single source of truth for date formatting in UI and export
 */
export function formatTransactionDate(transaction: Transaction): string {
    const date = new Date(transaction.timestamp)

    if (isNaN(date.getTime())) {
        // Fallback: return original date string if timestamp is invalid
        return transaction.date
    }

    return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })
}

/**
 * Format a timestamp to DD/MM/YYYY format
 */
export function formatDateFromTimestamp(timestamp: number): string {
    const date = new Date(timestamp)

    if (isNaN(date.getTime())) {
        return ""
    }

    return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })
}
