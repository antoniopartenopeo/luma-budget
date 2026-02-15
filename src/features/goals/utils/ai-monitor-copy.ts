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
    hasInsufficientData?: boolean
    brainAssistApplied?: boolean
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
    targetDateFormatted,
    hasInsufficientData = false,
    brainAssistApplied = false
}: AIMonitorInput): AIMonitorOutput {
    // Fallback for no scenario
    if (!scenario) {
        return {
            tone: "stable",
            message: "Scegli uno scenario per vedere il risultato.",
            sacrifices: []
        }
    }

    if (hasInsufficientData) {
        return {
            tone: "strained",
            message: "Dati insufficienti per una stima affidabile. Aggiungi piu transazioni reali e riprova.",
            sacrifices: []
        }
    }

    const projection = scenario.projection
    const targetLabel = targetDateFormatted || "la data stimata"
    const likelyMonthsValue = monthsToGoal ?? projection.likelyMonthsPrecise ?? projection.likelyMonths
    const formatMonths = (months: number) => {
        if (months >= 24) return `${Math.round(months)}`
        if (Math.abs(months - Math.round(months)) < 0.2) return `${Math.round(months)}`
        return months.toFixed(1).replace(".", ",")
    }

    // Critical: Goal unreachable or unsafe sustainability
    if (!projection.canReach || scenario.sustainability.status === "unsafe") {
        const details = [projection.unreachableReason, scenario.sustainability.reason]
            .filter(Boolean)
            .join(" ")
        const reason = details ? ` ${details}` : ""
        return {
            tone: "critical",
            message: `Con il ritmo attuale il traguardo non e ancora raggiungibile.${reason} Per proteggere l'obiettivo, aumenta il margine mensile o riduci le spese variabili.`,
            sacrifices: []
        }
    }

    let result: { tone: AIMonitorTone, message: string }

    if (likelyMonthsValue === 0) {
        result = {
            tone: "stable",
            message: "Obiettivo gia raggiunto con il ritmo attuale."
        }
    }

    // Thriving: Strong savings and short timeline
    else if (likelyMonthsValue <= 12 && savingsPercent > 15) {
        result = {
            tone: "thriving",
            message: `Con il ritmo attuale metti da parte ${monthlySavingsFormatted} al mese. Traguardo stimato a ${targetLabel} con margine solido.`
        }
    }
    // Stable: Reachable in a medium horizon (<= 24 months)
    else if (likelyMonthsValue <= 24) {
        if (likelyMonthsValue > 12) {
            result = {
                tone: "stable",
                message: `Con ${monthlySavingsFormatted} al mese servono circa ${formatMonths(likelyMonthsValue)} mesi. Il piano regge, ma puoi velocizzare.`
            }
        } else {
            result = {
                tone: "stable",
                message: `${monthlySavingsFormatted} al mese ti portano a ${targetLabel}. Ritmo equilibrato.`
            }
        }
    }
    // Strained: Reachable but long timeline
    else if (likelyMonthsValue > 24) {
        const years = Math.max(1, Math.ceil(likelyMonthsValue / 12))
        const yearsLabel = years === 1 ? "anno" : "anni"
        result = {
            tone: "strained",
            message: `Con il ritmo attuale (${monthlySavingsFormatted} al mese), il traguardo richiede circa ${years} ${yearsLabel}. Se vuoi accorciare i tempi, aumenta gradualmente il margine.`
        }
    } else {
        result = {
            tone: "stable",
            message: `Piano attivo: ${monthlySavingsFormatted} al mese verso ${targetLabel}.`
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
    const brainContext = brainAssistApplied
        ? " Integrazione Brain attiva: prudenza adattiva sul rischio del mese corrente."
        : ""

    return {
        ...result,
        message: `${result.message} Stima basata su abitudini reali (${behaviorOrigin}), ritmo scelto e target obiettivo.${brainContext}`,
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
                containerClass: "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/10",
                textClass: "text-primary",
                iconClass: "text-primary"
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
