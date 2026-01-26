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
    className?: string
    contentClassName?: string
}

/**
 * MacroSection: La primitiva strutturale universale Numa Premium.
 * Centralizza:
 * - Radius: Var(--radius) [40px] via Card default
 * - Materiale: Glass panel via Card default
 * - Motion: Scale-in 0.98 -> 1
 * - Depth: Shadow-xl via Card default
 */
export function MacroSection({
    title,
    description,
    headerActions,
    children,
    variant = "default",
    className,
    contentClassName,
    ...props
}: MacroSectionProps) {
    const isPremium = variant === "premium"

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} // Custom premium ease
            className={cn("w-full relative", className)}
            {...props}
        >
            <Card className={cn(
                "relative overflow-hidden border-none p-1",
                isPremium && "bg-gradient-to-br from-white/40 dark:from-white/5 to-transparent"
            )}>
                {/* Ambient Glows for Premium Variant */}
                {isPremium && (
                    <>
                        <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-60" />
                        <div className="absolute bottom-[-20%] left-[-20%] w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none opacity-40" />
                    </>
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
