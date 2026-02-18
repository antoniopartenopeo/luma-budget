import { GoalScenarioResult, SustainabilityStatus } from "@/VAULT/goals/types"

type PlanBasis = GoalScenarioResult["planBasis"]

export const FINANCIAL_LAB_COPY = {
    page: {
        title: "Financial Lab",
        description: "Scopri la tua quota fissa sostenibile aggiuntiva, basata su storico reale e correzione live.",
        loading: "Sto preparando Financial Lab..."
    },
    scenarioDeck: {
        title: "Scegli lo scenario quota",
        quotaLabel: "Quota sostenibile",
        engineTitle: "Come calcola Numa",
        audienceHint: "In breve",
        steps: [
            {
                stepLabel: "1. Base Storica",
                title: "Guardo quanto ti resta",
                description: "Partiamo da entrate e uscite reali per capire il margine medio mensile."
            },
            {
                stepLabel: "2. Correzione Live",
                title: "Aggiorno il breve periodo",
                description: "Per i prossimi mesi applichiamo una correzione prudente con i dati piu recenti."
            },
            {
                stepLabel: "3. Quota Sostenibile",
                title: "Ti dico la rata fissa",
                description: "Ti mostriamo la quota aggiuntiva che puoi sostenere ogni mese."
            }
        ],
        certificationTitle: "Motore deterministico locale",
        certificationSubtitle: "Calcolo base stabile con overlay live prudenziale nel breve periodo.",
        transparencyNote: "La base storica resta il riferimento: Brain e live correggono solo i prossimi mesi.",
        audit: {
            depthLabel: "Profondita Audit",
            depthValue: "Ultimi 6 Mesi",
            depthSubValue: "Analisi delle transazioni reali nel periodo.",
            stabilityLabel: "Stabilita Rilevata",
            stabilitySubValue: "Variabilita osservata sui tuoi flussi mensili.",
            sustainabilityLabel: "Sostenibilita",
            sustainabilitySubValue: "Valutata su buffer prudenziale e tenuta del piano.",
            overlayLabel: "Overlay Realtime",
            overlaySubValuePrefix: "Aggiornamento sul breve periodo.",
            overlaySubValueDisabledPrefix: "Nessun aggiornamento live attivo."
        }
    },
    resultsPanel: {
        title: "Come nasce la quota",
        intro: "Qui vedi, passo per passo, come arriviamo alla tua quota mensile.",
        baseStepLabel: "1) Margine base storico",
        baseStepDescription: "Quanto in media ti rimane a fine mese dai dati storici.",
        liveStepLabelBase: "2) Correzione live",
        practicalStepLabel: "3) In pratica",
        practicalStepDescription: "Questa e la rata fissa aggiuntiva sostenibile che puoi permetterti ogni mese.",
        updatedMarginLabel: "Margine aggiornato",
        noLiveNarrative: "Nessuna correzione live attiva: usiamo solo la base storica.",
        liveNarrativePrefix: "Per i prossimi",
        liveNarrativeSuffix: "mesi aggiorniamo il margine con dati piu recenti, poi torniamo alla base storica.",
        sustainabilityPanelLabel: "Tenuta del piano"
    },
    monitor: {
        title: "Monitor quota"
    },
    planBasis: {
        brain: "Fonte Brain",
        fallback: "Fonte Storico+Live",
        historical: "Fonte Storico",
        badgeLivePrefix: "Live",
        badgeHistorical: "Solo storico"
    }
} as const

export function getPlanBasisLabel(planBasis: PlanBasis): string {
    if (planBasis === "brain_overlay") return FINANCIAL_LAB_COPY.planBasis.brain
    if (planBasis === "fallback_overlay") return FINANCIAL_LAB_COPY.planBasis.fallback
    return FINANCIAL_LAB_COPY.planBasis.historical
}

export function getPlanBasisContext(planBasis: PlanBasis): string {
    if (planBasis === "brain_overlay") return " Fonte Brain attiva sul breve periodo."
    if (planBasis === "fallback_overlay") return " Correzione live basata su storico attivo sui prossimi mesi."
    return " Basata solo su storico consolidato."
}

export function getSustainabilityLabel(status: SustainabilityStatus): string {
    if (status === "secure") return "Molto solido"
    if (status === "sustainable") return "Solido"
    if (status === "fragile") return "Delicato"
    return "A rischio"
}

export function getSustainabilityGuidance(status: SustainabilityStatus, reason: string | null): string {
    if (reason) return reason
    if (status === "secure") return "Si: il piano lascia un buon margine di sicurezza ogni mese."
    if (status === "sustainable") return "Si: il piano regge, ma con margine moderato."
    if (status === "fragile") return "Parzialmente: il piano e delicato e va monitorato."
    return "No: il piano e troppo tirato per essere sicuro."
}

export function getRealtimeStepLabel(realtimeWindowMonths: number): string {
    if (realtimeWindowMonths > 0) {
        return `${FINANCIAL_LAB_COPY.resultsPanel.liveStepLabelBase} (${realtimeWindowMonths} mesi)`
    }
    return FINANCIAL_LAB_COPY.resultsPanel.liveStepLabelBase
}

export function getRealtimeBadgeLabel(realtimeWindowMonths: number): string {
    if (realtimeWindowMonths > 0) {
        return `${FINANCIAL_LAB_COPY.planBasis.badgeLivePrefix} ${realtimeWindowMonths} mesi`
    }
    return FINANCIAL_LAB_COPY.planBasis.badgeHistorical
}

export function getRealtimeNarrative(realtimeWindowMonths: number): string {
    if (realtimeWindowMonths > 0) {
        return `${FINANCIAL_LAB_COPY.resultsPanel.liveNarrativePrefix} ${realtimeWindowMonths} ${FINANCIAL_LAB_COPY.resultsPanel.liveNarrativeSuffix}`
    }
    return FINANCIAL_LAB_COPY.resultsPanel.noLiveNarrative
}

export function getOverlayStatsValue(realtimeOverlayApplied: boolean, realtimeWindowMonths: number): string {
    return realtimeOverlayApplied ? `${realtimeWindowMonths} mesi` : "Nessuno"
}

export function getOverlayAuditSubValue(realtimeOverlayApplied: boolean, sourceLabel: string): string {
    if (realtimeOverlayApplied) {
        return `${FINANCIAL_LAB_COPY.scenarioDeck.audit.overlaySubValuePrefix} ${sourceLabel}.`
    }
    return `${FINANCIAL_LAB_COPY.scenarioDeck.audit.overlaySubValueDisabledPrefix} ${sourceLabel}.`
}
