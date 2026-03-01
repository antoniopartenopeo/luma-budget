import { Transaction } from "./types"

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

const pickOne = <T,>(items: T[]): T => items[randomInt(0, items.length - 1)]

const PAYMENT_TAGS = {
    debit: ["Bancomat Intesa", "Carta debito N26", "Bancomat UniCredit"],
    credit: ["Carta credito Visa", "Carta credito Mastercard", "Carta credito Amex"],
    virtual: ["Carta virtuale Revolut", "Carta virtuale HYPE", "Carta virtuale Wise"],
}

const monthKey = (timestamp: number) => {
    const d = new Date(timestamp)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

const buildMonthSettlementDate = (key: string) => {
    const [year, month] = key.split("-").map(Number)
    const d = new Date(year, (month || 1) - 1, 28, randomInt(8, 18), randomInt(0, 59), 0, 0)
    return d.getTime()
}

const ensurePositiveMonthlyNet = (transactions: Transaction[], nextId: () => string) => {
    const monthly = new Map<string, { income: number; expense: number }>()

    for (const tx of transactions) {
        const key = monthKey(tx.timestamp)
        const current = monthly.get(key) || { income: 0, expense: 0 }
        if (tx.type === "income") {
            current.income += tx.amountCents
        } else {
            current.expense += tx.amountCents
        }
        monthly.set(key, current)
    }

    const targetNetCents = 18000 // ~180 EUR saved each month in demo.
    for (const [key, values] of monthly.entries()) {
        const net = values.income - values.expense
        if (net >= targetNetCents) continue

        const topUp = targetNetCents - net
        const ts = buildMonthSettlementDate(key)
        addTransaction(
            transactions,
            nextId(),
            ts,
            "income",
            "Giroconto da risparmi - conto deposito",
            "stipendio",
            topUp,
            false
        )
    }
}

// Generators for specific categories
const generateTransactions = (): Transaction[] => {
    const transactions: Transaction[] = []
    let currentDate = new Date(START_DATE)

    // ID Generator
    let idCounter = 1000
    const nextId = () => (++idCounter).toString()

    // Opening liquidity to avoid starting in the red.
    addTransaction(
        transactions,
        nextId(),
        new Date(START_DATE).getTime(),
        "income",
        "Saldo iniziale conto corrente - Bonifico",
        "stipendio",
        randomInt(180000, 320000),
        false
    )

    while (currentDate <= NOW) {
        const day = currentDate.getDate()
        const month = currentDate.getMonth()
        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6 // 0=Sun, 6=Sat
        const ms = currentDate.getTime()

        // 1. MONTHLY FIXED (Income & Expenses)

        // Stipendio: 27th of month
        if (day === 27) {
            const salary = randomInt(228000, 278000)
            addTransaction(transactions, nextId(), ms, "income", "Stipendio mensile - Bonifico azienda", "stipendio", salary, false)

            // Small yearly bonus pattern (13esima in December).
            if (month === 11) {
                addTransaction(transactions, nextId(), ms, "income", "Tredicesima - Bonifico azienda", "stipendio", randomInt(90000, 130000), false)
            }
        }

        // Rent/Mortgage: 5th of month
        if (day === 5) {
            addTransaction(transactions, nextId(), ms, "expense", "Affitto casa - Bonifico automatico", "casa", randomInt(69000, 79000), false)
        }

        // Utilities: 15th of month (approx)
        if (day === 15) {
            addTransaction(transactions, nextId(), ms, "expense", "Bollette luce/gas - Addebito diretto", "utenze", randomInt(9000, 17000), false)
        }

        // Subscription: 2nd of month
        if (day === 2) {
            addTransaction(
                transactions,
                nextId(),
                ms,
                "expense",
                `Spotify + Netflix - ${pickOne(PAYMENT_TAGS.virtual)}`,
                "abbonamenti",
                randomInt(2299, 3199),
                false
            )
        }

        // Side income / refund occasionally.
        if (day === 11 && Math.random() > 0.82) {
            addTransaction(
                transactions,
                nextId(),
                ms,
                "income",
                "Rimborso spese / lavoretto freelance",
                "stipendio",
                randomInt(6000, 25000),
                false
            )
        }

        // Typical ticket meal reimbursement.
        if (day === 12 && Math.random() > 0.6) {
            addTransaction(
                transactions,
                nextId(),
                ms,
                "income",
                "Rimborso buoni pasto",
                "stipendio",
                randomInt(7000, 15000),
                false
            )
        }


        // 2. WEEKLY / FREQUENT

        // Groceries (Spesa): Every ~4-5 days
        if (day % 5 === 0 || day % 5 === 1) { // Pseudo-random check
            const isBigShop = Math.random() > 0.7
            const amount = isBigShop ? randomInt(9000, 15000) : randomInt(2500, 6000)
            const supermarket = pickOne(["Esselunga", "Conad", "Carrefour", "Lidl"])
            const method = pickOne(PAYMENT_TAGS.debit)
            const desc = isBigShop
                ? `Spesa settimanale ${supermarket} - ${method}`
                : `Spesa alimentari ${supermarket} - ${method}`
            addTransaction(transactions, nextId(), ms, "expense", desc, "cibo", amount, false)
        }

        // Transport (Fuel): Every ~10 days
        if (day % 10 === 3) {
            addTransaction(
                transactions,
                nextId(),
                ms,
                "expense",
                `Rifornimento benzina - ${pickOne(PAYMENT_TAGS.debit)}`,
                "trasporti",
                randomInt(4200, 7600),
                false
            )
        }

        // 3. LIFESTYLE (Weekend heavy)

        // Pizza/Restaurant: Weekends
        if (isWeekend && Math.random() > 0.4) {
            const amount = randomInt(3500, 8000)
            addTransaction(
                transactions,
                nextId(),
                ms,
                "expense",
                `Cena fuori / pizzeria - ${pickOne(PAYMENT_TAGS.credit)}`,
                "ristoranti",
                amount,
                false
            )
        }

        // Breakfast/Coffee: Random weekdays
        if (!isWeekend && Math.random() > 0.6) {
            addTransaction(
                transactions,
                nextId(),
                ms,
                "expense",
                `Colazione bar - ${pickOne(PAYMENT_TAGS.debit)}`,
                "ristoranti",
                randomInt(250, 700),
                true
            ) // Superfluous
        }

        // Svago/Hobby: Random
        if (Math.random() > 0.85) {
            const leisureDesc = pickOne([
                `Cinema / svago - ${pickOne(PAYMENT_TAGS.credit)}`,
                `Videogioco online - ${pickOne(PAYMENT_TAGS.virtual)}`,
                `Aperitivo con amici - ${pickOne(PAYMENT_TAGS.credit)}`,
            ])
            addTransaction(transactions, nextId(), ms, "expense", leisureDesc, "svago", randomInt(1400, 5200), true) // Superfluous
        }

        // Shopping: Once/Twice a month random
        if (Math.random() > 0.95) {
            addTransaction(
                transactions,
                nextId(),
                ms,
                "expense",
                `Shopping / abbigliamento - ${pickOne(PAYMENT_TAGS.virtual)}`,
                "shopping",
                randomInt(3800, 13000),
                true
            ) // Comfort
        }

        // Online purchases: occasional and realistic.
        if (Math.random() > 0.965) {
            const onlineStore = pickOne(["Amazon", "eBay", "Zalando", "AliExpress"])
            addTransaction(
                transactions,
                nextId(),
                ms,
                "expense",
                `${onlineStore} acquisto online - ${pickOne(PAYMENT_TAGS.virtual)}`,
                "shopping",
                randomInt(1200, 9000),
                true
            )
        }

        // Next Day
        currentDate = addDays(currentDate, 1)
    }

    // Safety net for demo quality: no month should close in negative.
    ensurePositiveMonthlyNet(transactions, nextId)

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

    list.push({
        id,
        timestamp: dateObj.getTime(),
        date: dateObj.toISOString(),
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
