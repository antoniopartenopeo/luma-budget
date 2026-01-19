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

/** Merchant/Pattern group for bulk categorization */
export interface MerchantGroup {
    patternKey: string          // Primary grouping key (pattern-based)
    merchantKey: string         // Fallback/display key (first 3 words)
    isFallback: boolean         // True if patternKey fell back to merchantKey
    displayName: string         // Human-readable merchant name
    rowIndices: number[]        // Indices of rows in this group
    totalAmountCents: number    // Sum of amounts (signed: negative for expense)
    count: number               // Number of transactions
    type: TransactionType       // income or expense
    sampleDescriptions: string[] // First 3 original descriptions
    assignedCategoryId: string  // Currently assigned category
}

// ============================================================================
// V2 GROUPING TYPES (PR1)
// ============================================================================

/**
 * Subgroup of transactions with identical amount within a MerchantGroup.
 * Used for identifying recurring charges (subscriptions, etc.)
 */
export interface AmountSubgroup {
    amountCents: number         // Uniform amount (absolute value)
    rowIndices: number[]        // Row indices with this exact amount
    count: number               // Number of rows
    isSplit: boolean            // True if user "split" this for independent categorization
}

/**
 * Extended MerchantGroup with subgroups, significance, and group-level selection.
 * 
 * Convention:
 * - totalAmountCents: signed (negative for expense, positive for income)
 * - totalAbsCents: absolute value, used for sorting and significance
 */
export interface MerchantGroupV2 extends MerchantGroup {
    subgroups: AmountSubgroup[]  // Clusters by identical amount (count >= MIN_DUP_COUNT)
    totalAbsCents: number        // Absolute total for sorting/significance
    isSignificant: boolean       // True if totalAbsCents >= threshold
    isGroupSelected: boolean     // Group-level inclusion (default: isSignificant)
}

/**
 * Result of computeGroupsV2 - pre-separated by type for UI convenience
 */
export interface GroupsV2Result {
    income: MerchantGroupV2[]    // Sorted by totalAbsCents desc
    expense: MerchantGroupV2[]   // Sorted by totalAbsCents desc
    all: MerchantGroupV2[]       // Combined, expense first then income
}

// ============================================================================
// GROUPING CONSTANTS
// ============================================================================

/** Minimum identical-amount rows to form a subgroup */
export const MIN_DUP_COUNT = 2

/** Default significance threshold in cents (€50.00) */
export const DEFAULT_SIGNIFICANCE_THRESHOLD_CENTS = 5000

/** Significance strategy options */
export type SignificanceStrategy = "threshold" | "topN"
