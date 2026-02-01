
import { DashboardSummary } from "@/features/dashboard/api/types"
import { ContextMessage, SmartContextMap } from "./types"

interface ContextEngineInput {
    summary: DashboardSummary
    currentDate?: Date // Allow injection for testing
}

/**
 * Pure Logic Engine for "Numa Smart Context".
 * Analyzes financial data to generate conversational insights.
 * 
 * Rules Covered:
 * 1. Liquidity Paradox (Budget > Balance)
 * 2. Pacing Alarm (Fast Spending)
 * 3. Safe Harbor (Strong Cashflow)
 */
export function generateSmartContext(input: ContextEngineInput): SmartContextMap {
    const { summary, currentDate = new Date() } = input
    const contextMap: SmartContextMap = {}

    // 0. Extract Core Metrics
    const balance = summary.netBalance
    const budgetRemaining = summary.budgetRemaining
    const budgetTotal = summary.budgetTotal
    // Safety check div by zero
    const totalBudgetSafe = budgetTotal > 0 ? budgetTotal : 1

    const spent = summary.totalSpent
    const day = currentDate.getDate()
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const progressMonth = day / daysInMonth // 0.0 - 1.0

    // --- RULE 1: LIQUIDITY PARADOX (The "Cash vs FLow" issue) ---
    // Trigger: Budget Remaining is much higher than actual Cash Balance.
    // Meaning: "Paper rich, cash poor".
    if (balance > 0 && budgetRemaining > balance * 1.2 && budgetRemaining > 100) {
        contextMap['budgetRemaining'] = {
            id: 'liquidity-paradox',
            level: 'warning',
            title: 'Occhio alla Cassa',
            message: `Hai un budget teorico di ${Math.round(budgetRemaining)}€, ma il tuo saldo reale è inferiore (${Math.round(balance)}€). Non spendere tutto subito: attendi nuove entrate.`,
            actionLabel: 'Vedi Transazioni',
            actionUrl: '/dashboard/transactions'
        }
    }

    // --- RULE 2: PACING ALARM (Early Burn) ---
    // Trigger: Used > 50% budget in first 10 days
    const spentPct = spent / totalBudgetSafe
    if (day <= 10 && spentPct > 0.5) {
        contextMap['totalSpent'] = {
            id: 'pacing-alarm',
            level: 'danger',
            title: 'Partenza Razzo',
            message: `Siamo solo al giorno ${day} e hai già usato il ${(spentPct * 100).toFixed(0)}% del budget. Prova a rallentare le spese non essenziali.`,
        }
    }

    // --- RULE 3: SAFE HARBOR (Validation) ---
    // Trigger: Balance covers Budget comfortably (>2x)
    if (balance > budgetRemaining * 2 && budgetRemaining > 0) {
        // Only if not already warned
        if (!contextMap['budgetRemaining']) {
            contextMap['budgetRemaining'] = {
                id: 'safe-harbor',
                level: 'success',
                title: 'Copertura Totale',
                message: "Semaforo verde! La tua liquidità copre abbondantemente tutto il budget previsto per il mese.",
            }
        }
    }

    // --- RULE 4: SUPERFLUOUS SPIKE ---
    // Trigger: Superfluous > 30% (Numa standard threshold for alert)
    const uselessPct = summary.uselessSpendPercent || 0
    if (uselessPct > 30) {
        contextMap['uselessSpendPercent'] = {
            id: 'superfluous-spike',
            level: 'warning',
            title: 'Alert Extra',
            message: `Le spese "Desideri" sono al ${uselessPct.toFixed(0)}%. Numa consiglia di stare sotto il 20% per massimizzare il risparmio.`,
        }
    }

    return contextMap
}
