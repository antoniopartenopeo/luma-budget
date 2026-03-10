"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface SegmentedPillOption {
    value: string
    label: string
    disabled?: boolean
}

interface SegmentedPillSelectorProps {
    options: SegmentedPillOption[]
    value?: string
    onChange: (value: string) => void
    className?: string
    buttonClassName?: string
}

/**
 * Segmented pill selector used for compact mode/range choices.
 * Keeps a consistent visual language across sections.
 */
export function SegmentedPillSelector({
    options,
    value,
    onChange,
    className,
    buttonClassName
}: SegmentedPillSelectorProps) {
    const indicatorId = React.useId()

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1 rounded-[1.15rem] border border-white/40 bg-white/40 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] dark:border-white/12 dark:bg-white/[0.05]",
                className
            )}
        >
            {options.map((option) => {
                const isActive = value === option.value

                return (
                    <Button
                        key={option.value}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange(option.value)}
                        disabled={option.disabled}
                        aria-pressed={isActive}
                        className={cn(
                            "relative h-8 rounded-[0.95rem] px-3.5 text-xs font-semibold normal-case tracking-normal text-muted-foreground transition-[color,transform] duration-200 hover:text-foreground focus-visible:ring-primary/25",
                            isActive && "text-foreground",
                            buttonClassName
                        )}
                    >
                        {isActive ? (
                            <motion.span
                                layoutId={indicatorId}
                                className="absolute inset-0 rounded-[0.95rem] border border-white/55 bg-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.34),0_14px_30px_-24px_rgba(15,23,42,0.42)] dark:border-white/12 dark:bg-white/[0.08]"
                                transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.22 }}
                            />
                        ) : null}
                        <span className="relative z-10">{option.label}</span>
                    </Button>
                )
            })}
        </div>
    )
}
