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
    ...props
}: MacroSectionProps) {
    const isPremium = variant === "premium"
    const isWarning = status === "warning"
    const isCritical = status === "critical"

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
        }
    }

    return (
        <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className={cn("w-full relative", className)}
            {...props}
        >
            <Card className={cn(
                "relative overflow-hidden border-none p-1 rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl transition-all duration-500",
                "shadow-xl dark:border-white/5",
                isWarning && "shadow-[0_0_40px_-10px_rgba(251,191,36,0.2)] ring-1 ring-amber-500/20",
                isCritical && "shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/20"
            )}>
                {/* Visual Glass Reflection Accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 dark:from-white/5 to-transparent pointer-events-none" />

                {/* Ambient Glows */}
                {(isPremium || isWarning || isCritical) && (
                    <div
                        className={cn(
                            "absolute top-[-20%] right-[-20%] w-[400px] h-[400px] blur-[120px] rounded-full pointer-events-none opacity-60",
                            isWarning && "bg-amber-500/10",
                            isCritical && "bg-rose-500/10",
                            isPremium && !isWarning && !isCritical && "bg-primary/10"
                        )}
                    />
                )}

                {(title || description || headerActions) && (
                    <CardHeader className="relative z-10 px-8 pt-8 pb-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                {title && (
                                    <div className={cn(
                                        "text-xl font-bold tracking-tight text-foreground",
                                        isPremium && "text-2xl"
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
                            {headerActions && <div>{headerActions}</div>}
                        </div>
                    </CardHeader>
                )}

                <CardContent className={cn(
                    "relative z-10 px-8 pb-8 pt-4",
                    !title && !description && "pt-8",
                    contentClassName
                )}>
                    {children}
                </CardContent>
            </Card>
        </motion.div>
    )
}
