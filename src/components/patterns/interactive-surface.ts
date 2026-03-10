"use client"

import { useState, type MouseEvent } from "react"
import { useMotionValue, useReducedMotion, useSpring } from "framer-motion"

const DEFAULT_POINTER_SPRING = { damping: 22, stiffness: 210, mass: 0.5 }
const DEFAULT_DEPTH_SPRING = { damping: 26, stiffness: 250, mass: 0.42 }
export const INTERACTIVE_CARD_TRANSITION = { type: "spring", stiffness: 260, damping: 22, mass: 0.88 } as const
export const INTERACTIVE_CARD_HOVER_STATE = { y: -4, scale: 1.01 } as const

const MOSAIC_LAYOUT_PATTERNS: Record<number, string[]> = {
    1: ["sm:col-span-2 xl:col-span-4 xl:row-span-2"],
    2: ["sm:col-span-2 xl:col-span-3 xl:row-span-2", "sm:col-span-2 xl:col-span-1 xl:row-span-2"],
    3: ["sm:col-span-2 xl:col-span-2 xl:row-span-2", "sm:col-span-1 xl:col-span-2", "sm:col-span-1 xl:col-span-2"],
    4: ["sm:col-span-2 xl:col-span-2 xl:row-span-2", "sm:col-span-1 xl:col-span-1 xl:row-span-2", "sm:col-span-1 xl:col-span-1 xl:row-span-2", "sm:col-span-2 xl:col-span-2"],
    5: ["sm:col-span-2 xl:col-span-2 xl:row-span-2", "sm:col-span-1 xl:col-span-1 xl:row-span-2", "sm:col-span-1 xl:col-span-1 xl:row-span-2", "sm:col-span-1 xl:col-span-2", "sm:col-span-1 xl:col-span-2"],
    6: ["sm:col-span-2 xl:col-span-2 xl:row-span-2", "sm:col-span-1 xl:col-span-1 xl:row-span-2", "sm:col-span-1 xl:col-span-1 xl:row-span-2", "sm:col-span-2 xl:col-span-2", "sm:col-span-1 xl:col-span-1", "sm:col-span-1 xl:col-span-1"]
} as const

export function withAlpha(hex: string, alpha: number): string {
    const normalized = hex.replace("#", "")
    if (normalized.length !== 6) {
        return `rgba(14, 165, 168, ${alpha})`
    }

    const red = Number.parseInt(normalized.slice(0, 2), 16)
    const green = Number.parseInt(normalized.slice(2, 4), 16)
    const blue = Number.parseInt(normalized.slice(4, 6), 16)

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export function resolveInteractiveSurfaceStyle(
    rawColor: string,
    emphasis: "rest" | "active",
    treatment: "tinted" | "neutral" = "tinted"
): {
    borderColor: string
    backgroundColor: string
    backgroundImage: string
    boxShadow?: string
} {
    const isActive = emphasis === "active"

    if (treatment === "neutral") {
        return {
            borderColor: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.4)",
            backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)",
            backgroundImage: `
                linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 34%, rgba(15,23,42,0.08) 100%),
                linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 58%, transparent 100%)
            `,
            boxShadow: isActive
                ? "inset 0 1px 0 rgba(255,255,255,0.16), 0 24px 56px -34px rgba(15,23,42,0.38)"
                : undefined
        }
    }

    return {
        borderColor: withAlpha(rawColor, isActive ? 0.34 : 0.26),
        backgroundColor: withAlpha(rawColor, isActive ? 0.14 : 0.1),
        backgroundImage: `
            linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 34%, rgba(15,23,42,0.06) 100%),
            linear-gradient(135deg, ${withAlpha(rawColor, isActive ? 0.32 : 0.22)} 0%, ${withAlpha(rawColor, isActive ? 0.18 : 0.11)} 58%, transparent 100%)
        `,
        boxShadow: isActive
            ? "inset 0 1px 0 rgba(255,255,255,0.14), 0 24px 56px -34px rgba(15,23,42,0.4)"
            : undefined
    }
}

export function resolveInteractiveTileLayoutClass(index: number, total: number): string {
    const safeTotal = Math.max(1, Math.min(6, total))
    const pattern = MOSAIC_LAYOUT_PATTERNS[safeTotal] ?? MOSAIC_LAYOUT_PATTERNS[6]

    return pattern[index] ?? "xl:col-span-2"
}

export function useInteractiveTilt({
    disabled = false,
    pointerSpring = DEFAULT_POINTER_SPRING,
    depthSpring = DEFAULT_DEPTH_SPRING
}: {
    disabled?: boolean
    pointerSpring?: typeof DEFAULT_POINTER_SPRING
    depthSpring?: typeof DEFAULT_DEPTH_SPRING
} = {}) {
    const prefersReducedMotion = useReducedMotion()
    const [isPrimed, setIsPrimed] = useState(false)
    const pointerX = useMotionValue(0)
    const pointerY = useMotionValue(0)
    const springX = useSpring(pointerX, pointerSpring)
    const springY = useSpring(pointerY, pointerSpring)
    const depthX = useSpring(springX, depthSpring)
    const depthY = useSpring(springY, depthSpring)
    const isInteractive = !disabled && !prefersReducedMotion

    const handlePointerMove = (event: MouseEvent<HTMLElement>) => {
        if (!isInteractive) return

        const rect = event.currentTarget.getBoundingClientRect()
        const nextX = (event.clientX - rect.left) / rect.width - 0.5
        const nextY = (event.clientY - rect.top) / rect.height - 0.5

        pointerX.set(Math.max(-0.5, Math.min(0.5, nextX)))
        pointerY.set(Math.max(-0.5, Math.min(0.5, nextY)))
    }

    const handlePointerEnter = () => {
        setIsPrimed(true)
    }

    const handlePointerLeave = () => {
        pointerX.set(0)
        pointerY.set(0)
        setIsPrimed(false)
    }

    return {
        depthX,
        depthY,
        isInteractive,
        isPrimed,
        handlePointerMove,
        handlePointerEnter,
        handlePointerLeave
    }
}
