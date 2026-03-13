"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react"
import {
    AnimatePresence,
    motion,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
    type MotionValue,
    type Transition
} from "framer-motion"
import { createPortal } from "react-dom"
import { LayoutGrid } from "lucide-react"
import { InteractiveCardGhostIcon } from "@/components/patterns/interactive-card-ghost-icon"
import { MacroSection } from "@/components/patterns/macro-section"
import {
    INTERACTIVE_CARD_HOVER_STATE,
    INTERACTIVE_CARD_TRANSITION,
    resolveInteractiveSurfaceStyle,
    resolveInteractiveTileLayoutClass,
    withAlpha
} from "@/components/patterns/interactive-surface"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatCents } from "@/domain/money/currency"
import { cn } from "@/lib/utils"
import type { CategorySummary } from "../../api/types"
import {
    buildSpendingCompositionSlicesFromSummary,
    DEFAULT_TOP_SPENDING_CATEGORIES,
    SYNTHETIC_ALTRI_ID
} from "../../utils/spending-composition"

interface SpendingCompositionCardProps {
    categoriesSummary?: CategorySummary[]
    isLoading?: boolean
    periodLabel?: string
}

interface TileDatum {
    id: string
    name: string
    value: number
    rawColor: string
    percentValue: number
    percentLabel: string
}

interface TileFrame {
    top: number
    left: number
    width: number
    height: number
}

interface ActiveTileState {
    id: string
    index: number
    frame: TileFrame
    clientX: number | null
    clientY: number | null
}

const TILE_FALLBACK_COLORS = ["#0f766e", "#0891b2", "#2563eb", "#f59e0b", "#f97316"] as const
const POINTER_SPRING = { stiffness: 520, damping: 42, mass: 0.18 } as const

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
}

function resolveTileLayoutClass(index: number, total: number): string {
    return resolveInteractiveTileLayoutClass(index, total)
}

function resolveOpenRotation(index: number): number {
    if (index % 3 === 0) return -1.6
    if (index % 3 === 1) return 1.1
    return -0.75
}

function getFrame(target: HTMLElement): TileFrame {
    const rect = target.getBoundingClientRect()
    return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
    }
}

function resolveOverlayFrame(activeTile: ActiveTileState): TileFrame {
    if (typeof window === "undefined") {
        return activeTile.frame
    }

    const isLargeTile = activeTile.frame.width > 360
    const width = Math.min(
        window.innerWidth - 48,
        isLargeTile ? activeTile.frame.width * 1.18 : activeTile.frame.width * 1.72
    )
    const height = Math.min(
        window.innerHeight - 96,
        isLargeTile ? activeTile.frame.height * 1.14 : activeTile.frame.height * 1.54
    )
    const centeredLeft = activeTile.frame.left + (activeTile.frame.width - width) / 2
    const centeredTop = activeTile.frame.top + (activeTile.frame.height - height) / 2
    const xShift = isLargeTile
        ? Math.min(activeTile.frame.width * 0.06, 28)
        : Math.min(activeTile.frame.width * 0.12, 42)
    const yShift = -Math.min(activeTile.frame.height * 0.26, 56)

    return {
        width,
        height,
        left: clamp(centeredLeft + xShift, 24, window.innerWidth - width - 24),
        top: clamp(centeredTop + yShift, 96, window.innerHeight - height - 24)
    }
}

function resolveOverlayPointer(activeTile: ActiveTileState, frame: TileFrame): { pointerX: number; pointerY: number } {
    if (activeTile.clientX === null || activeTile.clientY === null) {
        return { pointerX: 0, pointerY: 0 }
    }

    return {
        pointerX: Math.max(-0.5, Math.min(0.5, (activeTile.clientX - frame.left) / frame.width - 0.5)),
        pointerY: Math.max(-0.5, Math.min(0.5, (activeTile.clientY - frame.top) / frame.height - 0.5))
    }
}

function getScrollContainers(node: HTMLElement | null): Array<HTMLElement | Window> {
    if (typeof window === "undefined") {
        return []
    }

    const scrollContainers: Array<HTMLElement | Window> = [window]
    let currentNode = node?.parentElement ?? null

    while (currentNode && currentNode !== document.body) {
        const styles = window.getComputedStyle(currentNode)
        const overflow = `${styles.overflow} ${styles.overflowX} ${styles.overflowY}`

        if (/(auto|scroll|overlay)/.test(overflow)) {
            scrollContainers.push(currentNode)
        }

        currentNode = currentNode.parentElement
    }

    return scrollContainers
}

function SpendingTile({
    tile,
    index,
    layoutClass,
    isDimmed,
    isLifted,
    buttonRef,
    onHoverStart,
    onFocusStart,
    onHoverMove,
    onHoverEnd,
    onTogglePin
}: {
    tile: TileDatum
    index: number
    layoutClass: string
    isDimmed: boolean
    isLifted: boolean
    buttonRef: (node: HTMLButtonElement | null) => void
    onHoverStart: (event: MouseEvent<HTMLButtonElement>, tileId: string, index: number) => void
    onFocusStart: (target: HTMLButtonElement, tileId: string, index: number) => void
    onHoverMove: (event: MouseEvent<HTMLButtonElement>, tileId: string) => void
    onHoverEnd: () => void
    onTogglePin: (event: MouseEvent<HTMLButtonElement>, tileId: string, index: number) => void
}) {
    const prefersReducedMotion = useReducedMotion()
    const surfaceStyle = resolveInteractiveSurfaceStyle(tile.rawColor, "rest")

    return (
        <motion.button
            ref={buttonRef}
            type="button"
            aria-label={tile.name}
            aria-pressed={isLifted}
            className={cn(
                "group/tile relative min-h-[8.9rem] overflow-hidden rounded-[1.9rem] border px-5 py-4 text-left transition-[opacity,border-color,transform] duration-300",
                layoutClass,
                isLifted && "opacity-[0.08]",
                isDimmed && "opacity-[0.18]"
            )}
            style={surfaceStyle}
            onMouseEnter={(event) => onHoverStart(event, tile.id, index)}
            onMouseMove={(event) => onHoverMove(event, tile.id)}
            onFocus={(event) => onFocusStart(event.currentTarget, tile.id, index)}
            onBlur={onHoverEnd}
            onClick={(event) => onTogglePin(event, tile.id, index)}
            whileHover={prefersReducedMotion ? undefined : { ...INTERACTIVE_CARD_HOVER_STATE, scale: 0.985 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            transition={INTERACTIVE_CARD_TRANSITION}
        >
            <div
                className="pointer-events-none absolute inset-x-4 top-0 h-px"
                style={{
                    backgroundImage: `linear-gradient(90deg, transparent, ${withAlpha(tile.rawColor, 0.42)}, transparent)`
                }}
            />

            <div className="relative z-10 flex h-full flex-col justify-between gap-4">
                <div className="flex items-center justify-between gap-3">
                    <span
                        className="min-h-[2.2rem] text-[10px] font-black uppercase leading-tight tracking-[0.22em]"
                        style={{ color: withAlpha(tile.rawColor, 0.8) }}
                    >
                        {tile.name}
                    </span>
                </div>

                <div className="space-y-4">
                    <div
                        className="h-1 rounded-full"
                        style={{ backgroundColor: withAlpha(tile.rawColor, 0.12) }}
                    >
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${Math.max(tile.percentValue, 8)}%`,
                                backgroundColor: withAlpha(tile.rawColor, 0.72)
                            }}
                        />
                    </div>
                    <span
                        className="text-[11px] font-semibold tabular-nums"
                        style={{ color: withAlpha(tile.rawColor, 0.68) }}
                    >
                        {tile.percentLabel}%
                    </span>
                </div>
            </div>
        </motion.button>
    )
}

function ActiveTileOverlay({
    activeTile,
    tile,
    currency,
    locale,
    pointerX,
    pointerY,
    showStaticIcon,
    isScrollSyncing
}: {
    activeTile: ActiveTileState
    tile: TileDatum
    currency: string
    locale: string
    pointerX: MotionValue<number>
    pointerY: MotionValue<number>
    showStaticIcon: boolean
    isScrollSyncing: boolean
}) {
    const targetFrame = resolveOverlayFrame(activeTile)
    const rotateZ = resolveOpenRotation(activeTile.index)
    const surfaceStyle = resolveInteractiveSurfaceStyle(tile.rawColor, "active")
    const originCenterX = activeTile.frame.left + activeTile.frame.width / 2
    const originCenterY = activeTile.frame.top + activeTile.frame.height / 2
    const targetCenterX = targetFrame.left + targetFrame.width / 2
    const targetCenterY = targetFrame.top + targetFrame.height / 2
    const enterDeltaX = originCenterX - targetCenterX
    const enterDeltaY = originCenterY - targetCenterY
    const enterScale = Math.max(
        0.55,
        Math.min(
            activeTile.frame.width / targetFrame.width,
            activeTile.frame.height / targetFrame.height
        )
    )
    const smoothPointerX = useSpring(pointerX, POINTER_SPRING)
    const smoothPointerY = useSpring(pointerY, POINTER_SPRING)
    const rotateX = useTransform(smoothPointerY, [-0.5, 0.5], [6.2, -6.2])
    const rotateY = useTransform(smoothPointerX, [-0.5, 0.5], [-7.4, 7.4])
    const lightX = useTransform(pointerX, [-0.5, 0.5], [39, 61])
    const lightY = useTransform(pointerY, [-0.5, 0.5], [40, 56])
    const backgroundImage = useMotionTemplate`
        linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 36%, rgba(15,23,42,0.08) 100%),
        radial-gradient(circle at ${lightX}% ${lightY}%, ${withAlpha(tile.rawColor, 0.34)} 0%, ${withAlpha(tile.rawColor, 0.22)} 32%, ${withAlpha(tile.rawColor, 0.1)} 60%, transparent 84%),
        linear-gradient(132deg, ${withAlpha(tile.rawColor, 0.32)} 0%, ${withAlpha(tile.rawColor, 0.18)} 46%, transparent 80%)
    `
    const overlayTransition: Transition = isScrollSyncing
        ? { duration: 0.08, ease: "linear" }
        : INTERACTIVE_CARD_TRANSITION

    if (typeof document === "undefined") return null

    return createPortal(
        <AnimatePresence>
            <motion.div
                key={tile.id}
                data-testid="spending-composition-overlay"
                className="pointer-events-none fixed z-[120] will-change-transform"
                initial={{
                    opacity: 0.88,
                    scale: enterScale,
                    rotateZ: rotateZ * 2.4,
                    x: enterDeltaX,
                    y: enterDeltaY
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    rotateZ,
                    x: 0,
                    y: 0
                }}
                exit={{
                    opacity: 0,
                    scale: enterScale,
                    rotateZ: rotateZ * 0.45,
                    x: enterDeltaX * 0.45,
                    y: enterDeltaY * 0.45
                }}
                transition={overlayTransition}
                style={{
                    top: targetFrame.top,
                    left: targetFrame.left,
                    width: targetFrame.width,
                    height: targetFrame.height,
                    transformStyle: "preserve-3d",
                    transformOrigin: "center center",
                    rotateX,
                    rotateY
                }}
            >
                <motion.div
                    className="relative h-full w-full overflow-hidden rounded-[2.15rem] border"
                    style={{
                        borderColor: surfaceStyle.borderColor,
                        backgroundColor: surfaceStyle.backgroundColor,
                        backgroundImage,
                        boxShadow: surfaceStyle.boxShadow
                    }}
                >
                    {/* Noise Texture Layer */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-overlay dark:mix-blend-plus-lighter dark:opacity-[0.12]"
                        style={{
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                        }}
                    />

                    <div className="absolute inset-[1px] rounded-[calc(2.15rem-1px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_36%)]" />
                    <div
                        className="absolute inset-x-[9%] bottom-5 h-px"
                        style={{
                            backgroundImage: `linear-gradient(90deg, transparent, ${withAlpha(tile.rawColor, 0.3)}, transparent)`
                        }}
                    />

                    <InteractiveCardGhostIcon
                        isActive={!showStaticIcon}
                        visibility="always"
                        className="inset-y-0 right-[2%]"
                        wrapperClassName="h-44 w-44"
                        tintStyle={{ color: withAlpha(tile.rawColor, 0.24) }}
                        renderIcon={() => tile.id === SYNTHETIC_ALTRI_ID ? (
                            <LayoutGrid className="h-32 w-32 opacity-80" strokeWidth={1.4} />
                        ) : (
                            <CategoryIcon
                                categoryId={tile.id}
                                categoryName={tile.name}
                                size={170}
                                className="[&_svg]:h-[10.5rem] [&_svg]:w-[10.5rem] [&_svg]:opacity-80"
                            />
                        )}
                    />

                    <div className="relative z-10 flex h-full flex-col justify-between px-7 py-6">
                        <div className="space-y-2">
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="max-w-[75%] text-[11px] font-black uppercase tracking-[0.24em] text-foreground/70"
                            >
                                {tile.name}
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 12 }}
                                transition={{ duration: 0.28, delay: 0.03, ease: [0.22, 1, 0.36, 1] }}
                                className="text-[clamp(2rem,2.8vw,3.2rem)] font-black tracking-tighter text-foreground tabular-nums"
                            >
                                <AnimatedNumber
                                    value={tile.value}
                                    initialValue={0}
                                    formatFn={(val) => formatCents(val, currency, locale)}
                                />
                            </motion.div>
                        </div>

                        <div className="flex items-end justify-between gap-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.85, y: 10 }}
                                transition={{ duration: 0.24, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                                className="flex h-14 w-14 items-center justify-center rounded-full border text-base font-black text-foreground"
                                style={{
                                    borderColor: withAlpha(tile.rawColor, 0.24),
                                    backgroundColor: withAlpha(tile.rawColor, 0.16)
                                }}
                            >
                                {tile.percentLabel}%
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scaleX: 0.65, y: 8 }}
                                animate={{ opacity: 1, scaleX: 1, y: 0 }}
                                exit={{ opacity: 0, scaleX: 0.7, y: 8 }}
                                transition={{ duration: 0.28, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="flex-1 pb-2"
                            >
                                <svg className="h-2 w-full overflow-visible" preserveAspectRatio="none">
                                    <line
                                        x1="0"
                                        y1="4"
                                        x2="100%"
                                        y2="4"
                                        className="stroke-black/7 dark:stroke-white/[0.08]"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                    />
                                    <motion.line
                                        x1="0"
                                        y1="4"
                                        x2={`${Math.max(tile.percentValue, 14)}%`}
                                        y2="4"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        style={{ stroke: withAlpha(tile.rawColor, 0.85) }}
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                </svg>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    )
}

export function SpendingCompositionCard({
    categoriesSummary = [],
    isLoading: isExternalLoading,
    periodLabel
}: SpendingCompositionCardProps) {
    const { currency, locale } = useCurrency()
    const prefersReducedMotion = useReducedMotion()
    const [hoveredTile, setHoveredTile] = useState<ActiveTileState | null>(null)
    const [pinnedTile, setPinnedTile] = useState<ActiveTileState | null>(null)
    const hoveredTileRef = useRef<ActiveTileState | null>(null)
    const pinnedTileRef = useRef<ActiveTileState | null>(null)
    const tileNodeRefs = useRef<Record<string, HTMLButtonElement | null>>({})
    const scrollResetRef = useRef<number | null>(null)
    const pointerX = useMotionValue(0)
    const pointerY = useMotionValue(0)
    const [isScrollSyncing, setIsScrollSyncing] = useState(false)

    const slices = useMemo(
        () => buildSpendingCompositionSlicesFromSummary(
            categoriesSummary,
            DEFAULT_TOP_SPENDING_CATEGORIES
        ),
        [categoriesSummary]
    )

    const total = useMemo(
        () => slices.reduce((sum, slice) => sum + slice.value, 0),
        [slices]
    )

    const tiles = useMemo<TileDatum[]>(() => (
        slices.map((slice, index) => {
            const rawColor = slice.id === SYNTHETIC_ALTRI_ID
                ? "#94a3b8"
                : (slice.color || TILE_FALLBACK_COLORS[index % TILE_FALLBACK_COLORS.length])
            const percentValue = total > 0 ? (slice.value / total) * 100 : 0

            return {
                id: slice.id,
                name: slice.name,
                value: slice.value,
                rawColor,
                percentValue,
                percentLabel: percentValue.toFixed(0)
            }
        })
    ), [slices, total])
    const tileLayoutClasses = useMemo(
        () => tiles.map((_, index) => resolveTileLayoutClass(index, tiles.length)),
        [tiles]
    )

    const description = periodLabel
        ? `Flussi consolidati per ${periodLabel}.`
        : "Come si distribuiscono le spese nel periodo selezionato."

    const activeTile = hoveredTile ?? pinnedTile
    const activeTileId = activeTile?.id ?? null
    const activeTileData = activeTileId ? tiles.find((tile) => tile.id === activeTileId) ?? null : null

    const registerTileNode = useCallback((tileId: string) => {
        return (node: HTMLButtonElement | null) => {
            tileNodeRefs.current[tileId] = node
        }
    }, [])

    const syncPointer = useCallback((tileState: ActiveTileState, clientX: number | null, clientY: number | null) => {
        if (clientX === null || clientY === null) {
            pointerX.set(0)
            pointerY.set(0)
            return
        }

        const targetFrame = resolveOverlayFrame(tileState)
        const nextPointer = resolveOverlayPointer({ ...tileState, clientX, clientY }, targetFrame)

        pointerX.set(nextPointer.pointerX)
        pointerY.set(nextPointer.pointerY)
    }, [pointerX, pointerY])

    const clearHoverState = useCallback(() => {
        hoveredTileRef.current = null
        if (pinnedTileRef.current) {
            syncPointer(pinnedTileRef.current, pinnedTileRef.current.clientX, pinnedTileRef.current.clientY)
        } else {
            pointerX.set(0)
            pointerY.set(0)
        }
        setHoveredTile(null)
    }, [pointerX, pointerY, syncPointer])

    const refreshTileAnchor = useCallback((kind: "hovered" | "pinned") => {
        const currentTile = kind === "hovered" ? hoveredTileRef.current : pinnedTileRef.current
        if (!currentTile) {
            return
        }

        const tileNode = tileNodeRefs.current[currentTile.id]
        if (!tileNode) {
            if (kind === "hovered") {
                clearHoverState()
            } else {
                pinnedTileRef.current = null
                setPinnedTile(null)
            }
            return
        }

        const nextTileState = {
            ...currentTile,
            frame: getFrame(tileNode)
        }

        if (kind === "hovered" && nextTileState.clientX !== null && nextTileState.clientY !== null) {
            const overlayFrame = resolveOverlayFrame(nextTileState)
            const isInsideOverlay =
                nextTileState.clientX >= overlayFrame.left &&
                nextTileState.clientX <= overlayFrame.left + overlayFrame.width &&
                nextTileState.clientY >= overlayFrame.top &&
                nextTileState.clientY <= overlayFrame.top + overlayFrame.height

            if (!isInsideOverlay) {
                clearHoverState()
                return
            }
        }

        if (kind === "hovered") {
            hoveredTileRef.current = nextTileState
            setHoveredTile(nextTileState)
        } else {
            pinnedTileRef.current = nextTileState
            setPinnedTile(nextTileState)
        }

        syncPointer(nextTileState, nextTileState.clientX, nextTileState.clientY)
    }, [clearHoverState, syncPointer])

    useEffect(() => {
        if (!hoveredTile) {
            return
        }

        let frameId = 0

        const handleWindowPointerMove = (event: PointerEvent) => {
            const currentHoveredTile = hoveredTileRef.current
            if (!currentHoveredTile) {
                return
            }

            if (frameId) {
                window.cancelAnimationFrame(frameId)
            }

            frameId = window.requestAnimationFrame(() => {
                const overlayFrame = resolveOverlayFrame(currentHoveredTile)
                const isInsideOverlay =
                    event.clientX >= overlayFrame.left &&
                    event.clientX <= overlayFrame.left + overlayFrame.width &&
                    event.clientY >= overlayFrame.top &&
                    event.clientY <= overlayFrame.top + overlayFrame.height

                if (!isInsideOverlay) {
                    clearHoverState()
                    return
                }

                currentHoveredTile.clientX = event.clientX
                currentHoveredTile.clientY = event.clientY
                syncPointer(currentHoveredTile, event.clientX, event.clientY)
            })
        }

        window.addEventListener("pointermove", handleWindowPointerMove, { passive: true })

        return () => {
            window.removeEventListener("pointermove", handleWindowPointerMove)
            if (frameId) {
                window.cancelAnimationFrame(frameId)
            }
        }
    }, [clearHoverState, hoveredTile, syncPointer])

    useEffect(() => {
        if (!hoveredTile && !pinnedTile) {
            return
        }

        let frameId = 0
        let scrollContainers: Array<HTMLElement | Window> = []

        const syncAnchors = () => {
            setIsScrollSyncing((current) => current || true)
            if (scrollResetRef.current) {
                window.clearTimeout(scrollResetRef.current)
            }
            scrollResetRef.current = window.setTimeout(() => {
                setIsScrollSyncing(false)
                scrollResetRef.current = null
            }, 120)

            if (frameId) {
                window.cancelAnimationFrame(frameId)
            }

            frameId = window.requestAnimationFrame(() => {
                if (hoveredTileRef.current) {
                    refreshTileAnchor("hovered")
                }

                if (pinnedTileRef.current) {
                    refreshTileAnchor("pinned")
                }

                frameId = 0
            })
        }

        const anchorNode = hoveredTileRef.current
            ? tileNodeRefs.current[hoveredTileRef.current.id]
            : pinnedTileRef.current
                ? tileNodeRefs.current[pinnedTileRef.current.id]
                : null

        scrollContainers = getScrollContainers(anchorNode)

        scrollContainers.forEach((container) => {
            container.addEventListener("scroll", syncAnchors, { passive: true })
        })
        window.addEventListener("resize", syncAnchors)

        return () => {
            scrollContainers.forEach((container) => {
                container.removeEventListener("scroll", syncAnchors)
            })
            window.removeEventListener("resize", syncAnchors)
            if (frameId) {
                window.cancelAnimationFrame(frameId)
            }
            if (scrollResetRef.current) {
                window.clearTimeout(scrollResetRef.current)
                scrollResetRef.current = null
            }
            setIsScrollSyncing(false)
        }
    }, [hoveredTile, pinnedTile, refreshTileAnchor])

    const handleHoverStart = (event: MouseEvent<HTMLButtonElement>, tileId: string, index: number) => {
        const nextFrame = getFrame(event.currentTarget)
        const nextTileState = {
            id: tileId,
            index,
            frame: nextFrame,
            clientX: event.clientX,
            clientY: event.clientY
        }

        hoveredTileRef.current = nextTileState
        syncPointer(nextTileState, event.clientX, event.clientY)
        setHoveredTile(nextTileState)
    }

    const handleFocusStart = (target: HTMLButtonElement, tileId: string, index: number) => {
        const nextTileState = {
            id: tileId,
            index,
            frame: getFrame(target),
            clientX: null,
            clientY: null
        }

        hoveredTileRef.current = nextTileState
        pointerX.set(0)
        pointerY.set(0)
        setHoveredTile(nextTileState)
    }

    const handleHoverMove = (event: MouseEvent<HTMLButtonElement>, tileId: string) => {
        const currentHoveredTile = hoveredTileRef.current
        if (!currentHoveredTile || currentHoveredTile.id !== tileId) {
            return
        }

        currentHoveredTile.clientX = event.clientX
        currentHoveredTile.clientY = event.clientY
        syncPointer(currentHoveredTile, event.clientX, event.clientY)
    }

    const handleHoverEnd = () => {
        clearHoverState()
    }

    const handleTogglePin = (event: MouseEvent<HTMLButtonElement>, tileId: string, index: number) => {
        const nextFrame = getFrame(event.currentTarget)

        setPinnedTile((current) => {
            if (current?.id === tileId) {
                pinnedTileRef.current = null
                if (hoveredTileRef.current) {
                    syncPointer(hoveredTileRef.current, hoveredTileRef.current.clientX, hoveredTileRef.current.clientY)
                } else {
                    pointerX.set(0)
                    pointerY.set(0)
                }
                return null
            }

            const nextPinnedTile = {
                id: tileId,
                index,
                frame: nextFrame,
                clientX: event.clientX,
                clientY: event.clientY
            }

            pinnedTileRef.current = nextPinnedTile
            syncPointer(nextPinnedTile, event.clientX, event.clientY)

            return nextPinnedTile
        })
    }

    if (isExternalLoading) {
        return (
            <MacroSection
                variant="premium"
                title="Distribuzione Risorse"
                description="Sto preparando la composizione del periodo..."
                background={<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_58%)]" />}
            >
                <div className="grid auto-rows-[minmax(8.9rem,auto)] grid-flow-dense grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className={cn("surface-subtle rounded-[1.9rem] p-4", resolveTileLayoutClass(index, 4))}
                        >
                            <div className="space-y-4">
                                <Skeleton className="h-3 w-20 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4 rounded-full" />
                                    <Skeleton className="h-3 w-1/2 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </MacroSection>
        )
    }

    if (tiles.length === 0) {
        return (
            <MacroSection
                variant="premium"
                title="Distribuzione Risorse"
                description={description}
            >
                <StateMessage
                    variant="empty"
                    title="Nessun dato"
                    description="Qui vedrai la distribuzione delle spese appena saranno disponibili."
                />
            </MacroSection>
        )
    }

    return (
        <MacroSection
            variant="premium"
            title="Distribuzione Risorse"
            description={description}
            background={<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.08),transparent_60%)]" />}
            contentClassName="relative px-4 pb-8 pt-4 sm:px-8"
        >
            <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                        Passa su una tile per aprirla: il mosaico resta silenzioso finché non scegli dove guardare.
                    </p>
                    <span className="rounded-full border border-white/18 bg-white/28 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-foreground/80 dark:bg-white/[0.04]">
                        {prefersReducedMotion ? "Movimento ridotto" : "Card sensibili"}
                    </span>
                </div>

                <div className="relative [perspective:1800px]">
                    <div className="grid auto-rows-[minmax(8.9rem,auto)] grid-flow-dense grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {tiles.map((tile, index) => {
                            const isLifted = activeTileId === tile.id
                            const isDimmed = Boolean(activeTileId) && !isLifted

                            return (
                                <SpendingTile
                                    key={tile.id}
                                    tile={tile}
                                    index={index}
                                    layoutClass={tileLayoutClasses[index] ?? "xl:col-span-2"}
                                    isDimmed={isDimmed}
                                    isLifted={isLifted}
                                    buttonRef={registerTileNode(tile.id)}
                                    onHoverStart={handleHoverStart}
                                    onFocusStart={handleFocusStart}
                                    onHoverMove={handleHoverMove}
                                    onHoverEnd={handleHoverEnd}
                                    onTogglePin={handleTogglePin}
                                />
                            )
                        })}
                    </div>
                </div>
            </div>

            {activeTile && activeTileData ? (
                <ActiveTileOverlay
                    activeTile={activeTile}
                    tile={activeTileData}
                    currency={currency}
                    locale={locale}
                    pointerX={pointerX}
                    pointerY={pointerY}
                    showStaticIcon={Boolean(prefersReducedMotion)}
                    isScrollSyncing={isScrollSyncing}
                />
            ) : null}
        </MacroSection>
    )
}
