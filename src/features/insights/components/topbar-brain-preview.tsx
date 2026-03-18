"use client"

import Link from "next/link"
import { BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BRAIN_MATURITY_SAMPLE_TARGET } from "@/brain"
import { TopbarInlineMetric } from "@/components/layout/topbar-inline-metric"
import { TopbarInlinePanelLabel } from "@/components/layout/topbar-inline-panel-label"
import { TopbarInlinePanelShell } from "@/components/layout/topbar-inline-panel-shell"
import {
    TOPBAR_INLINE_DIVIDER_CLASS,
    TOPBAR_INLINE_KPI_VALUE_CLASS,
} from "@/components/layout/topbar-tokens"
import { useTopbarInlinePanel } from "@/components/layout/use-topbar-inline-panel"
import { cn } from "@/lib/utils"
import { formatBrainTopbarAriaLabel, formatBrainTopbarTitle } from "@/features/insights/brain-copy"
import { useBrainRuntimeState } from "@/features/insights/brain-runtime"

interface TopbarBrainPreviewProps {
    isOpen?: boolean
    onOpenChange?: (isOpen: boolean) => void
    triggerClassName?: string
}

function clampPercent(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)))
}

function resolveOrbitPalette(percent: number): {
    primaryFill: string
    primaryGlow: string
} {
    const normalized = clampPercent(percent) / 100
    const baseHue = 220 - normalized * 72
    const baseSaturation = 90 - normalized * 6
    const primaryLightness = 66 - normalized * 2

    return {
        primaryFill: `hsl(${baseHue} ${baseSaturation}% ${primaryLightness}%)`,
        primaryGlow: [
            `0 0 1px hsl(${baseHue} ${baseSaturation}% ${primaryLightness}% / 1)`,
            `0 0 6px hsl(${baseHue} ${baseSaturation}% ${primaryLightness}% / 0.96)`,
            `0 0 12px hsl(${baseHue} ${baseSaturation}% ${primaryLightness}% / 0.82)`,
            `0 0 20px hsl(${baseHue} ${baseSaturation}% ${primaryLightness}% / 0.62)`,
        ].join(", "),
    }
}

function formatCompactBrainStage(stageId: ReturnType<typeof useBrainRuntimeState>["stage"]["id"]): string {
    switch (stageId) {
        case "dormant":
            return "Fermo"
        case "newborn":
            return "Nuovo"
        case "imprinting":
            return "Impara"
        case "adapting":
            return "Attivo"
        default:
            return "Brain"
    }
}

export function TopbarBrainPreview({ isOpen, onOpenChange, triggerClassName }: TopbarBrainPreviewProps) {
    const { brainReadinessPercent, snapshot, stage } = useBrainRuntimeState()
    const trainedSamples = snapshot?.trainedSamples ?? 0
    const orbitPalette = resolveOrbitPalette(brainReadinessPercent)
    const compactStage = formatCompactBrainStage(stage.id)
    const brainProgressCircumference = 2 * Math.PI * 14
    const brainProgressOffset = brainProgressCircumference * (1 - brainReadinessPercent / 100)
    const readinessTone = brainReadinessPercent >= 80 ? "positive" : brainReadinessPercent >= 40 ? "neutral" : "warning"
    const historyTone = trainedSamples >= BRAIN_MATURITY_SAMPLE_TARGET ? "positive" : "neutral"

    const {
        containerRef,
        isOpen: resolvedIsOpen,
        panelWidth,
        setIsOpen,
        transition,
    } = useTopbarInlinePanel({
        isOpen,
        minWidth: 284,
        maxWidth: 284,
        onOpenChange,
        scopeSelector: '[data-testid="topbar-desktop-capsule"]',
        widthFactor: 0.5,
        fallbackViewportFactor: 0.22,
    })

    return (
        <TopbarInlinePanelShell
            containerRef={containerRef}
            isOpen={resolvedIsOpen}
            panelAriaLabel="Riepilogo Brain"
            panelId="topbar-brain-panel"
            panelTestId="topbar-brain-panel"
            panelWidth={panelWidth}
            transition={transition}
            trigger={(
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen((prev) => !prev)}
                    data-testid="topbar-brain-trigger"
                    title={formatBrainTopbarTitle(brainReadinessPercent, trainedSamples, BRAIN_MATURITY_SAMPLE_TARGET)}
                    aria-label={resolvedIsOpen
                        ? "Chiudi riepilogo Brain"
                        : `Apri riepilogo Brain (${brainReadinessPercent}% pronto)`}
                    aria-expanded={resolvedIsOpen}
                    aria-controls="topbar-brain-panel"
                    className={cn(
                        "relative z-10 h-10 w-10 shrink-0 text-primary transition-colors focus-visible:ring-0",
                        triggerClassName,
                        resolvedIsOpen && "border-transparent bg-transparent hover:bg-transparent hover:shadow-none"
                    )}
                >
                    <svg
                        viewBox="0 0 40 40"
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 m-auto h-10 w-10 -rotate-90"
                    >
                        <circle cx="20" cy="20" r="14" className="fill-none stroke-primary/20 stroke-[2.2]" />
                        <circle
                            cx="20"
                            cy="20"
                            r="14"
                            className="fill-none stroke-primary stroke-[2.2] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            strokeLinecap="round"
                            strokeDasharray={brainProgressCircumference}
                            strokeDashoffset={brainProgressOffset}
                        />
                    </svg>

                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-[6px] motion-safe:animate-spin-slow motion-reduce:animate-none"
                    >
                        <span
                            className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                            style={{
                                backgroundColor: orbitPalette.primaryFill,
                                boxShadow: orbitPalette.primaryGlow,
                                border: "1px solid hsl(0 0% 100% / 0.74)",
                                filter: "saturate(1.3) brightness(1.16)",
                                transition: "background-color 640ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 640ms cubic-bezier(0.22, 1, 0.36, 1)",
                            }}
                        />
                    </span>

                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-[6px] rounded-full border border-primary/25"
                    />

                    <BrainCircuit className="relative z-10 h-[18px] w-[18px]" />

                    {!resolvedIsOpen && (
                        <span
                            data-testid="topbar-brain-percent"
                            className={cn(
                                "pointer-events-none absolute -right-2 -top-1.5 min-w-[30px] rounded-full border border-primary/40 bg-background/95 px-1.5 py-0.5 text-center text-[9px] text-primary shadow-sm",
                                TOPBAR_INLINE_KPI_VALUE_CLASS
                            )}
                        >
                            {brainReadinessPercent}%
                        </span>
                    )}
                </Button>
            )}
        >
            <TopbarInlinePanelLabel testId="topbar-brain-label">Brain</TopbarInlinePanelLabel>

            <Link
                href="/brain"
                data-testid="topbar-brain-open-link"
                aria-label={formatBrainTopbarAriaLabel(brainReadinessPercent)}
                onClick={() => setIsOpen(false)}
                className="group flex h-10 min-w-0 flex-1 items-center gap-3 rounded-full px-1 transition-colors duration-200 hover:text-primary focus-visible:outline-none"
            >
                <TopbarInlineMetric
                    label="Pronto"
                    testId="topbar-brain-readiness"
                    tone={readinessTone}
                    value={`${brainReadinessPercent}%`}
                />

                <div className={TOPBAR_INLINE_DIVIDER_CLASS} />

                <TopbarInlineMetric
                    label="Fase"
                    testId="topbar-brain-stage"
                    value={compactStage}
                />

                <div className={TOPBAR_INLINE_DIVIDER_CLASS} />

                <TopbarInlineMetric
                    label="Storico"
                    testId="topbar-brain-history"
                    tone={historyTone}
                    value={`${trainedSamples}/${BRAIN_MATURITY_SAMPLE_TARGET}`}
                />
            </Link>
        </TopbarInlinePanelShell>
    )
}
