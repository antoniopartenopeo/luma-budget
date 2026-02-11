"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import type { EChartsOption } from "echarts"

// Dynamic import with SSR disabled
const ReactECharts = dynamic(() => import("echarts-for-react"), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-muted/5 animate-pulse rounded-lg" />
})

interface EChartsResizable {
    resize?: () => void
}

interface EChartsWrapperProps {
    option: EChartsOption
    className?: string
    style?: React.CSSProperties
    onEvents?: Record<string, (params: unknown) => void>
    notMerge?: boolean
    lazyUpdate?: boolean
    theme?: string | object
    onChartReady?: (instance: unknown) => void
    opts?: {
        devicePixelRatio?: number
        renderer?: "canvas" | "svg"
        width?: number | "auto"
        height?: number | "auto"
        locale?: string
    }
}

export function EChartsWrapper({ option, className, style, onEvents, onChartReady, ...props }: EChartsWrapperProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartInstanceRef = useRef<EChartsResizable | null>(null)
    const rafRef = useRef<number | null>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container || typeof ResizeObserver === "undefined") return

        const observer = new ResizeObserver(() => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
            }
            rafRef.current = requestAnimationFrame(() => {
                chartInstanceRef.current?.resize?.()
            })
        })

        observer.observe(container)

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
            if (typeof observer.disconnect === "function") {
                observer.disconnect()
            }
        }
    }, [])

    return (
        <div ref={containerRef} className={className} style={{ width: "100%", height: "100%", ...style }}>
            <ReactECharts
                option={option}
                style={{ height: "100%", width: "100%" }}
                autoResize={false}
                onEvents={onEvents}
                onChartReady={(instance: unknown) => {
                    chartInstanceRef.current = instance as EChartsResizable
                    onChartReady?.(instance)
                }}
                {...props}
            />
        </div>
    )
}
