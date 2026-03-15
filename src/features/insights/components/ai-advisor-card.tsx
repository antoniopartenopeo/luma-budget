import * as React from "react"
import { motion, Variants, useReducedMotion } from "framer-motion"
import { Sparkles, TrendingUp, Wallet, BrainCircuit, LineChart, Search, Lock } from "lucide-react"
import { MacroSection } from "@/components/patterns/macro-section"
import { cn } from "@/lib/utils"
import { formatCents } from "@/domain/money"
import { useAIAdvisor, type AIAdvisorResult } from "../use-ai-advisor"
import { useCurrency } from "@/features/settings/api/use-currency"
import { SubSectionCard } from "@/components/patterns/sub-section-card"
import { NumaEngineCard } from "@/components/patterns/numa-engine-card"
import { KpiCard } from "@/components/patterns/kpi-card"
import { SubscriptionPortfolioCard } from "@/components/patterns/subscription-portfolio-card"
import { resolveBrainSourceLabel } from "../brain-copy"
import { buildTransactionsUrl } from "../utils"

const PORTFOLIO_MAX_ITEMS = 6
const MONTHS_IN_YEAR = 12

interface AIAdvisorCardProps {
    advisorData?: AIAdvisorResult
}

interface NumaAdvisorHowItWorksCardProps {
    forecast: AIAdvisorResult["forecast"]
    facts: AIAdvisorResult["facts"]
    className?: string
}

export function NumaAdvisorHowItWorksCard({ forecast, facts, className }: NumaAdvisorHowItWorksCardProps) {
    return (
        <NumaEngineCard
            icon={BrainCircuit}
            className={className}
            steps={[
                {
                    icon: LineChart,
                    colorClass: "text-primary",
                    bgClass: "bg-primary/10",
                    stepLabel: "1. Base + residuo",
                    title: "Formula chiara",
                    description: "Partiamo dal saldo totale di base e togliamo la spesa ancora attesa fino a fine mese."
                },
                {
                    icon: Search,
                    colorClass: "text-emerald-500",
                    bgClass: "bg-emerald-500/10",
                    stepLabel: "2. Fonte stima",
                    title: "Da dove arriva la stima",
                    description: "Se il Brain è pronto usiamo il nowcast del mese corrente, altrimenti una stima storica prudente."
                },
                {
                    icon: Lock,
                    colorClass: "text-slate-500",
                    bgClass: "bg-slate-500/10",
                    stepLabel: "3. Segnali utili",
                    title: "Abbonamenti e rincari",
                    description: "Mettiamo in evidenza ricorrenze e possibili aumenti di prezzo per aiutarti a decidere in anticipo."
                }
            ]}
            transparencyNote="Questa lettura avviene solo sul tuo dispositivo. Nessun dato personale viene inviato al cloud per questa funzione."
            auditStats={[
                {
                    label: "Formula",
                    value: "Saldo base - residuo",
                    subValue: "La metrica principale di questa sezione."
                },
                {
                    label: "Fonte attiva",
                    value: resolveBrainSourceLabel(forecast?.primarySource ?? "fallback"),
                    subValue: forecast?.primarySource === "brain"
                        ? "Stima del Brain sul mese corrente."
                        : "Stima storica con protezione prudente."
                },
                {
                    label: "Esecuzione",
                    value: "Locale",
                    subValue: "Calcolo locale, senza servizi esterni."
                },
                ...(facts ? [{
                    label: "Mesi storici",
                    value: `${facts.historicalMonthsCount} Mesi`,
                    subValue: "Mesi osservati per costruire la stima."
                }] : [])
            ]}
        />
    )
}

function AIAdvisorCardView({ forecast, subscriptions, isLoading: aiLoading }: AIAdvisorResult) {
    const { currency, locale } = useCurrency()
    const prefersReducedMotion = useReducedMotion()

    const isLoading = aiLoading
    const subscriptionPortfolio = React.useMemo(() => {
        const enrichedSubscriptions = subscriptions
            .map((subscription) => ({
                ...subscription,
                yearlyCents: subscription.amountCents * MONTHS_IN_YEAR,
            }))
            .sort((a, b) => {
                if (b.amountCents !== a.amountCents) return b.amountCents - a.amountCents
                return a.description.localeCompare(b.description)
            })

        const monthlyTotalCents = enrichedSubscriptions.reduce((sum, subscription) => sum + subscription.amountCents, 0)
        const yearlyTotalCents = monthlyTotalCents * MONTHS_IN_YEAR
        const averageMonthlyCents = enrichedSubscriptions.length > 0
            ? Math.round(monthlyTotalCents / enrichedSubscriptions.length)
            : 0

        const enrichedSubscriptionsWithImpact = enrichedSubscriptions
            .map((subscription) => ({
                ...subscription,
                impactPct: monthlyTotalCents > 0
                    ? Math.round((subscription.amountCents / monthlyTotalCents) * 100)
                    : 0,
                transactionsHref: buildTransactionsUrl({
                    categoryId: subscription.categoryId,
                    type: "expense"
                })
            }))
            .sort((a, b) => {
                if (b.amountCents !== a.amountCents) return b.amountCents - a.amountCents
                return a.description.localeCompare(b.description)
            })

        const visiblePortfolioSubscriptions = enrichedSubscriptionsWithImpact.slice(0, PORTFOLIO_MAX_ITEMS)

        return {
            averageMonthlyCents,
            monthlyTotalCents,
            yearlyTotalCents,
            visiblePortfolioSubscriptions,
            hiddenPortfolioCount: Math.max(0, enrichedSubscriptions.length - visiblePortfolioSubscriptions.length)
        }
    }, [subscriptions])

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
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-soft" />
                        <div className="relative h-12 w-12 rounded-2xl bg-background/50 border border-primary/20 flex items-center justify-center shadow-lg">
                            <Sparkles className="h-6 w-6 text-primary animate-pulse-soft" />
                        </div>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground animate-pulse-soft">
                        Sto leggendo i dati più recenti...
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
                        <p className="max-w-[300px] text-sm font-medium leading-relaxed text-muted-foreground">Servono ancora più movimenti per stimare con affidabilità il saldo totale del mese.</p>
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
            description="Una sintesi leggibile del mese in corso"
        >
            <motion.div
                variants={containerVariants}
                initial={prefersReducedMotion ? false : "hidden"}
                animate={prefersReducedMotion ? undefined : "visible"}
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
                                        "px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider",
                                        forecast.primarySource === "brain"
                                            ? "bg-primary/10 text-primary border-primary/20"
                                            : "bg-muted text-muted-foreground border-border"
                                    )}>
                                        {forecast.primarySource === "brain" ? "Fonte Brain" : "Fonte Storico"}
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider",
                                        forecast.confidence === "high"
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                            : forecast.confidence === "medium"
                                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                    )}>
                                        {forecast.confidence === "high"
                                            ? "Affidabilità alta"
                                            : forecast.confidence === "medium"
                                                ? "Affidabilità media"
                                                : "Affidabilità bassa"}
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
                                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                    Saldo base totale meno spesa residua stimata del mese.
                                </p>
                            </div>
                        </SubSectionCard>
                    </motion.div>
                )}

                {/* 2. Periodic expenses */}
                {subscriptions.length > 0 && (
                    <motion.div variants={itemVariants}>
                        <SubSectionCard
                            label="Spese periodiche attive"
                            icon={<Wallet className="h-4 w-4 text-primary" />}
                        >
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                                    <KpiCard
                                        compact
                                        title="Voci periodiche"
                                        value={subscriptions.length}
                                        icon={Wallet}
                                        tone="neutral"
                                        className="rounded-xl border border-border/60 bg-background/70"
                                        valueClassName="text-xl sm:text-2xl lg:text-3xl"
                                    />
                                    <KpiCard
                                        compact
                                        title="Totale mensile"
                                        value={formatCents(subscriptionPortfolio.monthlyTotalCents, currency, locale)}
                                        icon={TrendingUp}
                                        tone="neutral"
                                        className="rounded-xl border border-border/60 bg-background/70"
                                        valueClassName="text-xl sm:text-2xl lg:text-3xl"
                                    />
                                    <KpiCard
                                        compact
                                        title="Totale annuo"
                                        value={formatCents(subscriptionPortfolio.yearlyTotalCents, currency, locale)}
                                        icon={LineChart}
                                        tone="neutral"
                                        className="rounded-xl border border-border/60 bg-background/70"
                                        valueClassName="text-xl sm:text-2xl lg:text-3xl"
                                    />
                                    <KpiCard
                                        compact
                                        title="Costo medio"
                                        value={formatCents(subscriptionPortfolio.averageMonthlyCents, currency, locale)}
                                        icon={Sparkles}
                                        tone="neutral"
                                        className="rounded-xl border border-border/60 bg-background/70"
                                        valueClassName="text-xl sm:text-2xl lg:text-3xl"
                                    />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <SubscriptionPortfolioCard
                                        items={subscriptionPortfolio.visiblePortfolioSubscriptions}
                                        hiddenCount={subscriptionPortfolio.hiddenPortfolioCount}
                                        formatAmount={(amountCents) => formatCents(amountCents, currency, locale)}
                                    />
                                </div>
                            </div>
                        </SubSectionCard>
                    </motion.div>
                )}
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
