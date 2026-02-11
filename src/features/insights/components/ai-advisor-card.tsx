import * as React from "react"
import { motion, Variants } from "framer-motion"
import { Sparkles, TrendingUp, Wallet, BrainCircuit, LineChart, Search, Lock } from "lucide-react"
import { MacroSection } from "@/components/patterns/macro-section"
import { cn } from "@/lib/utils"
import { formatCents } from "@/domain/money"
import { useAIAdvisor, type AIAdvisorResult } from "../use-ai-advisor"
import { useCurrency } from "@/features/settings/api/use-currency"
import { SubSectionCard } from "@/components/patterns/sub-section-card"
import { NumaEngineCard } from "@/components/patterns/numa-engine-card"

interface AIAdvisorCardProps {
    advisorData?: AIAdvisorResult
}

function AIAdvisorCardView({ forecast, facts, subscriptions, isLoading: aiLoading }: AIAdvisorResult) {
    const { currency, locale } = useCurrency()

    const isLoading = aiLoading
    const visibleSubscriptions = subscriptions.slice(0, 3)
    const hiddenSubscriptionsCount = Math.max(0, subscriptions.length - visibleSubscriptions.length)

    // 1. DYNAMIC ATMOSPHERE: Calculate status based on financial health
    const advisorStatus = React.useMemo(() => {
        if (!forecast) return "default"
        if (forecast.predictedTotalEstimatedBalanceCents < 0) return "critical"
        if (forecast.predictedTotalEstimatedBalanceCents < 10000) return "warning"
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

    if (isLoading) {
        return (
            <MacroSection title="Numa Advisor" description="Sto analizzando i tuoi dati..." className="h-[auto] min-h-[240px]">
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative h-12 w-12 rounded-2xl bg-background/50 border border-primary/20 flex items-center justify-center shadow-lg">
                            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Sto preparando la stima...
                    </p>
                </div>
            </MacroSection>
        )
    }

    if (!forecast) {
        return (
            <MacroSection className="opacity-80">
                <div className="flex flex-col items-center justify-center text-center py-6 gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Dati ancora insufficienti</h3>
                        <p className="text-sm text-muted-foreground max-w-[300px]">Servono piu movimenti per stimare in modo affidabile il saldo totale del mese.</p>
                    </div>
                </div>
            </MacroSection>
        )
    }

    return (
        <MacroSection
            variant="premium"
            status={advisorStatus}
            title="Numa Advisor"
            description="Sintesi semplice dei tuoi dati recenti"
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
                            label="Saldo totale stimato"
                            icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
                            extra={
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className={cn(
                                        "px-3 py-1.5 rounded-xl text-[11px] font-black border uppercase tracking-wide",
                                        forecast.primarySource === "brain"
                                            ? "bg-primary/10 text-primary border-primary/20"
                                            : "bg-muted text-muted-foreground border-border"
                                    )}>
                                        {forecast.primarySource === "brain" ? "Fonte Brain" : "Fonte Storico"}
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1.5 rounded-xl text-[11px] font-black border uppercase tracking-wide",
                                        forecast.confidence === "high"
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                            : forecast.confidence === "medium"
                                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                    )}>
                                        {forecast.confidence === "high"
                                            ? "Affidabilita alta"
                                            : forecast.confidence === "medium"
                                                ? "Affidabilita media"
                                                : "Affidabilita bassa"}
                                    </div>
                                </div>
                            }
                        >
                            <div className="space-y-1">
                                <div className={cn(
                                    "text-4xl font-black tracking-tighter tabular-nums",
                                    forecast.predictedTotalEstimatedBalanceCents < 0 ? "text-rose-500" : "text-foreground"
                                )}>
                                    {formatCents(forecast.predictedTotalEstimatedBalanceCents, currency, locale)}
                                </div>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Saldo base totale meno spesa residua stimata del mese.
                                </p>
                            </div>
                        </SubSectionCard>
                    </motion.div>
                )}

                {/* 2. Subscriptions */}
                {subscriptions.length > 0 && (
                    <motion.div variants={itemVariants}>
                        <SubSectionCard
                            label="Abbonamenti rilevati"
                            icon={<Wallet className="h-4 w-4 text-indigo-500" />}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-black text-foreground tabular-nums">{subscriptions.length}</span>
                                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Servizi attivi nel mese</span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {visibleSubscriptions.map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="max-w-full md:max-w-[34rem] px-3 py-1.5 rounded-xl bg-background/80 dark:bg-slate-800 border border-border/50 text-xs font-bold text-muted-foreground shadow-sm"
                                            title={`${sub.description} · ${formatCents(sub.amountCents, currency, locale)}/mese`}
                                        >
                                            <span className="inline-flex max-w-full items-center gap-2">
                                                <span className="truncate">{sub.description}</span>
                                                <span className="shrink-0 text-foreground/80">
                                                    {formatCents(sub.amountCents, currency, locale)}/mese
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
                        title="Come lavora Numa Advisor"
                        icon={BrainCircuit}
                        audienceHint="Versione semplice"
                        className="rounded-[2.5rem]"
                        steps={[
                            {
                                icon: LineChart,
                                colorClass: "text-indigo-500",
                                bgClass: "bg-indigo-500/10",
                                stepLabel: "1. Base + residuo",
                                title: "Formula chiara",
                                description: "Partiamo dal saldo base totale e sottraiamo la spesa residua stimata fino a fine mese."
                            },
                            {
                                icon: Search,
                                colorClass: "text-emerald-500",
                                bgClass: "bg-emerald-500/10",
                                stepLabel: "2. Fonte stima",
                                title: "Brain quando pronto",
                                description: "Se il Brain e pronto usiamo il nowcast reale; altrimenti usiamo una stima storica prudente."
                            },
                            {
                                icon: Lock,
                                colorClass: "text-slate-500",
                                bgClass: "bg-slate-500/10",
                                stepLabel: "3. Segnali utili",
                                title: "Abbonamenti e rincari",
                                description: "Evidenziamo ricorrenze e possibili aumenti prezzo per aiutarti ad agire in anticipo."
                            }
                        ]}
                        auditLabel="Dettagli tecnici"
                        transparencyNote="I tuoi dati finanziari vengono analizzati solo sul dispositivo. Nessuna informazione personale viene inviata al cloud per questa funzione."
                        auditStats={[
                            {
                                label: "Formula",
                                value: "Saldo base - residuo",
                                subValue: "Metrica principale della card."
                            },
                            {
                                label: "Fonte attiva",
                                value: forecast?.primarySource === "brain" ? "Brain" : "Storico",
                                subValue: forecast?.primarySource === "brain"
                                    ? "Nowcast del Core sul mese corrente."
                                    : "Residuo storico (con backup run-rate)."
                            },
                            {
                                label: "Esecuzione",
                                value: "Locale",
                                subValue: "Calcolo fatto in locale, senza API esterne."
                            },
                            ...(facts ? [{
                                label: "Mesi storici",
                                value: `${facts.historicalMonthsCount} Mesi`,
                                subValue: "Storico usato per la stima attuale."
                            }] : [])
                        ]}
                    />
                </motion.div>
            </motion.div>
        </MacroSection>
    )
}

function AIAdvisorCardFromHook() {
    const advisorData = useAIAdvisor()
    return <AIAdvisorCardView {...advisorData} />
}

export function AIAdvisorCard({ advisorData }: AIAdvisorCardProps) {
    if (advisorData) {
        return <AIAdvisorCardView {...advisorData} />
    }

    return <AIAdvisorCardFromHook />
}
