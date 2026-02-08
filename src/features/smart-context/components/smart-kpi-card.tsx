
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Bot, ArrowRight } from "lucide-react"
import { KpiCard, KpiCardProps } from "@/components/patterns/kpi-card"
import { ContextMessage } from "../logic/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SmartKpiCardProps extends KpiCardProps {
    context?: ContextMessage
    badge?: React.ReactNode
}

export function SmartKpiCard({ context, badge, ...props }: SmartKpiCardProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Determine Sparkle Color based on level
    const sparkleColors = {
        info: "text-indigo-500",
        success: "text-emerald-500",
        warning: "text-amber-500",
        danger: "text-rose-500"
    }

    const overlayColors = {
        info: "bg-indigo-500/5",
        success: "bg-emerald-500/5",
        warning: "bg-amber-500/5",
        danger: "bg-rose-500/5"
    }

    const handleSparkleClick = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent parent card click
        setIsOpen(!isOpen)
    }

    return (
        <div className="relative h-full group">
            <KpiCard badge={badge} {...props} />

            {/* SPARKLE TRIGGER */}
            {context && !isOpen && (
                <button
                    onClick={handleSparkleClick}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full hover:bg-background/80 transition-colors"
                >
                    <Sparkles
                        className={cn(
                            "h-5 w-5 animate-pulse",
                            sparkleColors[context.level]
                        )}
                    />
                </button>
            )}

            {/* SMART CONTEXT OVERLAY */}
            <AnimatePresence>
                {isOpen && context && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className={cn(
                            "absolute inset-0 z-20 rounded-xl overflow-hidden flex flex-col p-6",
                            "bg-background/80 border border-white/20 shadow-xl",
                            overlayColors[context.level]
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Bot className={cn("h-5 w-5", sparkleColors[context.level])} />
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", sparkleColors[context.level])}>
                                    Numa Insight
                                </span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* BODY (Typewriter effect could be added here, static for now) */}
                        <div className="flex-1 overflow-y-auto">
                            <h4 className="text-lg font-bold mb-2 leading-tight">{context.title}</h4>
                            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                {context.message}
                            </p>
                        </div>

                        {/* FOOTER */}
                        {context.actionLabel && context.actionUrl && (
                            <div className="mt-4 pt-4 border-t border-border/10">
                                <Link href={context.actionUrl} passHref legacyBehavior>
                                    <Button size="sm" variant="ghost" className="w-full justify-between group-hover:bg-primary/5">
                                        {context.actionLabel}
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
