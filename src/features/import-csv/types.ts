/**
 * CSV Import Feature Types
 */

import { TransactionType } from "@/features/transactions/api/types"

/** Represents a single row parsed from CSV */
export interface ParsedCSVRow {
    rowIndex: number
    date: string | null // ISO string or null if unparseable
    description: string
    amountCents: number // Signed: negative for expense, positive for income
    type: TransactionType
    rawValues: Record<string, string> // Original CSV values for debugging
    parseErrors: string[] // List of parsing issues
}

/** Column mapping configuration */
export interface ColumnMapping {
    date: string | null
    description: string | null
    amount: string | null // Single amount column (signed)
    debit: string | null // Debit column (expense, positive = outgoing)
    credit: string | null // Credit column (income, positive = incoming)
}

/** Detected CSV format */
export interface CSVFormat {
    separator: "," | ";"
    hasHeader: boolean
    headers: string[]
    sampleRows: string[][]
}

/** Import preview row with validation and dedup status */
export interface PreviewRow extends ParsedCSVRow {
    isValid: boolean
    isDuplicate: boolean
    duplicateReason?: string
    selectedCategoryId: string
    isSelected: boolean // User can toggle inclusion
}

/** Import batch record for history/undo */
export interface ImportBatch {
    id: string
    importedAt: string // ISO
    filename: string
    transactionCount: number
}

/** State for column mapping step */
export interface MappingState {
    mapping: ColumnMapping
    dateFormat: "auto" | "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"
    amountFormat: "single" | "split" // single = one column, split = debit/credit
}
