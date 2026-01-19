"use client"

import { useMemo } from "react"
import { Dialog, DialogContent, DialogPortal, DialogOverlay } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Upload, FileSpreadsheet, Eye, Check } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

interface Step {
    id: string
    label: string
    icon: React.ElementType
}

interface WizardShellProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    subtitle?: string
    currentStepId: string
    steps: Step[]
    children: React.ReactNode
    footer: React.ReactNode
    onClose: () => void
    headerIcon?: React.ElementType
}

export function WizardShell({
    open,
    onOpenChange,
    title,
    subtitle,
    currentStepId,
    steps,
    children,
    footer,
    onClose,
    headerIcon: HeaderIcon = FileSpreadsheet
}: WizardShellProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)")

    const currentStepIdx = useMemo(() => {
        // Handle intermediate steps (processing, importing)
        if (currentStepId === "processing") return 2 // Between mapping and preview
        if (currentStepId === "importing") return 3 // Last step
        return steps.findIndex(s => s.id === currentStepId)
    }, [currentStepId, steps])

    // Should we show condensed header?
    const isCondensed = !isDesktop

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay />
                {/* 
                    Responsive Container:
                    - All viewports: fixed inset-0 (fullscreen)
                 */}
                <div
                    className={cn(
                        "fixed z-50 flex flex-col bg-background shadow-2xl duration-200",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                        // Fullscreen on all viewports
                        "inset-0"
                    )}
                    data-state={open ? "open" : "closed"}
                >
                    {/* Sticky Header */}
                    <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
                            <div className="flex items-center gap-3">
                                {HeaderIcon && <HeaderIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />}
                                <div>
                                    <h2 className="text-base md:text-lg font-bold truncate max-w-[200px] md:max-w-none">
                                        {title}
                                    </h2>
                                    {subtitle && (
                                        <p className="text-xs md:text-sm text-muted-foreground hidden md:block">
                                            {subtitle}
                                        </p>
                                    )}
                                    {/* Mobile Subtitle: Current Step */}
                                    {isCondensed && (
                                        <p className="text-xs text-muted-foreground md:hidden">
                                            Step {Math.max(1, currentStepIdx + 1)} di {steps.length}: {steps[currentStepIdx]?.label || "..."}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Step Indicator (Desktop Only) */}
                        {!isCondensed && (
                            <div className="flex items-center justify-center gap-2 px-6 pb-4">
                                {steps.map((s, idx) => (
                                    <div key={s.id} className="flex items-center gap-2">
                                        <div className={cn(
                                            "flex items-center justify-center w-9 h-9 rounded-full text-xs font-medium transition-all",
                                            idx < currentStepIdx && "bg-primary text-primary-foreground",
                                            idx === currentStepIdx && "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2",
                                            idx > currentStepIdx && "bg-muted text-muted-foreground"
                                        )}>
                                            <s.icon className="h-4 w-4" />
                                        </div>
                                        <span className={cn(
                                            "text-xs font-medium",
                                            idx === currentStepIdx ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {s.label}
                                        </span>
                                        {idx < steps.length - 1 && (
                                            <div className={cn(
                                                "w-8 h-0.5 mx-2",
                                                idx < currentStepIdx ? "bg-primary" : "bg-muted"
                                            )} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Mobile Progress Bar (Optional, for step progress) */}
                        {isCondensed && (
                            <div className="h-1 w-full bg-muted md:hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden flex flex-col relative w-full h-full">
                        {children}
                    </div>

                    {/* Sticky Footer */}
                    <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 md:px-6 md:py-4">
                        {footer}
                    </div>
                </div>
            </DialogPortal>
        </Dialog>
    )
}
