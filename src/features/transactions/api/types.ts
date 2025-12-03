export type TransactionType = "income" | "expense"

export interface Transaction {
    id: string
    amount: string
    date: string
    description: string
    category: string
    icon: string
    type: TransactionType
    timestamp: number // For sorting
}

export interface CreateTransactionDTO {
    description: string
    amount: number
    category: string
    type: TransactionType
}
