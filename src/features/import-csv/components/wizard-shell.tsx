"use client"

import { ReactNode } from "react"
import { Upload, Filter, CheckCircle2 } from "lucide-react"
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
        <div className="flex flex-col min-h-[70vh] bg-background animate-enter-up">
            {/* 1. Shell Header (Sticky Top) */}
            <div className="shrink-0 py-2 px-3 md:px-4 border-b bg-card/80 backdrop-blur-xl z-20">
                <div className="flex md:hidden items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-base font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent truncate">
                            {title}
                        </h2>
                        <p className="text-muted-foreground text-xs truncate">
                            {subtitle}
                        </p>
                    </div>

                    {headerExtra && <div className="shrink-0">{headerExtra}</div>}
                </div>

                <div className="hidden md:grid grid-cols-[minmax(0,1fr)_minmax(0,28rem)_minmax(0,1fr)] items-center gap-3">
                    <div className="min-w-0">
                        <h2 className="text-lg font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent truncate">
                            {title}
                        </h2>
                        <p className="text-muted-foreground text-xs truncate">
                            {subtitle}
                        </p>
                    </div>

                    {/* Visual Stepper (centered) */}
                    <div className="grid w-full grid-cols-3 gap-1.5 justify-self-center">
                        {steps.map((s) => (
                            <div
                                key={s.id}
                                className={cn(
                                    "flex flex-col items-center px-1.5 py-1 rounded-lg border transition-all duration-300",
                                    s.active
                                        ? "bg-card shadow-sm ring-1 ring-primary/20 border-primary/20"
                                        : "bg-muted/30 border-transparent opacity-60 grayscale-[0.5]"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center mb-1 transition-colors",
                                    s.active
                                        ? "bg-primary text-primary-foreground"
                                        : s.completed
                                            ? "bg-primary/20 text-primary"
                                            : "bg-muted text-muted-foreground"
                                )}>
                                    <s.icon className="h-3 w-3" />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium tracking-tight leading-none",
                                    s.active ? "text-foreground font-bold" : "text-muted-foreground"
                                )}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="justify-self-end">{headerExtra ?? null}</div>
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
                <div className="w-full h-full p-2 md:p-4">
                    {children}
                </div>
            </div>

            {/* 3. Shell Footer (Sticky Bottom) */}
            <div className="shrink-0 p-2 md:p-3 border-t bg-card/80 backdrop-blur-xl z-20">
                <div className="w-full flex items-center justify-between">
                    {footer}
                </div>
            </div>
        </div>
    )
}
