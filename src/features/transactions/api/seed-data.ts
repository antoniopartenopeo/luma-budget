import { Transaction } from "./types"
import { formatCentsSignedFromType } from "@/domain/transactions"

// Configuration for the "Typical Italian Profile"
const START_DATE = new Date()
START_DATE.setMonth(START_DATE.getMonth() - 12)

const NOW = new Date()

// Helper to add days to a date
const addDays = (date: Date, days: number) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

// Random helper
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

// Generators for specific categories
const generateTransactions = (): Transaction[] => {
    const transactions: Transaction[] = []
    let currentDate = new Date(START_DATE)

    // ID Generator
    let idCounter = 1000
    const nextId = () => (++idCounter).toString()

    while (currentDate <= NOW) {
        const day = currentDate.getDate()
        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6 // 0=Sun, 6=Sat
        const ms = currentDate.getTime()

        // 1. MONTHLY FIXED (Income & Expenses)

        // Stipendio: 27th of month
        if (day === 27) {
            addTransaction(transactions, nextId(), ms, "income", "Stipendio Mensile", "stipendio", 185000, false)
        }

        // Rent/Mortgage: 5th of month
        if (day === 5) {
            addTransaction(transactions, nextId(), ms, "expense", "Affitto Casa", "casa", 75000, false)
        }

        // Utilities: 15th of month (approx)
        if (day === 15) {
            addTransaction(transactions, nextId(), ms, "expense", "Bollette Luce/Gas", "utenze", randomInt(8500, 14000), false)
        }

        // Subscription: 2nd of month
        if (day === 2) {
            addTransaction(transactions, nextId(), ms, "expense", "Spotify & Netflix", "abbonamenti", 2499, false) // Comfort
        }


        // 2. WEEKLY / FREQUENT

        // Groceries (Spesa): Every ~4-5 days
        if (day % 5 === 0 || day % 5 === 1) { // Pseudo-random check
            const isBigShop = Math.random() > 0.7
            const amount = isBigShop ? randomInt(9000, 15000) : randomInt(2500, 6000)
            const desc = isBigShop ? "Spesa Settimanale Esselunga" : "Spesa Alimentari"
            addTransaction(transactions, nextId(), ms, "expense", desc, "cibo", amount, false)
        }

        // Transport (Fuel): Every ~10 days
        if (day % 10 === 3) {
            addTransaction(transactions, nextId(), ms, "expense", "Rifornimento Benzina", "trasporti", 5000, false)
        }

        // 3. LIFESTYLE (Weekend heavy)

        // Pizza/Restaurant: Weekends
        if (isWeekend && Math.random() > 0.4) {
            const amount = randomInt(3500, 8000)
            addTransaction(transactions, nextId(), ms, "expense", "Cena Fuori / Pizzeria", "ristoranti", amount, false) // Comfort
        }

        // Breakfast/Coffee: Random weekdays
        if (!isWeekend && Math.random() > 0.6) {
            addTransaction(transactions, nextId(), ms, "expense", "Colazione Bar", "ristoranti", 450, true) // Superfluous
        }

        // Svago/Hobby: Random
        if (Math.random() > 0.85) {
            addTransaction(transactions, nextId(), ms, "expense", "Cinema / Svago", "svago", randomInt(1500, 4000), true) // Superfluous
        }

        // Shopping: Once/Twice a month random
        if (Math.random() > 0.95) {
            addTransaction(transactions, nextId(), ms, "expense", "Shopping / Abbigliamento", "shopping", randomInt(4000, 12000), true) // Comfort
        }

        // Next Day
        currentDate = addDays(currentDate, 1)
    }

    // Sort descending by date
    return transactions.sort((a, b) => b.timestamp - a.timestamp)
}

// Helper to push transaction
const addTransaction = (
    list: Transaction[],
    id: string,
    timestamp: number,
    type: "income" | "expense",
    desc: string,
    catId: string,
    cents: number,
    isSuperfluous: boolean
) => {
    // Add realistic randomness to time (9:00 - 21:00)
    const randomHour = randomInt(9, 21)
    const randomMin = randomInt(0, 59)
    const dateObj = new Date(timestamp)
    dateObj.setHours(randomHour, randomMin)

    // Formatted date string (Simple approximation)
    const dateStr = dateObj.toLocaleDateString("it-IT", { day: "numeric", month: "short" }) + ", " + dateObj.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })

    list.push({
        id,
        timestamp: dateObj.getTime(),
        date: dateStr,
        amount: formatCentsSignedFromType(cents, type),
        amountCents: cents,
        description: desc,
        category: getCategoryLabel(catId), // We approximate label here, ideally imported
        categoryId: catId,
        type,
        isSuperfluous,
        classificationSource: isSuperfluous ? "manual" : "ruleBased" // Mock
    })
}

// Simple label mapper (hardcoded to avoid circular dipendency on config if strict)
const getCategoryLabel = (id: string) => {
    const map: Record<string, string> = {
        stipendio: "Stipendio",
        casa: "Casa",
        utenze: "Utenze & Bollette",
        abbonamenti: "Abbonamenti",
        cibo: "Cibo",
        trasporti: "Trasporti",
        ristoranti: "Ristoranti & Bar",
        svago: "Svago",
        shopping: "Shopping",
    }
    return map[id] || id.charAt(0).toUpperCase() + id.slice(1)
}


/**
 * Generated mock data for development.
 * Contains ~12 months of realistic data.
 */
export const INITIAL_SEED_TRANSACTIONS: Transaction[] = generateTransactions()

