"use client"

import { GoalScenarioResult } from "@/VAULT/goals/types"
import { getPlanBasisContext } from "./financial-lab-copy"

export type AIMonitorTone = "thriving" | "stable" | "strained" | "critical"

interface AIMonitorInput {
    scenario: GoalScenarioResult | null
    savingsPercent: number
    monthlyGoalContributionFormatted: string
    hasInsufficientData?: boolean
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

export function generateAIMonitorMessage({
    scenario,
    savingsPercent,
    monthlyGoalContributionFormatted,
    hasInsufficientData = false
}: AIMonitorInput): AIMonitorOutput {
    if (!scenario) {
        return {
            tone: "stable",
            message: "Scegli uno scenario per vedere la quota sostenibile.",
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

    let tone: AIMonitorTone = "stable"
    let message = `${monthlyGoalContributionFormatted} al mese e la tua rata fissa aggiuntiva sostenibile nello scenario attuale.`

    if (scenario.sustainability.status === "unsafe") {
        tone = "critical"
        message = "Quota non sostenibile in sicurezza. Riduci la pressione sulle spese variabili prima di impostare una nuova rata fissa."
    } else if (scenario.sustainability.status === "fragile") {
        tone = "strained"
        message = `${monthlyGoalContributionFormatted} al mese e possibile, ma con margine delicato. Meglio partire con una rata piu prudente.`
    } else if (scenario.sustainability.status === "secure" && savingsPercent > 15) {
        tone = "thriving"
        message = `${monthlyGoalContributionFormatted} al mese e una quota solida: il margine resta robusto anche dopo l'allocazione.`
    }

    if (scenario.sustainability.reason && scenario.sustainability.status !== "secure") {
        message += ` Nota: ${scenario.sustainability.reason}`
    }

    const savingsMap = scenario.config.savingsMap || { superfluous: 0, comfort: 0 }
    const sacrifices: Sacrifice[] = []

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

    const planBasisContext = getPlanBasisContext(scenario.planBasis)

    return {
        tone,
        message: `${message}${planBasisContext}`,
        sacrifices
    }
}

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
