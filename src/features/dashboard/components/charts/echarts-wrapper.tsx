"use client"

import dynamic from "next/dynamic"
import type { EChartsOption } from "echarts"

// Dynamic import with SSR disabled
const ReactECharts = dynamic(() => import("echarts-for-react"), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-muted/5 animate-pulse rounded-lg" />
})

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
        renderer?: 'canvas' | 'svg'
        width?: number | 'auto'
        height?: number | 'auto'
        locale?: string
    }
}

export function EChartsWrapper({ option, className, style, onEvents, ...props }: EChartsWrapperProps) {
    return (
        <div className={className} style={{ width: "100%", height: "100%", ...style }}>
            <ReactECharts
                option={option}
                style={{ height: "100%", width: "100%" }}
                onEvents={onEvents}
                {...props}
            />
        </div>
    )
}
