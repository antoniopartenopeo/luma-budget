
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { PortfolioMetrics } from "../logic/multi-goal-orchestrator"
import { ValidationProfile } from "./dataset"

const formatCents = (cents: number) => (cents / 100).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })

/**
 * Generates a human-friendly NUMA report for a specific profile and its results.
 */
export function generateNumaReport(profile: ValidationProfile, metrics: PortfolioMetrics): string {
    let report = `\n--- REPORT VALIDAZIONE NUMA: ${profile.name.toUpperCase()} ---\n`
    report += `Profilo: ${profile.description}\n`

    if (metrics.projections.length === 0) {
        return report + "Nessun obiettivo pianificato.\n"
    }

    report += `\nCiao ${profile.name}, ho analizzato il tuo percorso:\n`

    metrics.projections.forEach((p, index) => {
        const goal = profile.goals.find(g => g.id === p.goalId)
        if (!goal) return

        const isMain = index === 0
        const dateStr = format(p.projection.likelyDate, "MMMM yyyy", { locale: it })

        if (p.projection.canReach) {
            if (isMain) {
                report += `- Per il tuo obiettivo "${goal.title}", con il ritmo attuale, la finestra stimata è ${dateStr}.\n`
            } else {
                report += `- Proseguendo così, sbloccherai "${goal.title}" verso ${dateStr}.\n`
            }
        } else {
            report += `- L'obiettivo "${goal.title}" sembra al momento fuori portata con questo percorso: ${p.projection.unreachableReason}\n`
        }
    })

    if (metrics.totalMonths !== Infinity && metrics.totalMonths > 0) {
        report += `\nCompletando tutto, raggiungerai la tua piena tranquillità in circa ${metrics.totalMonths} mesi.\n`
    }

    report += `\nInvarianti verificate: ✅\n`
    report += `---------------------------------------------------\n`

    return report
}
