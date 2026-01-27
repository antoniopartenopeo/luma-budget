"use client"

import { ReactNode } from "react"
import { MacroSection } from "@/components/patterns/macro-section"
import { EChartsWrapper } from "./echarts-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { useSettings } from "@/features/settings/api/use-settings"
import type { EChartsOption } from "echarts"

interface PremiumChartSectionProps {
    title: string
    description?: string
    option: EChartsOption
    isLoading?: boolean
    hasData?: boolean
    onEvents?: Record<string, (params: any) => void>
    children?: ReactNode
    className?: string
    chartHeight?: number
}

/**
 * Reusable layout for "Ultra-Tech" charts.
 * Provvidenza radar backgrounds, glassmorphism, and unified premium styling.
 */
export function PremiumChartSection({
    title,
    description,
    option,
    isLoading,
    hasData = true,
    onEvents,
    children,
    className,
    chartHeight = 520
}: PremiumChartSectionProps) {
    const { data: settings } = useSettings()
    const isDarkMode = settings?.theme === "dark" || (settings?.theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    if (isLoading) {
        return (
            <MacroSection title={title} description="Caricamento in corso..." className={className}>
                <div style={{ height: chartHeight }}>
                    <Skeleton className="h-full w-full rounded-3xl" />
                </div>
            </MacroSection>
        )
    }

    return (
        <MacroSection
            variant="premium"
            title={title}
            description={description}
            className={className}
        >
            {!hasData ? (
                <div style={{ height: chartHeight }} className="flex items-center justify-center">
                    <StateMessage
                        variant="empty"
                        title="Nessun dato"
                        description="I dati appariranno qui in questa vista ultra-tecnologica"
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-full relative text-foreground px-8" style={{ height: chartHeight }}>
                        {/* Futuristic Background Accents (Radar) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 dark:opacity-60">
                            <div className="w-[300px] h-[300px] border-[3px] border-primary/30 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                            <div className="absolute w-[300px] h-[300px] border border-primary/20 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
                            <div className="absolute w-[400px] h-[400px] border border-primary/10 rounded-full" />
                            <div className="absolute w-[500px] h-[500px] border-t border-r border-primary/5 rounded-full" />
                        </div>

                        <EChartsWrapper
                            option={option}
                            onEvents={onEvents}
                        />
                    </div>

                    {/* Additional UI (like floating stats) */}
                    {children}
                </div>
            )}
        </MacroSection>
    )
}
