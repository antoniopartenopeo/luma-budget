"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface ExpandableCardProps {
    children: React.ReactNode
    expandedContent?: React.ReactNode
    title: React.ReactNode
    description?: React.ReactNode
    icon?: React.ReactNode
    extraHeaderActions?: React.ReactNode
    className?: string
    contentClassName?: string
    indicatorColor?: string
    isDefaultExpanded?: boolean
    onToggle?: (expanded: boolean) => void
}

/**
 * ExpandableCard Pattern
 * =====================
 * 
 * A proprietary UI motor for cards that can expand to show more details.
 * Standardizes:
 * - Expansion logic & state
 * - Smooth framer-motion transitions
 * - Visual indicators (stripes, icons)
 * - Hover & Active states
 */
export function ExpandableCard({
    children,
    expandedContent,
    title,
    description,
    icon,
    extraHeaderActions,
    className,
    contentClassName,
    indicatorColor,
    isDefaultExpanded = false,
    onToggle
}: ExpandableCardProps) {
    const [isExpanded, setIsExpanded] = React.useState(isDefaultExpanded)

    const handleToggle = () => {
        const nextState = !isExpanded
        setIsExpanded(nextState)
        onToggle?.(nextState)
    }

    return (
        <Card
            className={cn(
                "group relative overflow-hidden rounded-[2.5rem] border-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl transition-all duration-500",
                isExpanded ? "shadow-2xl ring-1 ring-primary/20" : "shadow-xl hover:shadow-2xl hover:bg-white/70 dark:hover:bg-slate-900/70",
                className
            )}
        >
            {/* Visual Indicator Stripe (Left) */}
            {indicatorColor && (
                <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 z-20", indicatorColor)} />
            )}

            {/* Reflection Accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 dark:from-white/5 to-transparent pointer-events-none z-10" />

            <div
                className="relative z-20 p-6 sm:p-8 cursor-pointer select-none"
                onClick={handleToggle}
            >
                {/* Header Row */}
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-background/80 dark:bg-slate-800 border border-border/50 flex items-center justify-center shadow-sm shrink-0">
                            {icon}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            {typeof title === "string" ? (
                                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                                    {title}
                                </h3>
                            ) : (
                                title
                            )}
                        </div>
                        {description && (
                            <div className="mt-1">
                                {typeof description === "string" ? (
                                    <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
                                        {description}
                                    </p>
                                ) : (
                                    description
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {extraHeaderActions}
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="p-2 rounded-full bg-primary/5 text-primary/60 group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                        >
                            <ChevronDown className="h-5 w-5" />
                        </motion.div>
                    </div>
                </div>

                {/* Primary Content (Always Visible or part of the body) */}
                <div className={cn("mt-6", contentClassName)}>
                    {children}
                </div>

                {/* Expanded Content Section */}
                <AnimatePresence>
                    {isExpanded && expandedContent && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="pt-6 mt-6 border-t border-border/30">
                                {expandedContent}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    )
}
