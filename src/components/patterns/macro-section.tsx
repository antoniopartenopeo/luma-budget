"use client"

import * as React from "react"
import { motion, HTMLMotionProps, Variants } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface MacroSectionProps extends Omit<HTMLMotionProps<"div">, "title" | "children"> {
    title?: React.ReactNode
    description?: React.ReactNode
    headerActions?: React.ReactNode
    children: React.ReactNode
    variant?: "default" | "premium"
    status?: "default" | "warning" | "critical"
    className?: string
    contentClassName?: string
    background?: React.ReactNode
}

export const macroItemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98, filter: "blur(8px)" },
    visible: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
}

/**
 * MacroSection: La primitiva strutturale universale Numa Premium.
 * Allineata al "Budget Surface Spec" (Gold Standard).
 */
export function MacroSection({
    title,
    description,
    headerActions,
    children,
    variant = "default",
    status = "default",
    className,
    contentClassName,
    background,
    ...props
}: MacroSectionProps) {
    const isPremium = variant === "premium"
    const isWarning = status === "warning"
    const isCritical = status === "critical"

    return (
        <motion.div
            variants={macroItemVariants}
            initial="hidden"
            animate="visible"
            className={cn("w-full relative", className)}
            {...props}
        >
            <Card
                data-testid="macro-card"
                className={cn(
                    "relative border-none p-1 rounded-[2.5rem] glass-panel backdrop-blur-xl transition-all duration-500 overflow-hidden",
                    isWarning && "shadow-[0_0_40px_-10px_rgba(251,191,36,0.2)] ring-1 ring-amber-500/20",
                    isCritical && "shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/20"
                )}>
                {/* Visual Glass Reflection Accent - enhanced for dark mode */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 dark:from-white/[0.08] via-transparent to-transparent pointer-events-none" />

                {/* Integrated Background Slot (Radar, Grids, etc) */}
                {background && (
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        {background}
                    </div>
                )}

                {/* Background Slot (Radar, Grids, etc) removed for cleaner dark mode or kept for premium? */}
                {/* User wants zero 'macchie', removing Ambient Glows */}

                {(title || description || headerActions) && (
                    <CardHeader className="relative z-10 px-4 sm:px-8 pt-6 sm:pt-8 pb-2">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1">
                                {title && (
                                    <div className={cn(
                                        "text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-foreground",
                                        isPremium && "text-xl sm:text-2xl lg:text-3xl"
                                    )}>
                                        {title}
                                    </div>
                                )}
                                {description && (
                                    <div className="text-sm text-muted-foreground font-medium">
                                        {description}
                                    </div>
                                )}
                            </div>
                            {headerActions && <div className="min-w-0 shrink-0">{headerActions}</div>}
                        </div>
                    </CardHeader>
                )}

                <CardContent className={cn(
                    "relative z-10 px-4 sm:px-8 pb-6 sm:pb-8 pt-4",
                    !title && !description && "pt-6 sm:pt-8",
                    contentClassName
                )}>
                    {children}
                </CardContent>
            </Card>
        </motion.div>
    )
}
