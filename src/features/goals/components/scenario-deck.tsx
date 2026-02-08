"use client"

import * as React from "react"

import { SubSectionCard } from "@/components/patterns/sub-section-card"
import { NumaEngineCard } from "@/components/patterns/numa-engine-card"
import { cn } from "@/lib/utils"
import { Compass, Target, CheckCircle2, Sparkles } from "lucide-react"
import { GoalScenarioResult, ScenarioKey } from "@/VAULT/goals/types"
import { Badge } from "@/components/ui/badge"

import { formatCents } from "@/domain/money"
import { useCurrency } from "@/features/settings/api/use-currency"

interface ScenarioDeckProps {
    scenarios: GoalScenarioResult[]
    activeKey: ScenarioKey
    onSelect: (key: ScenarioKey) => void
    onCustomConfigClick: () => void
    className?: string
}

export function ScenarioDeck({
    scenarios,
    activeKey,
    onSelect,
    onCustomConfigClick,
    className
}: ScenarioDeckProps) {
    const { currency, locale } = useCurrency()

    // Find active scenario for audit
    const activeScenario = scenarios.find(s => s.key === activeKey)
    const calibration = activeScenario?.config.calibration
    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-4">
                <Compass className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold tracking-tight">Orientamento</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {scenarios.map((scenario) => {
                    const isActive = activeKey === scenario.key
                    const isBaseline = scenario.key === "baseline"

                    // Format "Time to Goal" or fallback with descriptive reason
                    let timeLabel = "—"
                    let dateLabel: string | null = null

                    if (!scenario.projection.canReach) {
                        // Use concise, neutral fallback
                        timeLabel = "Non stimabile"
                    } else if (scenario.projection.likelyMonths > 0) {
                        timeLabel = `~${scenario.projection.likelyMonths} Mesi`
                        // Format date as MMM YYYY
                        dateLabel = new Intl.DateTimeFormat("it-IT", {
                            month: "short",
                            year: "numeric"
                        }).format(scenario.projection.likelyDate)
                    } else if (scenario.projection.likelyMonths === 0) {
                        timeLabel = "Raggiunto"
                    }

                    // Approach label (replaces percentage badges)
                    const approachLabel = isBaseline ? "Ritmo corrente" : scenario.config.label

                    return (
                        <div
                            key={scenario.key}
                            onClick={() => onSelect(scenario.key)}
                            className="cursor-pointer h-full"
                        >
                            <SubSectionCard
                                variant={isActive ? "accent" : "default"}
                                label={scenario.config.label}
                                icon={isActive ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Target className="h-4 w-4 text-muted-foreground" />}
                                className={cn(
                                    "h-full border-2 transition-all duration-300 relative overflow-hidden",
                                    isActive ? "border-primary/50 shadow-lg bg-primary/5" : "border-transparent opacity-80 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <div className="space-y-4 flex-1 flex flex-col">
                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                        {scenario.config.description}
                                    </p>

                                    {/* Primary Metric: Time to Goal + Date */}
                                    <div className="pt-2 border-t border-border/40 mt-auto">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tempo Stimato</span>
                                            <div className="text-right">
                                                <span className={cn(
                                                    "text-2xl sm:text-3xl lg:text-4xl font-black tabular-nums tracking-tighter block leading-none mb-1",
                                                    !scenario.projection.canReach ? "text-muted-foreground text-sm font-bold" : (isActive ? "text-primary" : "text-foreground")
                                                )}>
                                                    {timeLabel}
                                                </span>
                                                {dateLabel && (
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                                        {dateLabel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtle Approach Label (replaces badges) */}
                                    <div className="min-h-[24px]">
                                        {!isBaseline && (
                                            <span className="text-[10px] text-muted-foreground/70 font-medium italic">
                                                Approccio: {approachLabel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </SubSectionCard>
                        </div>
                    )
                })}


                {/* 4. CUSTOM / ADVANCED CARD */}
                <div
                    onClick={() => {
                        onSelect("custom")
                        onCustomConfigClick()
                    }}
                    className="cursor-pointer h-full group"
                >
                    <SubSectionCard
                        variant={activeKey === "custom" ? "accent" : "default"}
                        label="Personalizzato"
                        icon={<Sparkles className={cn("h-4 w-4", activeKey === "custom" ? "text-amber-500 fill-amber-500/20" : "text-muted-foreground")} />}
                        className={cn(
                            "h-full border-2 border-dashed transition-all duration-300 relative overflow-hidden",
                            activeKey === "custom"
                                ? "border-amber-500/50 shadow-lg bg-amber-500/5"
                                : "border-border/60 hover:border-amber-500/30 hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
                        )}
                    >
                        <div className="space-y-4 flex-1 flex flex-col">
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Configura manualmente il tuo mix di risparmio ideale.
                            </p>

                            <div className="pt-2 border-t border-border/40 flex items-center justify-between h-[42px] mt-auto">
                                {/* h-[42px] aligns with visual height of other cards' metrics */}
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider group-hover:text-amber-600 transition-colors">
                                    Clicca per Configurare
                                </span>
                                <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                    <Sparkles className="h-4 w-4 text-muted-foreground group-hover:text-amber-600" />
                                </div>
                            </div>

                            {/* Empty space for alignment with badges */}
                            <div className="min-h-[24px]"></div>
                        </div>
                    </SubSectionCard>
                </div>

            </div>

            {/* The Numa Engine - Visual Logic Legend (Centralized) */}
            <div className="mt-12 mb-8">
                <NumaEngineCard
                    title="Il Metodo Numa"
                    icon={Compass}
                    steps={[
                        {
                            icon: CheckCircle2,
                            colorClass: "text-primary",
                            bgClass: "bg-primary/10",
                            stepLabel: "1. Passato Reale",
                            title: "Analisi Transazioni",
                            description: "Numa scansiona la tua storia vera per capire quanto guadagni e spendi realmente ogni mese."
                        },
                        {
                            icon: Sparkles,
                            colorClass: "text-amber-500",
                            bgClass: "bg-amber-500/10",
                            stepLabel: "2. Calibrazione Adattiva",
                            title: "Il tuo Ritmo",
                            description: "Numa calibra l'intensità del taglio sulla tua \"elasticità\": se hai margine spinge di più, se sei al limite ti protegge."
                        },
                        {
                            icon: Target,
                            colorClass: "text-emerald-500",
                            bgClass: "bg-emerald-500/10",
                            stepLabel: "3. Futuro Stimato",
                            title: "La Proiezione",
                            description: "Numa calcola quanta strada puoi fare con quel carburante. Più lontano è l'obiettivo, più tempo servirà."
                        }
                    ]}
                    certificationTitle="Certificazione Adaptive Core"
                    certificationSubtitle="Ogni calcolo è verificato in locale sulla tua storia creditizia reale."
                    transparencyNote="Numa non applica mai regole generiche. Questo piano è l'adattamento unico della tua storia reale: abbiamo calibrato l'intensità del Ritmo sulla tua stabilità e sui tuoi margini effettivi, per proteggere sempre la tua tranquillità finanziaria."
                    auditStats={calibration ? [
                        {
                            label: "Profondità Audit",
                            value: "Ultimi 6 Mesi",
                            subValue: `Scansione integrale di ${activeScenario?.config.label === "Nessun Ritmo" ? "tutte le" : "ogni singola"} transazione precedente.`
                        },
                        {
                            label: "Stabilità Rilevata",
                            value: `${(calibration.stabilityFactor * 100).toFixed(1)}%`,
                            subValue: `Basato su una volatilità di ${formatCents(calibration.volatilityCents, currency, locale)}/mese.`
                        },
                        {
                            label: "Elasticità (Extra)",
                            value: `${(calibration.elasticityIndex * 100).toFixed(1)}%`,
                            subValue: "Quota di spese \"non essenziali\" che il Core può manovrare in sicurezza."
                        },
                        {
                            label: "Calibrazione Finale",
                            value: `${activeScenario?.config.savingsMap.superfluous}%`,
                            subValue: "Risparmio massimo suggerito per proteggere il tuo cuscino finanziario."
                        }
                    ] : undefined}
                />
            </div>

            {/* Contextual Warning if needed */}
            <div className="mt-4 flex justify-end">
                {activeKey === "custom" && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-2 h-6 font-bold flex items-center gap-1.5 shadow-sm">
                        <Sparkles className="h-3 w-3" />
                        PERSONALIZZATO ATTIVO
                    </Badge>
                )}
            </div>
        </div>
    )
}
