export type TransactionType = "income" | "expense"

export interface Transaction {
    id: string
    amount: string
    amountCents?: number // Integer, absolute value
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
    amount?: number // Legacy float amount
    amountCents?: number // New integer cents (absolute value)
    category: string // Label
    categoryId: string // ID
    type: TransactionType
    isSuperfluous?: boolean
    classificationSource?: "ruleBased" | "manual" | "ai"
}
