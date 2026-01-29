
import { Transaction } from "@/domain/transactions/types"
import { CategoryIds } from "@/domain/categories/types"
import { NUMAGoal } from "../types"

export interface ValidationProfile {
    id: string
    name: string
    description: string
    transactions: Transaction[]
    goals: NUMAGoal[]
}

/**
 * Helper to generate a repetitive monthly transaction history.
 */
function generateMonthlyHistory(months: number, baseTransactions: Omit<Transaction, "id" | "date" | "timestamp">[]): Transaction[] {
    const history: Transaction[] = []
    const now = new Date()

    for (let i = 0; i < months; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 15)
        baseTransactions.forEach((tx, index) => {
            history.push({
                ...tx,
                id: `tx-${i}-${index}-${tx.categoryId}`,
                date: date.toISOString().split('T')[0],
                timestamp: date.getTime()
            })
        })
    }
    return history
}

export const PROFILES: ValidationProfile[] = [
    {
        id: "marco",
        name: "Marco",
        description: "Lavoratore Junior, budget stretto",
        transactions: generateMonthlyHistory(6, [
            { amountCents: 130000, type: "income", categoryId: CategoryIds.STIPENDIO, description: "Stipendio", category: "Stipendio" },
            { amountCents: 60000, type: "expense", categoryId: CategoryIds.AFFITTO_MUTUO, description: "Affitto", category: "Affitto" },
            { amountCents: 30000, type: "expense", categoryId: CategoryIds.CIBO, description: "Spesa", category: "Spesa" },
            { amountCents: 10000, type: "expense", categoryId: CategoryIds.UTENZE, description: "Bollette", category: "Bollette" },
            { amountCents: 10000, type: "expense", categoryId: CategoryIds.BAR_CAFFE, description: "Varie", category: "Extra" }
        ]),
        goals: [
            { id: "marco-goal-1", title: "Fondo Emergenza", targetCents: 80000, createdAt: new Date().toISOString() }
        ]
    },
    {
        id: "elena",
        name: "Elena",
        description: "Freelance con alta variabilità",
        transactions: [
            ...generateMonthlyHistory(1, [{ amountCents: 400000, type: "income", categoryId: CategoryIds.FREELANCE, description: "Fattura A", category: "Entrate" }]),
            ...generateMonthlyHistory(1, [{ amountCents: 200000, type: "income", categoryId: CategoryIds.FREELANCE, description: "Fattura B", category: "Entrate" }]),
            ...generateMonthlyHistory(4, [
                { amountCents: 300000, type: "income", categoryId: CategoryIds.FREELANCE, description: "Fattura media", category: "Entrate" },
                { amountCents: 100000, type: "expense", categoryId: CategoryIds.AFFITTO_MUTUO, description: "Studio", category: "Affitto" },
                { amountCents: 80000, type: "expense", categoryId: CategoryIds.CIBO, description: "Spesa", category: "Spesa" }
            ])
        ],
        goals: [
            { id: "elena-goal-1", title: "Nuovo Mac", targetCents: 250000, createdAt: new Date().toISOString() }
        ]
    },
    {
        id: "coppia",
        name: "Luca & Sara",
        description: "Obiettivi multipli concorrenti",
        transactions: generateMonthlyHistory(6, [
            { amountCents: 450000, type: "income", categoryId: CategoryIds.STIPENDIO, description: "Stipendi", category: "Entrate" },
            { amountCents: 120000, type: "expense", categoryId: CategoryIds.AFFITTO_MUTUO, description: "Mutuo", category: "Casa" },
            { amountCents: 100000, type: "expense", categoryId: CategoryIds.CIBO, description: "Spesa Famiglia", category: "Spesa" },
            { amountCents: 50000, type: "expense", categoryId: CategoryIds.VIAGGI, description: "Svago", category: "Svago" },
            { amountCents: 50000, type: "expense", categoryId: CategoryIds.AUTO_CARBURANTE, description: "Auto", category: "Auto" }
        ]),
        goals: [
            { id: "coppia-goal-1", title: "Matrimonio", targetCents: 1500000, createdAt: new Date().toISOString() },
            { id: "coppia-goal-2", title: "Viaggio Nozze", targetCents: 400000, createdAt: new Date().toISOString() }
        ]
    },
    {
        id: "giulia",
        name: "Giulia",
        description: "Capacità di risparmio nulla",
        transactions: generateMonthlyHistory(6, [
            { amountCents: 220000, type: "income", categoryId: CategoryIds.STIPENDIO, description: "Stipendio", category: "Stipendio" },
            { amountCents: 215000, type: "expense", categoryId: CategoryIds.ALTRO_ESSENZIALE, description: "Uscite fisse", category: "Essenziali" }
        ]),
        goals: [
            { id: "giulia-goal-1", title: "Piccolo Sogno", targetCents: 200000, createdAt: new Date().toISOString() }
        ]
    },
    {
        id: "paolo",
        name: "Paolo",
        description: "Minimalista con portafoglio lungo",
        transactions: generateMonthlyHistory(12, [
            { amountCents: 200000, type: "income", categoryId: CategoryIds.STIPENDIO, description: "Stipendio", category: "Entrate" },
            { amountCents: 120000, type: "expense", categoryId: CategoryIds.ALTRO_ESSENZIALE, description: "Vita semplice", category: "Essenziali" }
        ]),
        goals: [
            { id: "paolo-1", title: "Bici", targetCents: 200000, createdAt: "2026-01-01T10:00:00Z" },
            { id: "paolo-2", title: "Corso", targetCents: 200000, createdAt: "2026-01-02T10:00:00Z" },
            { id: "paolo-3", title: "PC", targetCents: 200000, createdAt: "2026-01-03T10:00:00Z" }
        ]
    },
    {
        id: "stefano",
        name: "Stefano",
        description: "Entrate alte but High Burn",
        transactions: generateMonthlyHistory(6, [
            { amountCents: 700000, type: "income", categoryId: CategoryIds.STIPENDIO, description: "Manager Salary", category: "Entrate" },
            { amountCents: 250000, type: "expense", categoryId: CategoryIds.AFFITTO_MUTUO, description: "Attico", category: "Casa" },
            { amountCents: 200000, type: "expense", categoryId: CategoryIds.LUSSO, description: "Stile di vita", category: "Lusso" },
            { amountCents: 200000, type: "expense", categoryId: CategoryIds.RISTORANTI, description: "Cene fuori", category: "Comfort" }
        ]),
        goals: [
            { id: "stefano-1", title: "Porsche Usata", targetCents: 5000000, createdAt: new Date().toISOString() }
        ]
    }
]
