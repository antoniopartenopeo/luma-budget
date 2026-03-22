"use client"

import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"

interface UseTopbarInlinePanelOptions {
    fallbackViewportFactor?: number
    isOpen?: boolean
    maxWidth: number
    minWidth: number
    onOpenChange?: (isOpen: boolean) => void
    reserveClosedWidth?: boolean
    reservedGapPx?: number
    scopeSelector?: string
    widthFactor?: number
}

export function useTopbarInlinePanel({
    fallbackViewportFactor = 0.4,
    isOpen: controlledIsOpen,
    maxWidth,
    minWidth,
    onOpenChange,
    reserveClosedWidth = true,
    reservedGapPx = 8,
    scopeSelector = '[data-testid="topbar-action-cluster"]',
    widthFactor = 1,
}: UseTopbarInlinePanelOptions) {
    const shouldReduceMotion = useReducedMotion()
    const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false)
    const [panelWidth, setPanelWidth] = useState(minWidth)
    const containerRef = useRef<HTMLDivElement>(null)
    const closedWidthRef = useRef(0)
    const isOpenRef = useRef(false)
    const isControlled = controlledIsOpen !== undefined
    const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen

    const setIsOpen = useCallback<Dispatch<SetStateAction<boolean>>>((value) => {
        const nextValue = typeof value === "function"
            ? value(isOpenRef.current)
            : value

        if (!isControlled) {
            setUncontrolledIsOpen(nextValue)
        }

        onOpenChange?.(nextValue)
    }, [isControlled, onOpenChange])

    useEffect(() => {
        const resolveScopeElement = () => {
            const cluster = scopeSelector
                ? containerRef.current?.closest(scopeSelector)
                : null
            return cluster instanceof HTMLElement ? cluster : null
        }

        const measureClosedWidth = () => {
            if (!reserveClosedWidth || isOpenRef.current) return
            const nextClosedWidth = Math.round(containerRef.current?.getBoundingClientRect().width ?? 0)
            if (nextClosedWidth > 0) {
                closedWidthRef.current = nextClosedWidth
            }
        }

        const updatePanelWidth = () => {
            const cluster = resolveScopeElement()
            measureClosedWidth()

            if (cluster) {
                const clusterWidth = Math.round(cluster.getBoundingClientRect().width)
                const reservedWidth = reserveClosedWidth ? closedWidthRef.current + reservedGapPx : 0
                const scaledWidth = Math.round(clusterWidth * widthFactor)
                const availableWidth = Math.max(minWidth, scaledWidth - reservedWidth)
                setPanelWidth(Math.max(minWidth, Math.min(availableWidth, maxWidth)))
                return
            }

            const viewportWidth = window.innerWidth * fallbackViewportFactor
            const reservedWidth = reserveClosedWidth ? closedWidthRef.current + reservedGapPx : 0
            const availableWidth = Math.max(minWidth, Math.round(viewportWidth - reservedWidth))
            setPanelWidth(Math.max(minWidth, Math.min(availableWidth, maxWidth)))
        }

        updatePanelWidth()
        window.addEventListener("resize", updatePanelWidth)

        const cluster = resolveScopeElement()
        const resizeObserver = typeof ResizeObserver === "undefined" || !cluster
            ? null
            : new ResizeObserver(() => {
                updatePanelWidth()
            })

        if (resizeObserver && cluster) {
            resizeObserver.observe(cluster)
        }

        return () => {
            window.removeEventListener("resize", updatePanelWidth)
            resizeObserver?.disconnect()
        }
    }, [fallbackViewportFactor, maxWidth, minWidth, reserveClosedWidth, reservedGapPx, scopeSelector, widthFactor])

    useEffect(() => {
        isOpenRef.current = isOpen
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false)
            }
        }

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target
            if (!(target instanceof Node)) return
            if (containerRef.current?.contains(target)) return
            setIsOpen(false)
        }

        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("mousedown", handlePointerDown)

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("mousedown", handlePointerDown)
        }
    }, [isOpen, setIsOpen])

    const transition = shouldReduceMotion
        ? { duration: 0.12 }
        : { type: "spring" as const, stiffness: 360, damping: 30, mass: 0.9 }

    return {
        containerRef,
        isOpen,
        panelWidth,
        setIsOpen,
        transition,
    }
}
