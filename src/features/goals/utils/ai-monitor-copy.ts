"use client"

import { GoalScenarioResult } from "@/VAULT/goals/types"

export type AIMonitorTone = "thriving" | "stable" | "strained" | "critical"

interface AIMonitorInput {
    scenario: GoalScenarioResult | null
    savingsPercent: number
    // NEW: Dynamic data for contextual messages
    monthlySavingsFormatted: string
    monthsToGoal: number | null
    targetDateFormatted: string | null
}

export interface Sacrifice {
    id: string
    label: string
    intensity: "low" | "medium" | "high"
}

interface AIMonitorOutput {
    tone: AIMonitorTone
    message: string
    sacrifices: Sacrifice[]
}

/**
 * Generates DYNAMIC contextual AI Monitor messages based on scenario analysis.
 * Messages now include actual values for a personalized experience.
 */
export function generateAIMonitorMessage({
    scenario,
    savingsPercent,
    monthlySavingsFormatted,
    monthsToGoal,
    targetDateFormatted
}: AIMonitorInput): AIMonitorOutput {
    // Fallback for no scenario
    if (!scenario) {
        return {
            tone: "stable",
            message: "Seleziona uno scenario per vedere l'analisi.",
            sacrifices: []
        }
    }

    const projection = scenario.projection

    // Critical: Goal unreachable or unsafe sustainability
    if (!projection.canReach || scenario.sustainability.status === "unsafe") {
        const reason = scenario.sustainability.reason ? ` ${scenario.sustainability.reason}` : "";
        return {
            tone: "critical",
            message: `Con questo ritmo non ci arrivi.${reason} Prova a tagliare qualcosa in più dal superfluo.`,
            sacrifices: []
        }
    }

    let result: { tone: AIMonitorTone, message: string }

    // Thriving: High savings (>15%) and short timeline (<12 months)
    if (savingsPercent > 15 && projection.likelyMonths <= 12) {
        result = {
            tone: "thriving",
            message: `Metti da parte ${monthlySavingsFormatted} al mese. A questo ritmo arrivi a ${targetDateFormatted} con margine.`
        }
    }
    // Stable: Decent savings (5-15%) or medium timeline
    else if (savingsPercent >= 5 && projection.likelyMonths <= 24) {
        if (monthsToGoal && monthsToGoal > 12) {
            result = {
                tone: "stable",
                message: `Con ${monthlySavingsFormatted} al mese ci vogliono circa ${monthsToGoal} mesi. Sostenibile, ma potresti accelerare.`
            }
        } else {
            result = {
                tone: "stable",
                message: `${monthlySavingsFormatted} al mese ti portano a ${targetDateFormatted}. Un buon equilibrio.`
            }
        }
    }
    // Strained: Low savings or long timeline
    else if (savingsPercent < 5 || projection.likelyMonths > 24) {
        const years = Math.ceil((monthsToGoal || 36) / 12)
        result = {
            tone: "strained",
            message: `${monthlySavingsFormatted} al mese è poco. Ti servirebbero circa ${years} anni. Prova a tagliare il superfluo.`
        }
    } else {
        result = {
            tone: "stable",
            message: `Il piano è attivo: ${monthlySavingsFormatted} al mese verso ${targetDateFormatted}.`
        }
    }

    // For non-critical but non-secure cases, append the sustainability reason if available
    if (scenario.sustainability.status === "fragile" && scenario.sustainability.reason) {
        result.message += ` Nota: ${scenario.sustainability.reason}`
    }

    // Extract sacrifices based on savingsMap
    const sacrifices: Sacrifice[] = []
    const savingsMap = scenario.config.savingsMap || { superfluous: 0, comfort: 0 }

    if (savingsMap.superfluous > 0) {
        sacrifices.push({
            id: "superfluous",
            label: savingsMap.superfluous >= 70 ? "Zero Superfluo" :
                savingsMap.superfluous >= 30 ? "Taglio Svago" : "Meno extra",
            intensity: savingsMap.superfluous >= 70 ? "high" :
                savingsMap.superfluous >= 30 ? "medium" : "low"
        })
    }

    if (savingsMap.comfort > 0) {
        sacrifices.push({
            id: "comfort",
            label: savingsMap.comfort >= 70 ? "Zero Shopping/Ristoranti" :
                savingsMap.comfort >= 30 ? "Meno Comfort" : "Limata al benessere",
            intensity: savingsMap.comfort >= 70 ? "high" :
                savingsMap.comfort >= 30 ? "medium" : "low"
        })
    }

    const behaviorOrigin = scenario.config.type === "manual"
        ? "le tue impostazioni"
        : `il ritmo ${scenario.config.label}`

    return {
        ...result,
        message: `${result.message} Questo risparmio si basa sulle tue abitudini (${behaviorOrigin}) e non cambia in base al costo dell'obiettivo.`,
        sacrifices
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
