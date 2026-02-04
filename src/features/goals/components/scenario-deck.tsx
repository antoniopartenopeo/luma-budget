"use client"

import * as React from "react"
import { ExpandableCard } from "@/components/patterns/expandable-card"
import { SubSectionCard } from "@/components/patterns/sub-section-card"
import { cn } from "@/lib/utils"
import { Compass, Target, CheckCircle2, Sparkles, ShieldCheck, Info, ChevronDown, ChevronUp, Activity, BarChart3, Lock } from "lucide-react"
import { GoalScenarioResult, ScenarioKey, CalibrationMetadata } from "@/VAULT/goals/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    const [showAudit, setShowAudit] = React.useState(false)
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
                                <div className="space-y-4">
                                    <p className="text-xs text-muted-foreground font-medium min-h-[40px] leading-snug">
                                        {scenario.config.description}
                                    </p>

                                    {/* Primary Metric: Time to Goal + Date */}
                                    <div className="pt-2 border-t border-border/40">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tempo Stimato</span>
                                            <div className="text-right">
                                                <span className={cn(
                                                    "text-xl sm:text-2xl font-black tabular-nums tracking-tighter block leading-none mb-1",
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
                        <div className="space-y-4">
                            <p className="text-xs text-muted-foreground font-medium min-h-[40px] leading-snug">
                                Configura manualmente il tuo mix di risparmio ideale.
                            </p>

                            <div className="pt-2 border-t border-border/40 flex items-center justify-between h-[42px]">
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

            {/* The Numa Engine - Visual Logic Legend */}
            <div className="mt-12 relative overflow-hidden glass-panel rounded-[2.5rem] p-8 sm:p-10 mb-8 border-none">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Compass className="h-32 w-32 text-primary" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-foreground/80">Il Metodo Numa</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
                        {/* Step 1: Real Data */}
                        <div className="space-y-3 relative group">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-primary">1. Passato Reale</p>
                            <p className="text-xs font-bold text-foreground leading-tight">Analisi transazioni</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Numa scansiona la tua storia vera per capire quanto guadagni e spendi realmente ogni mese.
                            </p>
                        </div>

                        {/* Arrows for Desktop */}
                        <div className="hidden sm:block absolute left-[31%] top-5 w-[2%] h-[1px] bg-slate-200 dark:bg-white/10" />

                        {/* Step 2: Behavior Choice */}
                        <div className="space-y-3 relative group">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-amber-600/80 dark:text-amber-400/80">2. Calibrazione Adattiva</p>
                            <p className="text-xs font-bold text-foreground leading-tight">Il tuo Ritmo</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Numa calibra l'intensità del taglio sulla tua "elasticità": se hai margine spinge di più, se sei al limite ti protegge.
                            </p>
                        </div>

                        {/* Arrows for Desktop */}
                        <div className="hidden sm:block absolute left-[64%] top-5 w-[2%] h-[1px] bg-slate-200 dark:bg-white/10" />

                        {/* Step 3: Math Result */}
                        <div className="space-y-3 relative group">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                                <Target className="h-5 w-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">3. Futuro Stimato</p>
                            <p className="text-xs font-bold text-foreground leading-tight">La Proiezione</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Numa calcola quanta strada puoi fare con quel carburante. Più lontano è l'obiettivo, più tempo servirà.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Audit Toggle Button */}
                <div className="mt-10 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-black uppercase tracking-widest text-foreground">Certificazione Adaptive Core</p>
                            <p className="text-[10px] text-muted-foreground font-medium">Ogni calcolo è verificato in locale sulla tua storia creditizia reale.</p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAudit(!showAudit)}
                        className="w-full sm:w-auto text-[10px] font-black uppercase tracking-widest h-8 rounded-full border-primary/20 hover:bg-primary/5 transition-all group"
                    >
                        {showAudit ? <ChevronUp className="mr-2 h-3 w-3" /> : <ChevronDown className="mr-2 h-3 w-3" />}
                        {showAudit ? "Chiudi Audit" : "Vedi Audit Tecnico"}
                    </Button>
                </div>

                {/* Audit Details Area */}
                {showAudit && calibration && (
                    <div className="mt-6 p-6 rounded-2xl bg-primary/[0.03] border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Metric 1: Analysis Depth */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary mb-2">
                                    <Activity className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Profondità Audit</span>
                                </div>
                                <p className="text-lg font-black text-foreground tabular-nums">Ultimi 6 Mesi</p>
                                <p className="text-[10px] text-muted-foreground leading-tight italic font-medium">
                                    Scansione integrale di {activeScenario.config.label === "Nessun Ritmo" ? "tutte le" : "ogni singola"} transazione precedente.
                                </p>
                            </div>

                            {/* Metric 2: Stability */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary mb-2">
                                    <BarChart3 className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Stabilità Rilevata</span>
                                </div>
                                <p className="text-lg font-black text-foreground tabular-nums">{(calibration.stabilityFactor * 100).toFixed(1)}%</p>
                                <p className="text-[10px] text-muted-foreground leading-tight italic font-medium">
                                    Basato su una volatilità di {formatCents(calibration.volatilityCents, currency, locale)}/mese.
                                </p>
                            </div>

                            {/* Metric 3: Elasticity */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary mb-2">
                                    <Sparkles className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Elasticità (Extra)</span>
                                </div>
                                <p className="text-lg font-black text-foreground tabular-nums">{(calibration.elasticityIndex * 100).toFixed(1)}%</p>
                                <p className="text-[10px] text-muted-foreground leading-tight italic font-medium">
                                    Quota di spese "non essenziali" che il Core può manovrare in sicurezza.
                                </p>
                            </div>

                            {/* Metric 4: Final Power */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-primary mb-2">
                                    <Lock className="h-3 w-3" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Calibrazione Finale</span>
                                </div>
                                <p className="text-lg font-black text-foreground tabular-nums">{activeScenario.config.savingsMap.superfluous}%</p>
                                <p className="text-[10px] text-muted-foreground leading-tight italic font-medium">
                                    Risparmio massimo suggerito per proteggere il tuo cuscino finanziario.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-start gap-2 p-3 rounded-xl bg-white/40 dark:bg-black/20 border border-primary/5">
                            <Info className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                            <p className="text-[10px] text-muted-foreground italic leading-relaxed font-medium">
                                <strong>Nota di Trasparenza:</strong> Numa non applica mai regole generiche. Questo piano è l'adattamento unico della tua storia reale: abbiamo calibrato l'intensità del Ritmo sulla tua stabilità e sui tuoi margini effettivi, per proteggere sempre la tua tranquillità finanziaria.
                            </p>
                        </div>
                    </div>
                )}
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
