"use client"

import { cn } from "@/lib/utils"
import { TOPBAR_INLINE_LABEL_CLASS } from "./topbar-tokens"

interface TopbarInlinePanelLabelProps {
    children: React.ReactNode
    className?: string
    testId?: string
}

export function TopbarInlinePanelLabel({
    children,
    className,
    testId,
}: TopbarInlinePanelLabelProps) {
    return (
        <div
            data-testid={testId}
            className={cn(
                TOPBAR_INLINE_LABEL_CLASS,
                className
            )}
        >
            {children}
        </div>
    )
}
