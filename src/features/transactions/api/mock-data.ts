import { Transaction, CreateTransactionDTO } from "./types"

// Initial mock data
let transactions: Transaction[] = [
    {
        id: "1",
        amount: "-€85.00",
        date: "Oggi, 14:30",
        description: "Spesa Supermercato",
        category: "Cibo",
        icon: "🛒",
        type: "expense",
        timestamp: Date.now(),
    },
    {
        id: "2",
        amount: "-€24.90",
        date: "Ieri, 19:15",
        description: "Netflix Subscription",
        category: "Svago",
        icon: "🎬",
        type: "expense",
        timestamp: Date.now() - 86400000,
    },
    {
        id: "3",
        amount: "+€1,250.00",
        date: "28 Nov, 09:00",
        description: "Stipendio Mensile",
        category: "Entrate",
        icon: "💰",
        type: "income",
        timestamp: Date.now() - 86400000 * 3,
    },
    {
        id: "4",
        amount: "-€45.00",
        date: "27 Nov, 18:30",
        description: "Benzina",
        category: "Trasporti",
        icon: "⛽",
        type: "expense",
        timestamp: Date.now() - 86400000 * 4,
    },
    {
        id: "5",
        amount: "-€120.00",
        date: "25 Nov, 20:00",
        description: "Cena Ristorante",
        category: "Cibo",
        icon: "🍽️",
        type: "expense",
        timestamp: Date.now() - 86400000 * 6,
    },
]

export const fetchRecentTransactions = async (): Promise<Transaction[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    // Return sorted by timestamp desc
    return [...transactions].sort((a, b) => b.timestamp - a.timestamp)
}

export const createTransaction = async (data: CreateTransactionDTO): Promise<Transaction> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate random error
    if (Math.random() < 0.1) {
        throw new Error("Failed to create transaction")
    }

    const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        amount: `-€${data.amount.toFixed(2)}`,
        date: "Adesso",
        description: data.description,
        category: data.category,
        icon: "🆕", // Simplified icon logic
        type: "expense",
        timestamp: Date.now(),
    }

    transactions = [newTransaction, ...transactions]
    return newTransaction
}
