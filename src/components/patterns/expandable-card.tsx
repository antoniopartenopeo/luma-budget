"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface ExpandableCardProps {
    children?: React.ReactNode
    expandedContent?: React.ReactNode
    title: React.ReactNode
    description?: React.ReactNode
    icon?: React.ReactNode
    extraHeaderActions?: React.ReactNode
    className?: string
    contentClassName?: string
    indicatorColor?: string
    expanded?: boolean
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
    expanded,
    isDefaultExpanded = false,
    onToggle
}: ExpandableCardProps) {
    const [internalExpanded, setInternalExpanded] = React.useState(isDefaultExpanded)
    const contentId = React.useId()
    const resolvedIndicatorColor = indicatorColor ?? "bg-primary/50"
    const canExpand = Boolean(expandedContent)
    const isControlled = typeof expanded === "boolean"
    const isExpanded = isControlled ? expanded : internalExpanded

    const handleToggle = () => {
        if (!canExpand) return
        const nextState = !isExpanded
        if (!isControlled) {
            setInternalExpanded(nextState)
        }
        onToggle?.(nextState)
    }

    return (
        <Card
            className={cn(
                "group relative overflow-hidden rounded-[2.5rem] border-none glass-panel transition-all duration-500",
                isExpanded
                    ? "shadow-2xl ring-1 ring-primary/20"
                    : "hover:shadow-2xl hover:bg-white/70 dark:hover:bg-slate-900/70",
                className
            )}
        >
            {/* Visual Indicator Stripe (Left) - always present for visual consistency */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 z-20", resolvedIndicatorColor)} />

            {/* Reflection Accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 dark:from-white/5 to-transparent pointer-events-none z-10" />

            <div className="relative z-20 p-6 sm:p-8">
                {/* Header Row */}
                <div className="flex items-start gap-3 sm:gap-4">
                    <button
                        type="button"
                        onClick={handleToggle}
                        aria-expanded={canExpand ? isExpanded : undefined}
                        aria-controls={canExpand ? contentId : undefined}
                        disabled={!canExpand}
                        className={cn(
                            "flex min-w-0 flex-1 items-start gap-3 sm:gap-4 rounded-2xl text-left transition-colors",
                            canExpand
                                ? "cursor-pointer hover:bg-background/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                                : "cursor-default"
                        )}
                    >
                        {icon && (
                            <div className="mt-0.5 h-11 w-11 sm:h-12 sm:w-12 rounded-2xl border border-border/50 bg-background/80 dark:bg-slate-800/90 flex items-center justify-center shadow-sm shrink-0">
                                {icon}
                            </div>
                        )}

                        <div className="flex-1 min-w-0 pt-0.5">
                            {typeof title === "string" ? (
                                <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground break-words">
                                    {title}
                                </h3>
                            ) : (
                                title
                            )}

                            {description && (
                                <div className="mt-1.5">
                                    {typeof description === "string" ? (
                                        <p className="text-sm font-medium text-muted-foreground leading-snug break-words">
                                            {description}
                                        </p>
                                    ) : (
                                        description
                                    )}
                                </div>
                            )}
                        </div>

                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                            className={cn(
                                "mt-0.5 rounded-full p-2 transition-colors",
                                canExpand
                                    ? "bg-primary/5 text-primary/60 group-hover:bg-primary/10 group-hover:text-primary"
                                    : "bg-muted/40 text-muted-foreground/50"
                            )}
                        >
                            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                        </motion.div>
                    </button>

                    {extraHeaderActions ? (
                        <div className="shrink-0 self-center">{extraHeaderActions}</div>
                    ) : null}
                </div>

                {children ? (
                    <div className={cn("mt-5 sm:mt-6", contentClassName)}>
                        {children}
                    </div>
                ) : null}

                {/* Expanded Content Section */}
                <AnimatePresence initial={false}>
                    {isExpanded && expandedContent && (
                        <motion.div
                            id={contentId}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="mt-5 border-t border-border/30 pt-5 sm:mt-6 sm:pt-6">
                                {expandedContent}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    )
}
