export type TransactionType = "income" | "expense"

export interface Transaction {
    id: string
    /** @deprecated Use amountCents for logic/formatting. Kept for display shim only. */
    amount: string
    amountCents: number // Integer, absolute value, mandatory
    date: string
    description: string
    category: string // Label, kept for display compatibility
    categoryId: string // ID for filtering and logic
    icon: string
    type: TransactionType
    isSuperfluous?: boolean
    classificationSource?: "ruleBased" | "manual" | "ai"
    timestamp: number // For sorting
}

export interface CreateTransactionDTO {
    description: string
    /** @deprecated Use amountCents. Fallback to this will follow rounding rules. */
    amount?: number
    amountCents: number // Mandatory in DTO for new records
    category: string // Label
    categoryId: string // ID
    type: TransactionType
    isSuperfluous?: boolean
    classificationSource?: "ruleBased" | "manual" | "ai"
}
