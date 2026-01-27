"use client"

import { ReactNode } from "react"
import { Upload, Filter, CheckCircle2, ArrowRight, Download } from "lucide-react"
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

    const steps = [
        {
            id: "upload",
            label: "1. Upload",
            icon: Upload,
            active: step === "upload",
            completed: step === "review" || step === "summary"
        },
        {
            id: "review",
            label: "2. Revisione",
            icon: Filter,
            active: step === "review",
            completed: step === "summary"
        },
        {
            id: "summary",
            label: "3. Riepilogo",
            icon: CheckCircle2,
            active: step === "summary",
            completed: false
        }
    ]

    return (
        <div className="flex flex-col h-full bg-background animate-enter-up">
            {/* 1. Shell Header (Sticky Top) */}
            <div className="shrink-0 pt-6 pb-4 px-6 md:px-8 border-b bg-card/80 backdrop-blur-xl z-20 flex flex-col gap-6 shadow-sm">

                {/* Visual Stepper */}
                <div className="mx-auto w-full max-w-xl grid grid-cols-3 gap-4">
                    {steps.map((s, i) => (
                        <div
                            key={s.id}
                            className={cn(
                                "flex flex-col items-center p-3 rounded-xl border transition-all duration-300",
                                s.active
                                    ? "bg-card shadow-md ring-1 ring-primary/20 scale-105 border-primary/20"
                                    : "bg-muted/30 border-transparent opacity-60 grayscale-[0.5]"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors",
                                s.active
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : s.completed
                                        ? "bg-primary/20 text-primary"
                                        : "bg-muted text-muted-foreground"
                            )}>
                                <s.icon className="h-4 w-4" />
                            </div>
                            <span className={cn(
                                "text-xs font-medium tracking-tight",
                                s.active ? "text-foreground font-bold" : "text-muted-foreground"
                            )}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="flex items-end justify-between gap-4 max-w-5xl mx-auto w-full">
                    <div className="min-w-0 space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                            {title}
                        </h2>
                        <p className="text-muted-foreground text-sm truncate max-w-md">
                            {subtitle}
                        </p>
                    </div>

                    {headerExtra && (
                        <div className="shrink-0">
                            {headerExtra}
                        </div>
                    )}
                </div>
            </div>

            {/* 1b. Top Bar (Optional, Fixed) */}
            {topBar && (
                <div className="shrink-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                    {topBar}
                </div>
            )}

            {/* 2. Scrollable Content Area */}
            <div className={cn(
                "flex-1 overflow-y-auto overflow-x-hidden min-h-0", // min-h-0 is crucial for flex children scrolling
                "bg-background",
                className
            )}>
                <div className="w-full h-full max-w-5xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </div>

            {/* 3. Shell Footer (Sticky Bottom) */}
            <div className="shrink-0 p-4 md:p-6 border-t bg-card/80 backdrop-blur-xl z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    {footer}
                </div>
            </div>
        </div>
    )
}
