"use client"

import { GoalScenarioResult, ProjectionResult } from "@/VAULT/goals/types"

export type AIMonitorTone = "thriving" | "stable" | "strained" | "critical"

interface AIMonitorInput {
    scenario: GoalScenarioResult | null
    savingsPercent: number
    baselineExpenses: number
}

interface AIMonitorOutput {
    tone: AIMonitorTone
    message: string
}

/**
 * Generates contextual AI Monitor messages based on scenario analysis.
 * 
 * Tones:
 * - thriving: Excellent savings + goal reachable in good time
 * - stable: Decent savings + goal achievable
 * - strained: Low savings + long timeline
 * - critical: Goal not reachable
 */
export function generateAIMonitorMessage({
    scenario,
    savingsPercent,
    baselineExpenses
}: AIMonitorInput): AIMonitorOutput {
    // Fallback for no scenario
    if (!scenario) {
        return {
            tone: "stable",
            message: "Seleziona uno scenario per vedere l'analisi."
        }
    }

    const projection = scenario.projection

    // Critical: Goal unreachable
    if (!projection.canReach) {
        return {
            tone: "critical",
            message: "Con il ritmo attuale l'obiettivo non è raggiungibile. Prova uno scenario più intenso o riduci il target."
        }
    }

    // Thriving: High savings (>15%) and short timeline (<12 months)
    if (savingsPercent > 15 && projection.likelyMonths <= 12) {
        return {
            tone: "thriving",
            message: "Configurazione eccellente! Stai massimizzando il risparmio mantenendo un traguardo molto vicino."
        }
    }

    // Stable: Decent savings (5-15%) or medium timeline
    if (savingsPercent >= 5 && projection.likelyMonths <= 24) {
        return {
            tone: "stable",
            message: "Equilibrio ottimale tra risparmio e qualità della vita. Il tuo piano è sostenibile nel tempo."
        }
    }

    // Strained: Low savings or long timeline
    if (savingsPercent < 5 || projection.likelyMonths > 24) {
        return {
            tone: "strained",
            message: "Il ritmo è lento. Prova ad aumentare il risparmio del 5-10% per ridurre drasticamente l'attesa."
        }
    }

    // Default stable
    return {
        tone: "stable",
        message: "Il piano è attivo. Monitora i progressi dalla Dashboard."
    }
}

/**
 * Returns Tailwind classes for the AI Monitor tone.
 */
export function getAIMonitorStyles(tone: AIMonitorTone): {
    containerClass: string
    textClass: string
    iconClass: string
} {
    switch (tone) {
        case "thriving":
            return {
                containerClass: "bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/10",
                textClass: "text-emerald-700 dark:text-emerald-400",
                iconClass: "text-emerald-500"
            }
        case "stable":
            return {
                containerClass: "bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/10",
                textClass: "text-indigo-700 dark:text-indigo-400",
                iconClass: "text-indigo-500"
            }
        case "strained":
            return {
                containerClass: "bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/10",
                textClass: "text-amber-700 dark:text-amber-400",
                iconClass: "text-amber-500"
            }
        case "critical":
            return {
                containerClass: "bg-gradient-to-br from-rose-500/5 to-red-500/5 border-rose-500/10",
                textClass: "text-rose-700 dark:text-rose-400",
                iconClass: "text-rose-500"
            }
    }
}
