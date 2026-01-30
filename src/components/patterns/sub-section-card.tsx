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
        default: "glass-card hover:bg-white/70 dark:hover:bg-white/10",
        premium: "bg-gradient-to-br from-primary/5 to-indigo-500/5 border border-primary/10 shadow-inner",
        accent: "bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 shadow-inner"
    }

    return (
        <div className={cn(
            "relative group rounded-2xl p-6 transition-all duration-300",
            variants[variant],
            className
        )}>
            {(label || icon || extra) && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                        {icon && <span className="opacity-70">{icon}</span>}
                        {label && <span>{label}</span>}
                    </div>
                    {extra && <div className="flex items-center gap-2">{extra}</div>}
                </div>
            )}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}
