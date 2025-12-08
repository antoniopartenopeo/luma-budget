export type TransactionType = "income" | "expense"

export interface Transaction {
    id: string
    amount: string
    date: string
    description: string
    category: string // Label, kept for display compatibility
    categoryId: string // ID for filtering and logic
    icon: string
    type: TransactionType
    timestamp: number // For sorting
}

export interface CreateTransactionDTO {
    description: string
    amount: number
    category: string // Label
    categoryId: string // ID
    type: TransactionType
}
