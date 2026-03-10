"use client"

import * as React from "react"
import { motion, useReducedMotion, useTransform } from "framer-motion"
import { ChevronDown, ChevronUp, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react"
import { InteractiveCardGhostIcon } from "@/components/patterns/interactive-card-ghost-icon"
import {
    INTERACTIVE_CARD_HOVER_STATE,
    INTERACTIVE_CARD_TRANSITION,
    resolveInteractiveSurfaceStyle,
    useInteractiveTilt,
    withAlpha
} from "@/components/patterns/interactive-surface"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EngineStep {
    icon: LucideIcon
    colorClass: string
    bgClass: string
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
    certificationTitle?: string
    certificationSubtitle?: string
    className?: string
}

const NUMA_ENGINE_UNIVERSAL_TITLE = "Come Funziona Numa"
const NUMA_ENGINE_AUDIT_OPEN_LABEL = "Apri dettagli"
const NUMA_ENGINE_AUDIT_CLOSE_LABEL = "Chiudi dettagli"
const ENGINE_ACCENT_COLOR = "#0ea5a8"

function resolveEngineStepColor(colorClass: string): string {
    if (colorClass.includes("emerald")) return "#10b981"
    if (colorClass.includes("amber")) return "#f59e0b"
    if (colorClass.includes("slate")) return "#64748b"
    return ENGINE_ACCENT_COLOR
}

export function NumaEngineCard({
    icon: BackgroundIcon,
    steps,
    auditStats,
    transparencyNote,
    certificationTitle = "Certificazione Privacy",
    certificationSubtitle = "Analisi 100% Locale e Verificata.",
    className
}: NumaEngineCardProps) {
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [activeStep, setActiveStep] = React.useState(0)
    const prefersReducedMotion = useReducedMotion()
    const hasAudit = Boolean(auditStats && auditStats.length > 0)
    const {
        depthX,
        depthY,
        isInteractive,
        isPrimed,
        handlePointerEnter,
        handlePointerMove,
        handlePointerLeave
    } = useInteractiveTilt({
        pointerSpring: { damping: 24, stiffness: 230, mass: 0.5 },
        depthSpring: { damping: 30, stiffness: 270, mass: 0.42 }
    })
    const rotateX = useTransform(depthY, [-0.5, 0.5], [4.6, -4.6])
    const rotateY = useTransform(depthX, [-0.5, 0.5], [-5.8, 5.8])
    const contentShiftX = useTransform(depthX, [-0.5, 0.5], [-3, 3])
    const contentShiftY = useTransform(depthY, [-0.5, 0.5], [-2, 2])

    return (
        <motion.div
            className={cn(
                "group/engine relative overflow-hidden rounded-[2.5rem] surface-strong p-6 [transform-style:preserve-3d] transition-[transform,border-color,box-shadow,background-color] duration-300 sm:p-7",
                className
            )}
            onMouseEnter={handlePointerEnter}
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
            whileHover={isInteractive ? INTERACTIVE_CARD_HOVER_STATE : undefined}
            transition={INTERACTIVE_CARD_TRANSITION}
            style={isInteractive ? { rotateX, rotateY } : undefined}
        >
            <InteractiveCardGhostIcon
                icon={BackgroundIcon}
                isActive={isPrimed}
                floatDelay={0.06}
                className="right-2 top-0 inset-y-auto"
                wrapperClassName="h-28 w-28 sm:h-32 sm:w-32"
                iconClassName="h-20 w-20 opacity-70 sm:h-24 sm:w-24"
                tintStyle={{ color: withAlpha(ENGINE_ACCENT_COLOR, isPrimed ? 0.24 : 0.16) }}
                visibility="always"
            />

            <motion.div
                className="relative z-10"
                style={isInteractive ? { x: contentShiftX, y: contentShiftY } : undefined}
            >
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 rounded-full bg-primary" />
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
                            {NUMA_ENGINE_UNIVERSAL_TITLE}
                        </h4>
                    </div>
                    <span className="rounded-full border border-white/40 bg-white/44 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/12 dark:bg-white/[0.05]">
                        Motore di lettura
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-4">
                    {steps.map((step, idx) => {
                        const isActive = activeStep === idx
                        const StepIcon = step.icon
                        const stepColor = resolveEngineStepColor(step.colorClass)
                        const stepSurfaceStyle = resolveInteractiveSurfaceStyle(
                            stepColor,
                            isActive ? "active" : "rest",
                            "neutral"
                        )

                        return (
                            <motion.article
                                key={idx}
                                className="group/step relative overflow-hidden rounded-xl border glass-card p-4 [transform-style:preserve-3d] transition-[transform,border-color,box-shadow,background-color] duration-300"
                                style={{
                                    borderColor: stepSurfaceStyle.borderColor,
                                    backgroundColor: stepSurfaceStyle.backgroundColor,
                                    boxShadow: stepSurfaceStyle.boxShadow
                                }}
                                whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.01 }}
                                transition={INTERACTIVE_CARD_TRANSITION}
                                onMouseEnter={() => setActiveStep(idx)}
                                onFocusCapture={() => setActiveStep(idx)}
                            >
                                <div className="pointer-events-none absolute inset-0 opacity-[0.92]" style={{ backgroundImage: stepSurfaceStyle.backgroundImage }} />
                                <div className="pointer-events-none absolute inset-[1px] rounded-[calc(theme(borderRadius.xl)-1px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_34%,transparent_62%)] opacity-80" />

                                {idx < steps.length - 1 ? (
                                    <div className="pointer-events-none absolute right-[-1.4rem] top-8 hidden h-px w-6 sm:block">
                                        <div className="h-px w-full bg-border/55" />
                                    </div>
                                ) : null}

                                <InteractiveCardGhostIcon
                                    icon={StepIcon}
                                    isActive={isActive}
                                    enableFloat={false}
                                    floatDelay={idx * 0.08}
                                    className="bottom-[-0.2rem] right-1 inset-y-auto"
                                    wrapperClassName="h-24 w-24"
                                    iconClassName="h-16 w-16 opacity-75"
                                    tintStyle={{ color: withAlpha(stepColor, isActive ? 0.22 : 0.16) }}
                                />

                                <div className="relative z-10">
                                    <div
                                        className={cn(
                                            "mb-3 flex h-10 w-10 items-center justify-center rounded-[1.1rem] border transition-[background-color,color,transform,border-color] duration-200",
                                            step.bgClass,
                                            step.colorClass,
                                            isActive && "scale-[1.04] border-current/10"
                                        )}
                                    >
                                        <StepIcon className="h-4 w-4" />
                                    </div>
                                    <p className={cn("text-[10px] font-bold uppercase tracking-[0.14em] opacity-80", step.colorClass)}>
                                        {step.stepLabel}
                                    </p>
                                    <p className="text-sm font-bold leading-tight text-foreground">
                                        {step.title}
                                    </p>
                                    <p className="text-xs font-medium leading-relaxed text-muted-foreground/90">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.article>
                        )
                    })}
                </div>
            </motion.div>

            <div className="relative z-10 mt-6 border-t border-border/40 pt-5">
                <div className="surface-subtle flex flex-col items-center justify-between gap-4 rounded-xl p-4 sm:flex-row">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-primary/16 bg-primary/10 text-primary">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
                                {certificationTitle}
                            </p>
                            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                {certificationSubtitle}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="h-9 w-full rounded-full border-primary/18 bg-white/62 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] transition-[background-color,border-color,transform,color] sm:w-auto dark:bg-white/[0.06]"
                        disabled={!hasAudit}
                    >
                        {isExpanded ? <ChevronUp className="mr-2 h-3 w-3" /> : <ChevronDown className="mr-2 h-3 w-3" />}
                        {isExpanded ? NUMA_ENGINE_AUDIT_CLOSE_LABEL : NUMA_ENGINE_AUDIT_OPEN_LABEL}
                    </Button>
                </div>

                {isExpanded && hasAudit && auditStats ? (
                    <motion.div
                        className="glass-card mt-5 rounded-[2rem] border border-white/35 p-5"
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {auditStats.map((stat, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="mb-2 flex items-center gap-2 text-primary">
                                        {stat.icon ? <stat.icon className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80">{stat.label}</span>
                                    </div>
                                    <p className="text-xl font-black tracking-tighter text-foreground tabular-nums">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs font-medium leading-tight text-muted-foreground/90">
                                        {stat.subValue}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {transparencyNote ? (
                            <div className="surface-subtle mt-6 flex items-start gap-2 rounded-xl p-3">
                                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                                <p className="text-xs font-medium leading-relaxed text-muted-foreground/90">
                                    <strong>Nota di Trasparenza:</strong> {transparencyNote}
                                </p>
                            </div>
                        ) : null}
                    </motion.div>
                ) : null}
            </div>
        </motion.div>
    )
}
