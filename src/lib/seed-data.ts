import { Transaction } from "@/features/transactions/api/types"

// Initial mock data
export const INITIAL_SEED_TRANSACTIONS: Transaction[] = [
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
        categoryId: "viaggi",
        icon: "🏨",
        type: "expense",
        timestamp: Date.now() - 86400000 * 115,
        isSuperfluous: false,
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
        timestamp: Date.now() - 86400000 * 240,
        isSuperfluous: false,
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
        timestamp: Date.now() - 86400000 * 330,
        isSuperfluous: false,
        classificationSource: "ruleBased"
    },
]
