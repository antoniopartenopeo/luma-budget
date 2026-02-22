"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, ChevronDown, ChevronUp, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface EngineStep {
    icon: LucideIcon
    colorClass: string // e.g. "text-primary", "text-amber-500"
    bgClass: string // e.g. "bg-primary/10"
    stepLabel: string
    title: string
    description: string
}

export interface AuditStat {
    icon?: LucideIcon
    label: string
    value: string
    subValue: string
}

interface NumaEngineCardProps {
    icon: LucideIcon
    steps: EngineStep[]
    auditStats?: AuditStat[]
    transparencyNote?: string
    auditLabel?: string // Label for the button e.g. "Vedi Audit Tecnico"
    certificationTitle?: string
    certificationSubtitle?: string
    className?: string
}

const NUMA_ENGINE_UNIVERSAL_TITLE = "Come Funziona Numa"

/**
 * NumaEngineCard
 * ==============
 * The canonical representation of the "Numa Method" or "Numa AI Engine".
 * Features:
 * 1. Glass Panel Styling
 * 2. 3-Step Visual Process (Always Visible)
 * 3. Expandable "Audit" Section (Footer) with strict Grid Layout
 */
export function NumaEngineCard({
    icon: BackgroundIcon,
    steps,
    auditStats,
    transparencyNote,
    auditLabel = "Vedi Audit Tecnico",
    certificationTitle = "Certificazione Privacy",
    certificationSubtitle = "Analisi 100% Locale e Verificata.",
    className
}: NumaEngineCardProps) {
    const [isExpanded, setIsExpanded] = React.useState(false)

    // Helper to render stats
    const hasAudit = auditStats && auditStats.length > 0

    return (
        <div className={cn(
            "relative overflow-hidden glass-panel backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10",
            className
        )}>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <BackgroundIcon className="h-32 w-32 text-primary" />
            </div>

            {/* Header */}
            <div className="relative z-10">
                <div className="mb-8 flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">{NUMA_ENGINE_UNIVERSAL_TITLE}</h4>
                    </div>
                </div>

                {/* 3 Visual Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
                    {steps.map((step, idx) => (
                        <React.Fragment key={idx}>
                            <div className="space-y-3 relative group">
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200",
                                    step.bgClass,
                                    step.colorClass
                                )}>
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <p className={cn("text-xs font-black uppercase tracking-wide opacity-80", step.colorClass)}>
                                    {step.stepLabel}
                                </p>
                                <p className="text-sm font-bold text-foreground leading-tight">
                                    {step.title}
                                </p>
                                <p className="text-xs text-muted-foreground/90 leading-relaxed font-medium">
                                    {step.description}
                                </p>
                            </div>

                            {/* Arrow for Desktop (between steps) */}
                            {idx < steps.length - 1 && (
                                <div className="hidden sm:block absolute top-5 right-[-12px] w-6 h-[1px] bg-border/60" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Expandable Footer (Audit) */}
            <div className="mt-10 pt-8 border-t border-border/40 relative z-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold uppercase tracking-wide text-foreground">{certificationTitle}</p>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{certificationSubtitle}</p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full sm:w-auto text-xs font-black uppercase tracking-wide h-8 rounded-full border-primary/20 hover:bg-primary/5 transition-all group"
                        disabled={!hasAudit}
                    >
                        {isExpanded ? <ChevronUp className="mr-2 h-3 w-3" /> : <ChevronDown className="mr-2 h-3 w-3" />}
                        {isExpanded ? "Chiudi dettagli" : auditLabel}
                    </Button>
                </div>

                {/* Expanded Content */}
                {isExpanded && hasAudit && (
                    <div className="mt-6 p-6 rounded-2xl bg-primary/[0.03] border border-primary/10 animate-enter-up">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {auditStats.map((stat, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        {stat.icon ? <stat.icon className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                        <span className="text-xs font-black uppercase tracking-tight">{stat.label}</span>
                                    </div>
                                    <p className="text-xl font-black text-foreground tabular-nums tracking-tighter">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground/90 leading-tight font-medium">
                                        {stat.subValue}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {transparencyNote && (
                            <div className="mt-6 flex items-start gap-2 p-3 rounded-xl bg-background/40 border border-border/40">
                                <Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground/90 leading-relaxed font-medium">
                                    <strong>Nota di Trasparenza:</strong> {transparencyNote}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
