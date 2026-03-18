"use client"

import { type RefObject, type ReactNode } from "react"
import { AnimatePresence, motion, type Transition } from "framer-motion"
import { cn } from "@/lib/utils"
import { TOPBAR_INLINE_PANEL_ROOT_CLASS, TOPBAR_INLINE_PANEL_SURFACE_CLASS } from "./topbar-tokens"

interface TopbarInlinePanelShellProps {
    children: ReactNode
    className?: string
    containerRef: RefObject<HTMLDivElement | null>
    isOpen: boolean
    panelAriaLabel: string
    panelClassName?: string
    panelId: string
    panelMarginRight?: number
    panelRole?: string
    panelTestId: string
    panelWidth: number
    rootDataOpen?: boolean
    transition: Transition
    trigger: ReactNode
}

export function TopbarInlinePanelShell({
    children,
    className,
    containerRef,
    isOpen,
    panelAriaLabel,
    panelClassName,
    panelId,
    panelMarginRight = 8,
    panelRole = "region",
    panelTestId,
    panelWidth,
    rootDataOpen,
    transition,
    trigger,
}: TopbarInlinePanelShellProps) {
    return (
        <motion.div
            ref={containerRef}
            layout
            initial={false}
            transition={transition}
            data-open={rootDataOpen === undefined ? undefined : (rootDataOpen ? "true" : "false")}
            className={cn(TOPBAR_INLINE_PANEL_ROOT_CLASS, className)}
        >
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        id={panelId}
                        data-testid={panelTestId}
                        role={panelRole}
                        aria-label={panelAriaLabel}
                        initial={{ opacity: 0, width: 0, marginRight: 0 }}
                        animate={{ opacity: 1, width: panelWidth, marginRight: panelMarginRight }}
                        exit={{ opacity: 0, width: 0, marginRight: 0 }}
                        transition={transition}
                        className={cn(TOPBAR_INLINE_PANEL_SURFACE_CLASS, panelClassName)}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>

            {trigger}
        </motion.div>
    )
}
