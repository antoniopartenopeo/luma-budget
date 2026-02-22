import { QuotaScenarioResult, SustainabilityStatus } from "@/VAULT/goals/types"

type PlanBasis = QuotaScenarioResult["planBasis"]

export const FINANCIAL_LAB_COPY = {
    page: {
        title: "Financial Lab",
        description: "Qui vedi la quota fissa aggiuntiva sostenibile. Insights mostra invece il saldo stimato di fine mese.",
        loading: "Sto preparando Financial Lab..."
    },
    scenarioDeck: {
        title: "Scegli lo scenario quota",
        subtitle: "Ogni scenario mostra la quota mensile sostenibile, non il saldo finale del mese.",
        quotaLabel: "Quota sostenibile",
        perMonthSuffix: "/mese",
        sustainabilityInlineLabel: "Tenuta quota",
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
        liveStepLabelBase: "Correzione live",
        updatedMarginLabel: "Margine aggiornato",
        noLiveNarrative: "Nessuna correzione live attiva: usiamo solo la base storica.",
        liveNarrative: "Aggiorniamo il margine usando i segnali piu recenti, per mantenere la quota prudente."
    },
    planBasis: {
        brain: "Fonte Core",
        fallback: "Fonte Storico",
        historical: "Fonte Storico"
    },
    scenarioCard: {
        detailTitle: "Come nasce la quota",
        baseStepTitle: "Margine disponibile"
    }
} as const

export function getPlanBasisLabel(planBasis: PlanBasis): string {
    if (planBasis === "brain_overlay") return FINANCIAL_LAB_COPY.planBasis.brain
    if (planBasis === "fallback_overlay") return FINANCIAL_LAB_COPY.planBasis.fallback
    return FINANCIAL_LAB_COPY.planBasis.historical
}

export function getSustainabilityLabel(status: SustainabilityStatus): string {
    if (status === "secure") return "Molto solida"
    if (status === "sustainable") return "Solida"
    if (status === "fragile") return "Delicata"
    return "A rischio"
}

export function getRealtimeStepLabel(): string {
    return FINANCIAL_LAB_COPY.resultsPanel.liveStepLabelBase
}

export function getRealtimeNarrative(realtimeWindowMonths: number): string {
    if (realtimeWindowMonths > 0) {
        return FINANCIAL_LAB_COPY.resultsPanel.liveNarrative
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
