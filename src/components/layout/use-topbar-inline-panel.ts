"use client"

import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"

interface UseTopbarInlinePanelOptions {
    fallbackViewportFactor?: number
    isOpen?: boolean
    maxWidth: number
    minWidth: number
    onOpenChange?: (isOpen: boolean) => void
    scopeSelector?: string
    widthFactor?: number
}

export function useTopbarInlinePanel({
    fallbackViewportFactor = 0.4,
    isOpen: controlledIsOpen,
    maxWidth,
    minWidth,
    onOpenChange,
    scopeSelector = '[data-testid="topbar-action-cluster"]',
    widthFactor = 1,
}: UseTopbarInlinePanelOptions) {
    const shouldReduceMotion = useReducedMotion()
    const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false)
    const [panelWidth, setPanelWidth] = useState(minWidth)
    const containerRef = useRef<HTMLDivElement>(null)
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
        const updatePanelWidth = () => {
            if (isOpenRef.current) return

            const cluster = scopeSelector
                ? containerRef.current?.closest(scopeSelector)
                : null
            if (cluster instanceof HTMLElement) {
                const clusterWidth = Math.round(cluster.getBoundingClientRect().width)
                setPanelWidth(Math.max(minWidth, Math.min(Math.round(clusterWidth * widthFactor), maxWidth)))
                return
            }

            setPanelWidth(Math.max(minWidth, Math.min(window.innerWidth * fallbackViewportFactor, maxWidth)))
        }

        updatePanelWidth()
        window.addEventListener("resize", updatePanelWidth)

        return () => {
            window.removeEventListener("resize", updatePanelWidth)
        }
    }, [fallbackViewportFactor, maxWidth, minWidth, scopeSelector, widthFactor])

    useEffect(() => {
        isOpenRef.current = isOpen
    }, [isOpen, setIsOpen])

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
