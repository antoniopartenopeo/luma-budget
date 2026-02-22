"use client"

import { ReactNode } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface WizardShellProps {
    title: string
    subtitle: string
    step: "upload" | "review" | "summary"
    headerExtra?: ReactNode
    topBar?: ReactNode
    children: ReactNode
    footer: ReactNode
    className?: string
}

interface WizardStepConfig {
    id: WizardShellProps["step"]
    label: string
}

const WIZARD_STEPS: WizardStepConfig[] = [
    { id: "upload", label: "Carica" },
    { id: "review", label: "Controlla" },
    { id: "summary", label: "Conferma" },
]

export function WizardShell({
    title,
    subtitle,
    step,
    headerExtra,
    topBar,
    children,
    footer,
    className
}: WizardShellProps) {
    return (
        <div className="flex min-h-[70vh] flex-col animate-enter-up">
            <div className="shrink-0 border-b border-border/60">
                <div className="px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                            <h2 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                                {title}
                            </h2>
                            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                {subtitle}
                            </p>
                        </div>
                        {headerExtra && <div className="shrink-0">{headerExtra}</div>}
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        {WIZARD_STEPS.map((wizardStep, index) => {
                            const isActive = wizardStep.id === step
                            const isCompleted =
                                wizardStep.id === "upload"
                                    ? step !== "upload"
                                    : wizardStep.id === "review"
                                        ? step === "summary"
                                        : false

                            return (
                                <div
                                    key={wizardStep.id}
                                    className={cn(
                                        "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                                        isActive && "border-primary/30 bg-primary/5 text-foreground",
                                        !isActive && isCompleted && "border-border/60 bg-muted/10 text-foreground",
                                        !isActive && !isCompleted && "border-border/50 bg-transparent text-muted-foreground"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium",
                                            isActive && "border-primary/30 bg-primary/10 text-primary",
                                            !isActive && isCompleted && "border-border/60 bg-muted/20 text-foreground",
                                            !isActive && !isCompleted && "border-border/60 bg-transparent text-muted-foreground"
                                        )}
                                    >
                                        {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                                    </span>
                                    <span className={cn(
                                        "truncate text-sm font-medium",
                                        isActive && "text-primary"
                                    )}>
                                        {wizardStep.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {topBar && (
                <div className="shrink-0 border-b border-border/60">
                    {topBar}
                </div>
            )}

            <div className={cn(
                "min-h-0 flex-1 overflow-x-hidden",
                className
            )}>
                <div className="h-full w-full px-4 py-4 sm:px-6 sm:py-6">
                    {children}
                </div>
            </div>

            <div className="shrink-0 border-t border-border/60">
                <div className="px-4 py-3 sm:px-6">
                    {footer}
                </div>
            </div>
        </div>
    )
}
