import * as React from "react"
import { motion, Variants } from "framer-motion"
import { Sparkles, TrendingUp, Lightbulb, Wallet, BrainCircuit, LineChart, Search, Lock } from "lucide-react"
import { MacroSection } from "@/components/patterns/macro-section"
import { cn } from "@/lib/utils"
import { formatEuroNumber } from "@/domain/money"
import { useAIAdvisor } from "../use-ai-advisor"
import { useOrchestratedInsightsFromData } from "../use-orchestrated-insights"
import { useCurrency } from "@/features/settings/api/use-currency"
import { SubSectionCard } from "@/components/patterns/sub-section-card"
import { NumaEngineCard } from "@/components/patterns/numa-engine-card"

const SMART_ADVICE_SIGNATURE_KEY = "insights_smart_advice_signature_v1"

export function AIAdvisorCard() {
    const { forecast, facts, subscriptions, priceHikes, isLoading: aiLoading } = useAIAdvisor()
    const { orchestration, isLoading: orchestratorLoading } = useOrchestratedInsightsFromData({
        advisorFacts: facts,
        subscriptions,
        priceHikes,
        advisorLoading: aiLoading
    })
    const { currency, locale } = useCurrency()

    const isLoading = aiLoading || orchestratorLoading
    const visibleSubscriptions = subscriptions.slice(0, 3)
    const hiddenSubscriptionsCount = Math.max(0, subscriptions.length - visibleSubscriptions.length)
    const [adviceFreshness, setAdviceFreshness] = React.useState<"new" | "same" | null>(null)

    // 1. DYNAMIC ATMOSPHERE: Calculate status based on financial health
    const advisorStatus = React.useMemo(() => {
        if (!forecast) return "default"
        if (forecast.predictedSavings < 0) return "critical"
        if (forecast.predictedSavings < 100) return "warning"
        return "default"
    }, [forecast])

    // 2. STAGGERED ANIMATION VARIANTS
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
        visible: {
            opacity: 1, y: 0, filter: "blur(0px)",
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    }
    const primary = orchestration?.primary
    const secondary = orchestration?.secondary

    const whyChips = primary ? [
        `Fonte: ${primary.source.replace("_", " ")}`,
        `Priorità: ${primary.severity}`,
        primary.scope === "current_period" ? "Periodo: corrente" : "Periodo: lungo termine"
    ] : []

    React.useEffect(() => {
        if (!primary) return
        const signature = `${primary.id}|${primary.narration.text}`
        try {
            const prevSignature = localStorage.getItem(SMART_ADVICE_SIGNATURE_KEY)
            setAdviceFreshness(prevSignature === signature ? "same" : "new")
            localStorage.setItem(SMART_ADVICE_SIGNATURE_KEY, signature)
        } catch {
            setAdviceFreshness(null)
        }
    }, [primary])

    if (isLoading) {
        return (
            <MacroSection title="Numa AI Advisor" description="Analisi finanziaria in corso..." className="h-[auto] min-h-[240px]">
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative h-12 w-12 rounded-2xl bg-background/50 border border-primary/20 flex items-center justify-center shadow-lg">
                            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Elaborazione insight...
                    </p>
                </div>
            </MacroSection>
        )
    }

    if (!forecast && !primary) {
        return (
            <MacroSection className="opacity-80">
                <div className="flex flex-col items-center justify-center text-center py-6 gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Tutto tranquillo</h3>
                        <p className="text-sm text-muted-foreground max-w-[300px]">L&apos;IA non ha rilevato anomalie o suggerimenti urgenti per il momento.</p>
                    </div>
                </div>
            </MacroSection>
        )
    }

    return (
        <MacroSection
            variant="premium"
            status={advisorStatus}
            title="Numa AI Advisor"
            description="Financial Intelligence"
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-6"
            >
                {/* 1. Proiezione */}
                {forecast && (
                    <motion.div variants={itemVariants}>
                        <SubSectionCard
                            label="Proiezione Mensile"
                            icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
                            extra={
                                <div className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black border",
                                    forecast.confidence === "high"
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                )}>
                                    {forecast.confidence === "high" ? "ATTENDIBILITÀ ALTA" : "ATTENDIBILITÀ MEDIA"}
                                </div>
                            }
                        >
                            <div className="space-y-1">
                                <div className={cn(
                                    "text-4xl font-black tracking-tighter tabular-nums",
                                    forecast.predictedSavings < 0 ? "text-rose-500" : "text-foreground"
                                )}>
                                    {formatEuroNumber(forecast.predictedSavings, currency, locale)}
                                </div>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Risparmio stimato basato sui tuoi trend attuali di spesa.
                                </p>
                            </div>
                        </SubSectionCard>
                    </motion.div>
                )}

                {/* 2. Subscriptions */}
                {subscriptions.length > 0 && (
                    <motion.div variants={itemVariants}>
                        <SubSectionCard
                            label="Abbonamenti Rilevati"
                            icon={<Wallet className="h-4 w-4 text-indigo-500" />}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-black text-foreground tabular-nums">{subscriptions.length}</span>
                                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Servizi attivi questo mese</span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {visibleSubscriptions.map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="max-w-full md:max-w-[34rem] px-3 py-1.5 rounded-xl bg-background/80 dark:bg-slate-800 border border-border/50 text-xs font-bold text-muted-foreground shadow-sm"
                                            title={`${sub.description} · ${formatEuroNumber(sub.amount, currency, locale)}/mese`}
                                        >
                                            <span className="inline-flex max-w-full items-center gap-2">
                                                <span className="truncate">{sub.description}</span>
                                                <span className="shrink-0 text-foreground/80">
                                                    {formatEuroNumber(sub.amount, currency, locale)}/mese
                                                </span>
                                            </span>
                                        </div>
                                    ))}
                                    {hiddenSubscriptionsCount > 0 && (
                                        <div className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border/50 text-xs font-bold text-muted-foreground shadow-sm">
                                            +{hiddenSubscriptionsCount} altri
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SubSectionCard>
                    </motion.div>
                )}

                {/* NEW: Numa Engine Card (Centralized) */}
                <motion.div variants={itemVariants}>
                    <NumaEngineCard
                        title="Il Motore Numa AI"
                        icon={BrainCircuit}
                        audienceHint="Per tester avanzati"
                        className="rounded-[2.5rem]"
                        steps={[
                            {
                                icon: LineChart,
                                colorClass: "text-indigo-500",
                                bgClass: "bg-indigo-500/10",
                                stepLabel: "1. Previsione Ponderata",
                                title: "Algoritmo Adattivo",
                                description: "Diamo peso 50/30/20 ai mesi recenti per anticipare i tuoi cambiamenti di vita."
                            },
                            {
                                icon: Search,
                                colorClass: "text-emerald-500",
                                bgClass: "bg-emerald-500/10",
                                stepLabel: "2. Scansione Pattern",
                                title: "Rilevamento Servizi",
                                description: "Identifichiamo abbonamenti e rincari (>5%) analizzando la ricorrenza esatta."
                            },
                            {
                                icon: Lock,
                                colorClass: "text-slate-500",
                                bgClass: "bg-slate-500/10",
                                stepLabel: "3. Privacy Totale",
                                title: "Analisi Locale",
                                description: "I tuoi dati non lasciano mai il dispositivo. L'intelligenza gira 'on-edge'."
                            }
                        ]}
                        auditLabel="Vedi Audit Tecnico"
                        transparencyNote="I tuoi dati finanziari vengono analizzati esclusivamente sul dispositivo. Nessuna informazione personale viene inviata ai server cloud per questa analisi."
                        auditStats={[
                            {
                                label: "Pesatura Algoritmo",
                                value: "50% • 30% • 20%",
                                subValue: "Distribuzione del peso sui 3 mesi più recenti."
                            },
                            {
                                label: "Precisione Cronologica",
                                value: "±1 Giorno",
                                subValue: "Tolleranza per il rilevamento ricorrenze mensili."
                            },
                            {
                                label: "Compute Layer",
                                value: "On-Device",
                                subValue: "Esecuzione locale isolata senza chiamate API esterne."
                            },
                            ...(facts ? [{
                                label: "Data Points",
                                value: `${facts.historicalMonthsCount} Mesi`,
                                subValue: "Profondità storica utilizzata per la proiezione attuale."
                            }] : [])
                        ]}
                    />
                </motion.div>

                {/* 3. Smart Tip (Orchestrated) */}
                {primary && (
                    <motion.div variants={itemVariants}>
                        <SubSectionCard
                            variant="accent"
                            label="SMART ADVICE"
                            icon={<Lightbulb className="h-4 w-4 fill-current" />}
                            className="overflow-hidden"
                        >
                            {/* Visual accent for Smart Advice */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16" />

                            <div className="space-y-4 relative z-10">
                                <p className="text-sm font-medium leading-relaxed text-foreground/90">
                                    &quot;{primary.narration.text}&quot;
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {adviceFreshness === "same" && (
                                        <span className="px-2 py-1 rounded-lg bg-muted/60 border border-border/50 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                            Nessuna novità
                                        </span>
                                    )}
                                    {adviceFreshness === "new" && (
                                        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                                            Nuovo insight
                                        </span>
                                    )}
                                    {whyChips.map((chip, idx) => (
                                        <span key={idx} className="px-2 py-1 rounded-lg bg-background/70 border border-border/50 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                            {chip}
                                        </span>
                                    ))}
                                </div>

                                {secondary && secondary.length > 0 && (
                                    <div className="space-y-2 pt-4 border-t border-indigo-500/10">
                                        {secondary.map((s, idx) => (
                                            <p key={idx} className="text-xs leading-relaxed text-muted-foreground/80 font-medium italic">
                                                <span className="font-bold uppercase not-italic mr-2 text-indigo-500/40 text-[10px] tracking-wider">Contesto:</span>
                                                {s.narration.text}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </SubSectionCard>
                    </motion.div>
                )}
            </motion.div>
        </MacroSection>
    )
}
