"use client"

import { useMemo } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TopbarInlineMetric } from "@/components/layout/topbar-inline-metric"
import { TopbarInlinePanelLabel } from "@/components/layout/topbar-inline-panel-label"
import { TopbarInlinePanelShell } from "@/components/layout/topbar-inline-panel-shell"
import { TOPBAR_INLINE_DIVIDER_CLASS } from "@/components/layout/topbar-tokens"
import { useTopbarInlinePanel } from "@/components/layout/use-topbar-inline-panel"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard"
import { useSettings } from "@/features/settings/api/use-settings"
import { useCurrency } from "@/features/settings/api/use-currency"
import { getCurrentPeriod } from "@/features/insights/utils"
import { buildFlashPreviewModel } from "../lib/build-flash-preview-model"

interface TopbarFlashPreviewProps {
    isOpen?: boolean
    onOpenChange?: (isOpen: boolean) => void
    triggerClassName?: string
}

export function TopbarFlashPreview({ isOpen, onOpenChange, triggerClassName }: TopbarFlashPreviewProps) {
    const period = getCurrentPeriod()
    const { isPrivacyMode } = usePrivacyStore()
    const { data, isLoading } = useDashboardSummary({ mode: "month", period })
    const { data: settings } = useSettings()
    const { currency, locale } = useCurrency()
    const {
        containerRef,
        isOpen: resolvedIsOpen,
        panelWidth,
        setIsOpen,
        transition,
    } = useTopbarInlinePanel({
        isOpen,
        minWidth: 320,
        maxWidth: 420,
        onOpenChange,
        scopeSelector: '[data-testid="topbar-desktop-capsule"]',
        widthFactor: 1,
        fallbackViewportFactor: 0.3,
    })

    const previewModel = useMemo(
        () => buildFlashPreviewModel({
            currency,
            data,
            locale,
            superfluousTargetPercent: settings?.superfluousTargetPercent ?? 10,
        }),
        [currency, data, locale, settings?.superfluousTargetPercent]
    )

    return (
        <TopbarInlinePanelShell
            containerRef={containerRef}
            isOpen={resolvedIsOpen}
            panelAriaLabel="Riepilogo Numa Flash"
            panelId="topbar-flash-panel"
            panelTestId="topbar-flash-panel"
            panelWidth={panelWidth}
            transition={transition}
            trigger={(
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen((prev) => !prev)}
                    data-testid="topbar-flash-trigger"
                    aria-label="Apri Numa Flash"
                    aria-expanded={resolvedIsOpen}
                    aria-controls="topbar-flash-panel"
                    className={cn(
                        "relative z-10 h-10 w-10 shrink-0 text-primary transition-colors focus-visible:ring-0",
                        triggerClassName,
                        resolvedIsOpen && "border-transparent bg-transparent hover:bg-transparent hover:shadow-none"
                    )}
                >
                    <span className="pointer-events-none absolute inset-0 rounded-full border border-primary/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100 motion-reduce:animate-none" />
                    <Sparkles className="h-5 w-5 fill-primary" />
                </Button>
            )}
        >
            <TopbarInlinePanelLabel testId="topbar-flash-label">Flash</TopbarInlinePanelLabel>

            <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3">
                <TopbarInlineMetric
                    allowTruncate
                    blurValue={isPrivacyMode}
                    className="min-w-0"
                    label="Saldo"
                    testId="topbar-flash-balance"
                    tone={previewModel.balanceTone}
                    value={isLoading ? "—" : previewModel.balanceFormatted}
                />

                <div className={TOPBAR_INLINE_DIVIDER_CLASS} />

                <TopbarInlineMetric
                    blurValue={isPrivacyMode}
                    className="min-w-0"
                    label="Pressione"
                    meterPct={previewModel.expensePressurePct}
                    testId="topbar-flash-pressure"
                    tone={previewModel.expensePressurePct !== null && previewModel.expensePressurePct >= 90 ? "negative" : "neutral"}
                    value={isLoading ? "—" : previewModel.expensePressureFormatted}
                />

                <div className={TOPBAR_INLINE_DIVIDER_CLASS} />

                <TopbarInlineMetric
                    blurValue={isPrivacyMode}
                    className="min-w-0"
                    label="Superfluo"
                    meterPct={previewModel.superfluousPct}
                    testId="topbar-flash-superfluous"
                    tone={previewModel.isSuperfluousOverTarget ? "negative" : "neutral"}
                    value={isLoading ? "—" : previewModel.superfluousFormatted}
                />
            </div>
        </TopbarInlinePanelShell>
    )
}
