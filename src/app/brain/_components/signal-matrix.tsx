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
} from "framer-motion"
import { createPortal } from "react-dom"
import { Activity } from "lucide-react"
import { InteractiveCardGhostIcon } from "@/components/patterns/interactive-card-ghost-icon"
import {
    INTERACTIVE_CARD_HOVER_STATE,
    INTERACTIVE_CARD_TRANSITION,
    resolveInteractiveSurfaceStyle,
    withAlpha,
} from "@/components/patterns/interactive-surface"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

// ── Types ───────────────────────────────────────────────────────────────

interface SignalDatum {
    feature: string
    value: number
    weight: number
    contribution: number
}

interface TileFrame {
    top: number
    left: number
    width: number
    height: number
}

interface ActiveSignalState {
    feature: string
    index: number
    frame: TileFrame
    clientX: number | null
    clientY: number | null
}

interface SignalMatrixProps {
    contributorsTop: SignalDatum[]
}

// ── Labels ──────────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<string, string> = {
    expense_income_ratio: "Rapporto spese / entrate",
    superfluous_share: "Quota spese non essenziali",
    comfort_share: "Quota comfort",
    txn_density: "Frequenza transazioni",
    expense_momentum: "Tendenza spese",
    income_momentum: "Tendenza entrate",
    discretionary_pressure: "Pressione discrezionali",
    expense_gap_ratio: "Divario spese / entrate",
}

function resolveLabel(feature: string): string {
    if (FEATURE_LABELS[feature]) return FEATURE_LABELS[feature]
    const fallback = feature.replace(/_/g, " ")
    return fallback.charAt(0).toUpperCase() + fallback.slice(1)
}

// ── Colors ──────────────────────────────────────────────────────────────

const POSITIVE_COLOR = "#0ea5a8"
const NEGATIVE_COLOR = "#f59e0b"

function resolveSignalColor(contribution: number): string {
    return contribution >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR
}

// ── Helpers ─────────────────────────────────────────────────────────────

const POINTER_SPRING = { stiffness: 520, damping: 42, mass: 0.18 } as const
const NOISE_TEXTURE_BACKGROUND = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
}

function getFrame(target: HTMLElement): TileFrame {
    const rect = target.getBoundingClientRect()
    return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

function resolveOverlayFrame(activeSignal: ActiveSignalState): TileFrame {
    if (typeof window === "undefined") return activeSignal.frame
    const width = Math.min(window.innerWidth - 48, activeSignal.frame.width * 1.45)
    const height = Math.min(window.innerHeight - 96, Math.max(220, activeSignal.frame.height * 2.8))
    const centeredLeft = activeSignal.frame.left + (activeSignal.frame.width - width) / 2
    const centeredTop = activeSignal.frame.top - (height - activeSignal.frame.height) * 0.4

    return {
        width,
        height,
        left: clamp(centeredLeft, 24, window.innerWidth - width - 24),
        top: clamp(centeredTop, 96, window.innerHeight - height - 24),
    }
}

function resolveOverlayPointer(active: ActiveSignalState, frame: TileFrame): { pointerX: number; pointerY: number } {
    if (active.clientX === null || active.clientY === null) return { pointerX: 0, pointerY: 0 }
    return {
        pointerX: clamp((active.clientX - frame.left) / frame.width - 0.5, -0.5, 0.5),
        pointerY: clamp((active.clientY - frame.top) / frame.height - 0.5, -0.5, 0.5),
    }
}

// ── Signal Tile (resting state) ─────────────────────────────────────────

function SignalTile({
    signal,
    index,
    isDimmed,
    isLifted,
    buttonRef,
    onHoverStart,
    onHoverMove,
    onHoverEnd,
}: {
    signal: SignalDatum
    index: number
    isDimmed: boolean
    isLifted: boolean
    buttonRef: (node: HTMLButtonElement | null) => void
    onHoverStart: (event: MouseEvent<HTMLButtonElement>, feature: string, index: number) => void
    onHoverMove: (event: MouseEvent<HTMLButtonElement>, feature: string) => void
    onHoverEnd: () => void
}) {
    const prefersReducedMotion = useReducedMotion()
    const rawColor = resolveSignalColor(signal.contribution)
    const surfaceStyle = resolveInteractiveSurfaceStyle(rawColor, "rest")
    const intensity = Math.min(1, Math.abs(signal.contribution) * 5)
    const accentLineStyle = {
        backgroundImage: `linear-gradient(90deg, transparent, ${withAlpha(rawColor, 0.42)}, transparent)`,
    }
    const accentBarStyle = { backgroundColor: withAlpha(rawColor, 0.7) }
    const labelStyle = { color: withAlpha(rawColor, 0.8) }
    const trackStyle = { backgroundColor: withAlpha(rawColor, 0.12) }
    const fillStyle = {
        width: `${Math.max(intensity * 100, 8)}%`,
        backgroundColor: withAlpha(rawColor, 0.72),
    }
    const valueStyle = { color: withAlpha(rawColor, 0.68) }

    return (
        <motion.button
            ref={buttonRef}
            type="button"
            aria-label={resolveLabel(signal.feature)}
            className={cn(
                "group/tile relative min-h-[5rem] w-full overflow-hidden rounded-[1.4rem] border px-5 py-3.5 text-left transition-[opacity,border-color,transform] duration-300",
                isLifted && "opacity-[0.08]",
                isDimmed && "opacity-[0.18]",
            )}
            style={surfaceStyle}
            onMouseEnter={(e) => onHoverStart(e, signal.feature, index)}
            onMouseMove={(e) => onHoverMove(e, signal.feature)}
            onMouseLeave={onHoverEnd}
            whileHover={prefersReducedMotion ? undefined : { ...INTERACTIVE_CARD_HOVER_STATE, scale: 0.985 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            transition={INTERACTIVE_CARD_TRANSITION}
        >
            {/* Top accent line */}
            <div
                className="pointer-events-none absolute inset-x-4 top-0 h-px"
                style={accentLineStyle}
            />

            <InteractiveCardGhostIcon
                icon={Activity}
                isActive={false}
                className="inset-y-0 right-[2%]"
                wrapperClassName="h-20 w-20"
                iconClassName="h-14 w-14"
                tintStyle={{ color: withAlpha(rawColor, 0.18) }}
            />

            <div className="relative z-10 flex h-full items-center gap-4">
                {/* Accent bar */}
                <div
                    className="h-8 w-1 shrink-0 rounded-full"
                    style={accentBarStyle}
                />

                {/* Label + bar */}
                <div className="min-w-0 flex-1 space-y-1.5">
                    <span
                        className="text-[10px] font-black uppercase leading-tight tracking-[0.22em]"
                        style={labelStyle}
                    >
                        {resolveLabel(signal.feature)}
                    </span>
                    <div
                        className="h-1 rounded-full"
                        style={trackStyle}
                    >
                        <div
                            className="h-full rounded-full transition-[width] duration-700 ease-out"
                            style={fillStyle}
                        />
                    </div>
                </div>

                {/* Value */}
                <span
                    className="shrink-0 text-[11px] font-semibold tabular-nums"
                    style={valueStyle}
                >
                    {signal.contribution >= 0 ? "+" : ""}{signal.contribution.toFixed(4)}
                </span>
            </div>
        </motion.button>
    )
}

// ── Active Signal Overlay (portal zoom — like SpendingComposition) ──────

function ActiveSignalOverlay({
    activeSignal,
    signal,
    pointerX,
    pointerY,
}: {
    activeSignal: ActiveSignalState
    signal: SignalDatum
    pointerX: MotionValue<number>
    pointerY: MotionValue<number>
}) {
    const rawColor = resolveSignalColor(signal.contribution)
    const targetFrame = resolveOverlayFrame(activeSignal)
    const surfaceStyle = resolveInteractiveSurfaceStyle(rawColor, "active")
    const intensity = Math.min(1, Math.abs(signal.contribution) * 5)
    const originCenterX = activeSignal.frame.left + activeSignal.frame.width / 2
    const originCenterY = activeSignal.frame.top + activeSignal.frame.height / 2
    const targetCenterX = targetFrame.left + targetFrame.width / 2
    const targetCenterY = targetFrame.top + targetFrame.height / 2
    const enterDeltaX = originCenterX - targetCenterX
    const enterDeltaY = originCenterY - targetCenterY
    const enterScale = Math.max(
        0.55,
        Math.min(
            activeSignal.frame.width / targetFrame.width,
            activeSignal.frame.height / targetFrame.height,
        ),
    )

    const smoothPointerX = useSpring(pointerX, POINTER_SPRING)
    const smoothPointerY = useSpring(pointerY, POINTER_SPRING)
    const rotateX = useTransform(smoothPointerY, [-0.5, 0.5], [6.2, -6.2])
    const rotateY = useTransform(smoothPointerX, [-0.5, 0.5], [-7.4, 7.4])
    const lightX = useTransform(pointerX, [-0.5, 0.5], [39, 61])
    const lightY = useTransform(pointerY, [-0.5, 0.5], [40, 56])
    const backgroundImage = useMotionTemplate`
        linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 36%, rgba(15,23,42,0.08) 100%),
        radial-gradient(circle at ${lightX}% ${lightY}%, ${withAlpha(rawColor, 0.34)} 0%, ${withAlpha(rawColor, 0.22)} 32%, ${withAlpha(rawColor, 0.1)} 60%, transparent 84%),
        linear-gradient(132deg, ${withAlpha(rawColor, 0.32)} 0%, ${withAlpha(rawColor, 0.18)} 46%, transparent 80%)
    `
    const overlayShellStyle = {
        top: targetFrame.top,
        left: targetFrame.left,
        width: targetFrame.width,
        height: targetFrame.height,
        transformStyle: "preserve-3d" as const,
        transformOrigin: "center center" as const,
        rotateX,
        rotateY,
    }
    const overlaySurfaceStyle = {
        borderColor: surfaceStyle.borderColor,
        backgroundColor: surfaceStyle.backgroundColor,
        backgroundImage,
        boxShadow: surfaceStyle.boxShadow,
    }
    const noiseTextureStyle = { backgroundImage: NOISE_TEXTURE_BACKGROUND }
    const bottomAccentStyle = {
        backgroundImage: `linear-gradient(90deg, transparent, ${withAlpha(rawColor, 0.3)}, transparent)`,
    }
    const progressStrokeStyle = { stroke: withAlpha(rawColor, 0.85) }

    if (typeof document === "undefined") return null

    return createPortal(
        <AnimatePresence>
            <motion.div
                key={signal.feature}
                data-testid="signal-matrix-overlay"
                className="pointer-events-none fixed z-[120] will-change-transform"
                initial={{
                    opacity: 0.88,
                    scale: enterScale,
                    x: enterDeltaX,
                    y: enterDeltaY,
                }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                exit={{
                    opacity: 0,
                    scale: enterScale,
                    x: enterDeltaX * 0.45,
                    y: enterDeltaY * 0.45,
                }}
                transition={INTERACTIVE_CARD_TRANSITION}
                style={overlayShellStyle}
            >
                <motion.div
                    className="relative h-full w-full overflow-hidden rounded-[1.8rem] border"
                    style={overlaySurfaceStyle}
                >
                    {/* Noise texture */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-overlay dark:mix-blend-plus-lighter dark:opacity-[0.12]"
                        style={noiseTextureStyle}
                    />
                    <div className="absolute inset-[1px] rounded-[calc(1.8rem-1px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_36%)]" />

                    {/* Bottom accent */}
                    <div
                        className="absolute inset-x-[9%] bottom-4 h-px"
                        style={bottomAccentStyle}
                    />

                    <InteractiveCardGhostIcon
                        icon={Activity}
                        isActive
                        visibility="always"
                        className="inset-y-0 right-[2%]"
                        wrapperClassName="h-36 w-36"
                        iconClassName="h-24 w-24"
                        tintStyle={{ color: withAlpha(rawColor, 0.24) }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex h-full flex-col justify-between px-6 py-5">
                        <div className="space-y-2">
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="max-w-[75%] text-[11px] font-black uppercase tracking-[0.24em] text-foreground/70"
                            >
                                {resolveLabel(signal.feature)}
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.28, delay: 0.03, ease: [0.22, 1, 0.36, 1] }}
                                className={cn(
                                    "text-[clamp(2rem,2.8vw,3.2rem)] font-black tracking-tighter tabular-nums",
                                    signal.contribution >= 0 ? "text-primary" : "text-amber-400",
                                )}
                            >
                                {signal.contribution >= 0 ? "+" : ""}{signal.contribution.toFixed(4)}
                            </motion.p>
                        </div>

                        <div className="space-y-3">
                            {/* Details row */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.24, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-wrap gap-x-5 gap-y-1"
                            >
                                <p className="text-xs font-medium text-foreground/60">
                                    Valore <span className="font-bold tabular-nums text-foreground/80">{signal.value.toFixed(4)}</span>
                                </p>
                                <p className="text-xs font-medium text-foreground/60">
                                    Peso <span className="font-bold tabular-nums text-foreground/80">{signal.weight.toFixed(4)}</span>
                                </p>
                            </motion.div>

                            {/* Bar */}
                            <motion.div
                                initial={{ opacity: 0, scaleX: 0.65, y: 8 }}
                                animate={{ opacity: 1, scaleX: 1, y: 0 }}
                                transition={{ duration: 0.28, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <svg className="h-2 w-full overflow-visible" preserveAspectRatio="none">
                                    <line
                                        x1="0" y1="4" x2="100%" y2="4"
                                        className="stroke-black/7 dark:stroke-white/[0.08]"
                                        strokeWidth="8" strokeLinecap="round"
                                    />
                                    <motion.line
                                        x1="0" y1="4"
                                        x2={`${Math.max(intensity * 100, 14)}%`} y2="4"
                                        strokeWidth="8" strokeLinecap="round"
                                        style={progressStrokeStyle}
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
        document.body,
    )
}

// ── Signal Matrix (export) ──────────────────────────────────────────────

export function SignalMatrix({
    contributorsTop,
}: SignalMatrixProps) {
    const prefersReducedMotion = useReducedMotion()
    const [hoveredSignal, setHoveredSignal] = useState<ActiveSignalState | null>(null)
    const hoveredRef = useRef<ActiveSignalState | null>(null)
    const tileNodeRefs = useRef<Record<string, HTMLButtonElement | null>>({})
    const pointerX = useMotionValue(0)
    const pointerY = useMotionValue(0)

    const sortedSignals = useMemo(
        () => [...contributorsTop].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)),
        [contributorsTop],
    )

    const activeSignalData = hoveredSignal
        ? sortedSignals.find((s) => s.feature === hoveredSignal.feature) ?? null
        : null

    const registerTileNode = useCallback((feature: string) => {
        return (node: HTMLButtonElement | null) => {
            tileNodeRefs.current[feature] = node
        }
    }, [])

    const syncPointer = useCallback(
        (signalState: ActiveSignalState, clientX: number | null, clientY: number | null) => {
            if (clientX === null || clientY === null) {
                pointerX.set(0)
                pointerY.set(0)
                return
            }
            const frame = resolveOverlayFrame(signalState)
            const next = resolveOverlayPointer({ ...signalState, clientX, clientY }, frame)
            pointerX.set(next.pointerX)
            pointerY.set(next.pointerY)
        },
        [pointerX, pointerY],
    )

    const clearHoverState = useCallback(() => {
        hoveredRef.current = null
        pointerX.set(0)
        pointerY.set(0)
        setHoveredSignal(null)
    }, [pointerX, pointerY])

    // Track pointer while overlay is open
    useEffect(() => {
        if (!hoveredSignal) return
        let frameId = 0

        const handleWindowPointerMove = (event: PointerEvent) => {
            const current = hoveredRef.current
            if (!current) return
            if (frameId) window.cancelAnimationFrame(frameId)

            frameId = window.requestAnimationFrame(() => {
                const overlayFrame = resolveOverlayFrame(current)
                const isInside =
                    event.clientX >= overlayFrame.left &&
                    event.clientX <= overlayFrame.left + overlayFrame.width &&
                    event.clientY >= overlayFrame.top &&
                    event.clientY <= overlayFrame.top + overlayFrame.height

                if (!isInside) {
                    clearHoverState()
                    return
                }

                current.clientX = event.clientX
                current.clientY = event.clientY
                syncPointer(current, event.clientX, event.clientY)
            })
        }

        window.addEventListener("pointermove", handleWindowPointerMove, { passive: true })
        return () => {
            window.removeEventListener("pointermove", handleWindowPointerMove)
            if (frameId) window.cancelAnimationFrame(frameId)
        }
    }, [clearHoverState, hoveredSignal, syncPointer])

    const handleHoverStart = useCallback(
        (event: MouseEvent<HTMLButtonElement>, feature: string, index: number) => {
            if (prefersReducedMotion) return
            const nextState: ActiveSignalState = {
                feature,
                index,
                frame: getFrame(event.currentTarget),
                clientX: event.clientX,
                clientY: event.clientY,
            }
            hoveredRef.current = nextState
            syncPointer(nextState, event.clientX, event.clientY)
            setHoveredSignal(nextState)
        },
        [prefersReducedMotion, syncPointer],
    )

    const handleHoverMove = useCallback(
        (event: MouseEvent<HTMLButtonElement>, feature: string) => {
            const current = hoveredRef.current
            if (!current || current.feature !== feature) return
            current.clientX = event.clientX
            current.clientY = event.clientY
            syncPointer(current, event.clientX, event.clientY)
        },
        [syncPointer],
    )

    const handleHoverEnd = useCallback(() => {
        clearHoverState()
    }, [clearHoverState])

    return (
        <Accordion type="single" collapsible className="rounded-xl border border-border/60 bg-muted/10 px-4">
            <AccordionItem value="signal-matrix" className="border-none">
                <AccordionTrigger className="py-3 text-sm font-semibold text-foreground hover:no-underline">
                    Segnali del Core
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                    <div className="space-y-4">
                        {/* Tiles */}
                        {sortedSignals.length === 0 ? (
                            <p className="px-1 text-sm font-medium text-muted-foreground">
                                Non ci sono ancora segnali attivi. Avvia il Core per generare la prima analisi.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {sortedSignals.map((signal, index) => (
                                    <SignalTile
                                        key={signal.feature}
                                        signal={signal}
                                        index={index}
                                        isDimmed={hoveredSignal !== null && hoveredSignal.feature !== signal.feature}
                                        isLifted={hoveredSignal?.feature === signal.feature}
                                        buttonRef={registerTileNode(signal.feature)}
                                        onHoverStart={handleHoverStart}
                                        onHoverMove={handleHoverMove}
                                        onHoverEnd={handleHoverEnd}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Overlay portal */}
                    {hoveredSignal && activeSignalData && (
                        <ActiveSignalOverlay
                            activeSignal={hoveredSignal}
                            signal={activeSignalData}
                            pointerX={pointerX}
                            pointerY={pointerY}
                        />
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
