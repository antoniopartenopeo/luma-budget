"use client"

import * as React from "react"
import { ExpandableCard } from "@/components/patterns/expandable-card"
import { SubSectionCard } from "@/components/patterns/sub-section-card"
import { cn } from "@/lib/utils"
import { Compass, Target, CheckCircle2, Sparkles } from "lucide-react"
import { GoalScenarioResult, ScenarioKey } from "@/VAULT/goals/types"
import { Badge } from "@/components/ui/badge"

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
    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-4">
                <Compass className="h-5 w-5 text-indigo-500" />
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
                                icon={isActive ? <CheckCircle2 className="h-4 w-4 text-indigo-500" /> : <Target className="h-4 w-4 text-muted-foreground" />}
                                className={cn(
                                    "h-full border-2 transition-all duration-300 relative overflow-hidden",
                                    isActive ? "border-indigo-500/50 shadow-lg bg-indigo-500/5" : "border-transparent opacity-80 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                                                    "text-lg font-black tabular-nums tracking-tight block",
                                                    !scenario.projection.canReach ? "text-muted-foreground text-sm font-bold" : (isActive ? "text-indigo-600" : "text-foreground")
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
