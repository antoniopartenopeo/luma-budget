"use client"

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
    return (
        <div
            className={cn(
                "inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/20 p-1",
                className
            )}
        >
            {options.map((option) => {
                const isActive = value === option.value

                return (
                    <Button
                        key={option.value}
                        type="button"
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onChange(option.value)}
                        disabled={option.disabled}
                        aria-pressed={isActive}
                        className={cn(
                            "h-7 rounded-full px-3 text-xs font-semibold normal-case tracking-normal",
                            isActive && "bg-background shadow-sm text-foreground",
                            buttonClassName
                        )}
                    >
                        {option.label}
                    </Button>
                )
            })}
        </div>
    )
}

