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
    onEvents?: Record<string, (params: unknown) => void>
    children?: ReactNode
    className?: string
    chartHeight?: number
    backgroundType?: 'radar' | 'cartesian'
    status?: "default" | "warning" | "critical"
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
    chartHeight = 560,
    backgroundType = 'radar',
    status = "default"
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
            status={status}
            title={title}
            description={description}
            contentClassName="p-0 relative z-10"
            className={className}
            background={
                !isLoading && hasData ? (
                    <div className="w-full h-full flex items-center justify-center opacity-40 dark:opacity-60">
                        {backgroundType === 'radar' && (
                            <>
                                <div className="w-[80%] h-[80%] border-[3px] border-primary/30 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                <div className="absolute w-[80%] h-[80%] border border-primary/20 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                <div className="absolute w-[100%] h-[100%] border border-primary/10 rounded-full" />
                                <div className="absolute w-[120%] h-[120%] border-t border-r border-primary/5 rounded-full" />
                            </>
                        )}

                        {backgroundType === 'cartesian' && (
                            <>
                                {/* Static faint grid foundation */}
                                <div className="absolute inset-x-8 top-1/4 h-[1px] bg-primary/5" />
                                <div className="absolute inset-x-8 bottom-1/4 h-[1px] bg-primary/5" />
                                <div className="absolute inset-y-4 left-1/4 w-[1px] bg-primary/5" />
                                <div className="absolute inset-y-4 right-1/4 w-[1px] bg-primary/5" />

                                {/* Rectangular Echoes (The "Radar" for Cartesian) */}
                                <div className="absolute w-[60%] h-[50%] border-[3px] border-primary/20 rounded-3xl animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                <div className="absolute w-[70%] h-[60%] border border-primary/10 rounded-[2rem] animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '0.5s' }} />
                                <div className="absolute w-[40%] h-[30%] border border-primary/5 rounded-2xl animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                            </>
                        )}
                    </div>
                ) : null
            }
        >
            {!hasData ? (
                <div style={{ height: chartHeight }} className="flex items-center justify-center relative z-10">
                    <StateMessage
                        variant="empty"
                        title="Nessun dato"
                        description="I dati appariranno qui in questa vista ultra-tecnologica"
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center relative z-10">
                    <div className="w-full relative text-foreground" style={{ height: chartHeight }}>

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
