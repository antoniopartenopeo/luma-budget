"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SubSectionCardProps {
    children: React.ReactNode
    label?: string
    icon?: React.ReactNode
    extra?: React.ReactNode
    className?: string
    variant?: "default" | "premium" | "accent"
}

/**
 * SubSectionCard Pattern
 * =====================
 * 
 * A proprietary UI motor for inner cards (cards within cards/sections).
 * Used for specific insights, metrics, or sub-features.
 */
export function SubSectionCard({
    children,
    label,
    icon,
    extra,
    className,
    variant = "default"
}: SubSectionCardProps) {
    const variants = {
        default: "glass-card hover:bg-white/70 dark:bg-white/[0.06] dark:border-white/15 dark:hover:bg-white/[0.1]",
        premium: "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-inner",
        accent: "bg-gradient-to-br from-primary/10 to-cyan-500/5 border border-primary/20 shadow-inner"
    }

    return (
        <div className={cn(
            "relative group rounded-xl p-6 transition-all duration-300 flex flex-col",
            variants[variant],
            className
        )}>
            {(label || icon || extra) && (
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-foreground/70">
                        {icon && <span className="opacity-80 dark:opacity-100">{icon}</span>}
                        {label && <span>{label}</span>}
                    </div>
                    {extra && <div className="flex items-center gap-2">{extra}</div>}
                </div>
            )}
            <div className="relative z-10 flex-1 flex flex-col">
                {children}
            </div>
        </div>
    )
}
