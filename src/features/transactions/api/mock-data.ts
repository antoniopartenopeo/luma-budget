import { Transaction, CreateTransactionDTO } from "./types"

// Initial mock data
import { CATEGORIES } from "../../categories/config"

// Helper to check rule-based superfluous status
const isSuperfluousRule = (categoryId: string, type: "income" | "expense"): boolean => {
    if (type === "income") return false
    const cat = CATEGORIES.find(c => c.id === categoryId)
    return cat?.spendingNature === "superfluous"
}

// Initial mock data with migration applied
const transactions: Transaction[] = [
    {
        id: "1",
        amount: "-€85.00",
        date: "Oggi, 14:30",
        description: "Spesa Supermercato",
        category: "Cibo",
        categoryId: "cibo",
        icon: "🛒",
        type: "expense",
        timestamp: Date.now(),
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
    {
        id: "2",
        amount: "-€24.90",
        date: "Ieri, 19:15",
        description: "Netflix Subscription",
        category: "Svago",
        categoryId: "svago",
        icon: "🎬",
        type: "expense",
        timestamp: Date.now() - 86400000,
        isSuperfluous: true,
        classificationSource: "ruleBased"
    },
    {
        id: "3",
        amount: "+€1,250.00",
        date: "28 Nov, 09:00",
        description: "Stipendio Mensile",
        category: "Entrate",
        categoryId: "altro", // Fallback for income usually
        icon: "💰",
        type: "income",
        timestamp: Date.now() - 86400000 * 3,
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
    {
        id: "4",
        amount: "-€45.00",
        date: "27 Nov, 18:30",
        description: "Benzina",
        category: "Trasporti",
        categoryId: "trasporti",
        icon: "⛽",
        type: "expense",
        timestamp: Date.now() - 86400000 * 4,
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
    {
        id: "5",
        amount: "-€120.00",
        date: "25 Nov, 20:00",
        description: "Cena Ristorante",
        category: "Cibo",
        categoryId: "cibo",
        icon: "🍽️",
        type: "expense",
        timestamp: Date.now() - 86400000 * 6,
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
    {
        id: "6",
        amount: "-€300.00",
        date: "15 Ago, 10:00",
        description: "Hotel Vacanze",
        category: "Viaggi",
        categoryId: "viaggi", // Assuming category exists
        icon: "🏨",
        type: "expense",
        timestamp: Date.now() - 86400000 * 115, // ~3-4 months ago
        isSuperfluous: false, // RuleBased: Viaggi is Comfort, not Superfluous by default
        classificationSource: "ruleBased"
    },
    {
        id: "7",
        amount: "-€50.00",
        date: "10 Apr, 12:00",
        description: "Regalo",
        category: "Shopping",
        categoryId: "shopping",
        icon: "🎁",
        type: "expense",
        timestamp: Date.now() - 86400000 * 240, // ~8 months ago
        isSuperfluous: false, // RuleBased: Shopping is Comfort
        classificationSource: "ruleBased"
    },
    {
        id: "8",
        amount: "-€150.00",
        date: "5 Gen, 09:00",
        description: "Abbonamento Palestra Annuale",
        category: "Salute",
        categoryId: "salute",
        icon: "💪",
        type: "expense",
        timestamp: Date.now() - 86400000 * 330, // ~11 months ago
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
]

export const fetchRecentTransactions = async (): Promise<Transaction[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    // Return sorted by timestamp desc
    return [...transactions].sort((a, b) => b.timestamp - a.timestamp)
}

export const fetchTransactions = async (): Promise<Transaction[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return [...transactions].sort((a, b) => b.timestamp - a.timestamp)
}

export const createTransaction = async (data: CreateTransactionDTO): Promise<Transaction> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate random error
    if (Math.random() < 0.1) {
        throw new Error("Failed to create transaction")
    }

    const isIncome = data.type === "income"
    const amount = isIncome ? Math.abs(data.amount) : -Math.abs(data.amount)
    const formattedAmount = isIncome
        ? `+€${amount.toFixed(2)}`
        : `-€${Math.abs(amount).toFixed(2)}`

    // Determine superfluous status
    // If manually passed (e.g. from form override), respect it.
    // Else apply rule.
    let isSuperfluous = false
    let classificationSource: "ruleBased" | "manual" = "ruleBased"

    if (data.classificationSource === "manual" && data.isSuperfluous !== undefined) {
        isSuperfluous = data.isSuperfluous
        classificationSource = "manual"
    } else {
        isSuperfluous = isSuperfluousRule(data.categoryId, data.type)
        classificationSource = "ruleBased"
    }

    const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        amount: formattedAmount,
        date: "Adesso",
        description: data.description,
        category: data.category,
        categoryId: data.categoryId, // Save ID
        icon: isIncome ? "💰" : "🆕",
        type: data.type,
        timestamp: Date.now(),
        isSuperfluous,
        classificationSource
    }

    transactions.unshift(newTransaction)
    return newTransaction
}

export const getTransactions = () => transactions

export const updateTransaction = async (id: string, data: Partial<CreateTransactionDTO>): Promise<Transaction> => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const index = transactions.findIndex((t) => t.id === id)
    if (index === -1) {
        throw new Error("Transaction not found")
    }

    const currentTransaction = transactions[index]
    const isIncome = data.type ? data.type === "income" : currentTransaction.type === "income"

    // Recalculate formatted amount if amount or type changed
    let formattedAmount = currentTransaction.amount
    if (data.amount !== undefined || data.type !== undefined) {
        const amountValue = data.amount !== undefined ? data.amount :
            parseFloat(currentTransaction.amount.replace(/[^0-9.]/g, ''))

        const finalAmount = isIncome ? Math.abs(amountValue) : -Math.abs(amountValue)
        formattedAmount = isIncome
            ? `+€${finalAmount.toFixed(2)}`
            : `-€${Math.abs(finalAmount).toFixed(2)}`
    }

    // Determine superflous logic update
    let isSuperfluous = currentTransaction.isSuperfluous
    let classificationSource = currentTransaction.classificationSource

    // If manual override passed
    if (data.classificationSource === "manual" && data.isSuperfluous !== undefined) {
        isSuperfluous = data.isSuperfluous
        classificationSource = "manual"
    }
    // Else if category or type changed, re-evaluate rule IF source was ruleBased
    else if ((data.categoryId && data.categoryId !== currentTransaction.categoryId) || (data.type && data.type !== currentTransaction.type)) {
        // Only re-apply rule if it was rule-based previously, or if we want to reset it?
        // Requirement says "manual override" persists. 
        // But if I change category from "Svago" (Superfluous) to "Cibo" (Essential), keeping it Superfluous might be wrong unless user explicitly set it.
        // Let's adopt a "smart reset": if sensitive fields change, we might revert to rule unless we truly track "user locked".
        // For MVP: if source was "manual", KEEP IT as is unless user changed the flag manually too.
        // If source was "ruleBased", re-run rule.
        if (classificationSource === "ruleBased") {
            const newCatId = data.categoryId || currentTransaction.categoryId
            const newType = (data.type || currentTransaction.type) as "income" | "expense"
            isSuperfluous = isSuperfluousRule(newCatId, newType)
        }
    }

    const updatedTransaction: Transaction = {
        ...currentTransaction,
        ...data,
        amount: formattedAmount,
        icon: isIncome ? "💰" : "🆕",
        isSuperfluous,
        classificationSource
        // Keep date and timestamp unless passed (which we usually don't for edit in this simple app)
    }

    transactions[index] = updatedTransaction
    return updatedTransaction
}

export const deleteTransaction = async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const index = transactions.findIndex((t) => t.id === id)
    if (index !== -1) {
        transactions.splice(index, 1)
    }
}
