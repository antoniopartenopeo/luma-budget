"use client"

import { useEffect, useRef, useState } from "react"
import type { EChartsInitOpts, EChartsOption, EChartsType, SetOptionOpts } from "echarts"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

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

function detachEvents(
    instance: EChartsType,
    handlers: Record<string, (params: unknown) => void>
) {
    Object.entries(handlers).forEach(([eventName, handler]) => {
        instance.off(eventName, handler as never)
    })
}

function attachEvents(
    instance: EChartsType,
    handlers: Record<string, (params: unknown) => void>
) {
    Object.entries(handlers).forEach(([eventName, handler]) => {
        instance.on(eventName, handler as never)
    })
}

export function EChartsWrapper({
    option,
    className,
    style,
    onEvents,
    notMerge,
    lazyUpdate,
    theme,
    onChartReady,
    opts,
}: EChartsWrapperProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartInstanceRef = useRef<EChartsType | null>(null)
    const resizeObserverRef = useRef<ResizeObserver | null>(null)
    const rafRef = useRef<number | null>(null)
    const handlersRef = useRef<Record<string, (params: unknown) => void>>({})
    const runtimeConfigRef = useRef({
        option,
        onEvents,
        notMerge,
        lazyUpdate,
    })
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        runtimeConfigRef.current = {
            option,
            onEvents,
            notMerge,
            lazyUpdate,
        }
    }, [lazyUpdate, notMerge, onEvents, option])

    useEffect(() => {
        let disposed = false

        async function initChart() {
            const container = containerRef.current
            if (!container) return

            const echarts = await import("echarts")
            if (disposed || !containerRef.current) return

            const chart = echarts.init(
                containerRef.current,
                theme as string | object | undefined,
                opts as EChartsInitOpts | undefined
            )

            chartInstanceRef.current = chart
            chart.setOption(runtimeConfigRef.current.option, {
                notMerge: runtimeConfigRef.current.notMerge,
                lazyUpdate: runtimeConfigRef.current.lazyUpdate,
            } satisfies SetOptionOpts)
            handlersRef.current = runtimeConfigRef.current.onEvents ?? {}
            attachEvents(chart, handlersRef.current)
            onChartReady?.(chart)
            setIsReady(true)

            if (typeof ResizeObserver === "undefined") return

            const observer = new ResizeObserver(() => {
                if (rafRef.current !== null) {
                    cancelAnimationFrame(rafRef.current)
                }

                rafRef.current = requestAnimationFrame(() => {
                    chart.resize()
                })
            })

            resizeObserverRef.current = observer
            observer.observe(containerRef.current)
        }

        initChart()

        return () => {
            disposed = true
            setIsReady(false)

            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }

            resizeObserverRef.current?.disconnect()
            resizeObserverRef.current = null

            const chart = chartInstanceRef.current
            if (chart && !chart.isDisposed()) {
                detachEvents(chart, handlersRef.current)
                chart.dispose()
            }

            chartInstanceRef.current = null
            handlersRef.current = {}
        }
    }, [onChartReady, opts, theme])

    useEffect(() => {
        const chart = chartInstanceRef.current
        if (!chart) return

        chart.setOption(option, {
            notMerge,
            lazyUpdate,
        } satisfies SetOptionOpts)
    }, [lazyUpdate, notMerge, option])

    useEffect(() => {
        const chart = chartInstanceRef.current
        if (!chart) return

        detachEvents(chart, handlersRef.current)
        handlersRef.current = onEvents ?? {}
        attachEvents(chart, handlersRef.current)
    }, [onEvents])

    return (
        <div
            className={cn("relative h-full w-full overflow-hidden", className)}
            aria-busy={!isReady}
            style={{ width: "100%", height: "100%", ...style }}
        >
            {!isReady ? (
                <div className="absolute inset-0 p-2">
                    <Skeleton className="h-full w-full rounded-[1.25rem]" />
                </div>
            ) : null}
            <div ref={containerRef} className="h-full w-full" aria-hidden={!isReady} />
        </div>
    )
}
