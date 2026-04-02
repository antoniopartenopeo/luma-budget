"use client"

import { useEffect, useRef } from "react"
import { Plus } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LIQUID_CAPSULE_CLASS, LIQUID_REFRACTION_CLASS } from "@/components/ui/glass-tokens"
import { cn } from "@/lib/utils"
import { QuickExpenseInput } from "@/features/transactions/components/quick-expense-input"
import { type TopbarPanelId } from "./topbar-panel-id"
import { TopbarInlinePanelLabel } from "./topbar-inline-panel-label"
import { TopbarInlinePanelShell } from "./topbar-inline-panel-shell"
import {
    TOPBAR_CLUSTER_DIVIDER_CLASS,
    TOPBAR_ICON_BUTTON_CLASS,
    TOPBAR_INLINE_INPUT_TEXT_CLASS,
} from "./topbar-tokens"
import { useTopbarInlinePanel } from "./use-topbar-inline-panel"

interface TopbarQuickTransactionProps {
    activePanel?: TopbarPanelId | null
    isOpen?: boolean
    onActivePanelChange?: (panelId: TopbarPanelId | null) => void
    onOpenChange?: (isOpen: boolean) => void
    surface?: "embedded" | "standalone"
}

export function TopbarQuickTransaction({
    activePanel,
    isOpen,
    onActivePanelChange,
    onOpenChange,
    surface = "standalone",
}: TopbarQuickTransactionProps) {
    const triggerRef = useRef<HTMLButtonElement>(null)
    const triggerRailRef = useRef<HTMLDivElement>(null)
    const descriptionInputRef = useRef<HTMLInputElement>(null)
    const wasOpenRef = useRef(false)
    const isEmbedded = surface === "embedded"
    const isControlledByPanel = activePanel !== undefined && onActivePanelChange !== undefined
    const controlledIsOpen = isControlledByPanel ? activePanel === "quick" : isOpen

    const handleOpenChange = (nextIsOpen: boolean) => {
        if (isControlledByPanel) {
            onActivePanelChange(nextIsOpen ? "quick" : null)
        }

        onOpenChange?.(nextIsOpen)
    }

    const {
        containerRef,
        isOpen: resolvedIsOpen,
        panelWidth,
        setIsOpen,
        transition,
    } = useTopbarInlinePanel({
        isOpen: controlledIsOpen,
        minWidth: 460,
        maxWidth: 1600,
        onOpenChange: handleOpenChange,
        reserveClosedWidth: false,
        scopeSelector: '[data-testid="quick-transaction-cluster"]',
        widthFactor: 1,
        fallbackViewportFactor: 0.9,
    })

    useEffect(() => {
        if (resolvedIsOpen) {
            const focusFrame = window.requestAnimationFrame(() => {
                descriptionInputRef.current?.focus()
            })

            return () => {
                window.cancelAnimationFrame(focusFrame)
            }
        }

        if (wasOpenRef.current) {
            triggerRef.current?.focus()
        }
    }, [resolvedIsOpen])

    useEffect(() => {
        wasOpenRef.current = resolvedIsOpen
    }, [resolvedIsOpen])


    return (
        <div className="flex min-w-0 flex-1 items-center">
            <TopbarInlinePanelShell
                className={cn(
                    "group rounded-[1.4rem]",
                    isEmbedded
                        ? "bg-transparent p-0"
                        : cn("p-1", LIQUID_CAPSULE_CLASS, LIQUID_REFRACTION_CLASS)
                )}
                containerRef={containerRef}
                isOpen={resolvedIsOpen}
                panelAriaLabel="Inserimento rapido transazione"
                panelClassName="min-w-0"
                panelId="topbar-quick-transaction-panel"
                panelTestId="topbar-quick-transaction-panel"
                panelWidth={panelWidth}
                transition={transition}
                trigger={(
                    <motion.div ref={triggerRailRef} layout className="flex shrink-0 items-center">
                        <div className="flex w-[6.75rem] shrink-0 flex-col justify-center pr-3 text-right">
                            <TopbarInlinePanelLabel className="mr-0 text-right" testId="topbar-quick-transaction-label">
                                Transazione
                            </TopbarInlinePanelLabel>
                            <span className={cn("truncate pt-1 text-foreground", TOPBAR_INLINE_INPUT_TEXT_CLASS)}>
                                Nuova
                            </span>
                        </div>

                        <div className={cn(TOPBAR_CLUSTER_DIVIDER_CLASS, "mr-2 ml-0 bg-border/40")} />

                        <Button
                            ref={triggerRef}
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen((prev) => !prev)}
                            data-testid="topbar-quick-transaction-trigger"
                            aria-expanded={resolvedIsOpen}
                            aria-controls="topbar-quick-transaction-panel"
                            aria-label={resolvedIsOpen ? "Chiudi inserimento rapido transazione" : "Apri inserimento rapido transazione"}
                            className={cn(TOPBAR_ICON_BUTTON_CLASS, "text-primary", resolvedIsOpen && "hover:shadow-none")}
                        >
                            <Plus className={cn("h-5 w-5 transition-transform duration-300", resolvedIsOpen && "rotate-45")} />
                        </Button>
                    </motion.div>
                )}
            >
                <div className="min-w-0 flex-1">
                    <QuickExpenseInput
                        descriptionInputRef={descriptionInputRef}
                        variant="embedded"
                        onExpenseCreated={() => setIsOpen(false)}
                    />
                </div>
            </TopbarInlinePanelShell>
        </div>
    )
}
