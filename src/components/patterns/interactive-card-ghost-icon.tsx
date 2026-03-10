"use client"

import { createElement, type CSSProperties, type ElementType, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface InteractiveCardGhostIconProps {
    icon?: ElementType
    renderIcon?: () => ReactNode
    className?: string
    wrapperClassName?: string
    iconClassName?: string
    tintStyle?: CSSProperties
    tintClassName?: string
    isActive?: boolean
    strokeWidth?: number
    floatDelay?: number
    enableFloat?: boolean
    visibility?: "active-only" | "always"
}

export function InteractiveCardGhostIcon({
    icon,
    renderIcon,
    className,
    wrapperClassName,
    iconClassName,
    tintStyle,
    tintClassName,
    isActive = false,
    strokeWidth = 1.4,
    floatDelay = 0,
    enableFloat = true,
    visibility = "active-only"
}: InteractiveCardGhostIconProps) {
    const prefersReducedMotion = useReducedMotion()
    const resolvedTintStyle = tintStyle ?? {
        color: isActive ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)"
    }
    const shouldRender = visibility === "always" || isActive

    if (!icon && !renderIcon) {
        return null
    }

    return (
        <div
            aria-hidden
            className={cn("pointer-events-none absolute inset-y-0 right-[2%] flex items-center justify-end", className)}
        >
            <AnimatePresence initial={false}>
                {shouldRender ? (
                    <motion.div
                        key={visibility === "always" ? "persistent-ghost-icon" : "active-ghost-icon"}
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.76, rotate: -14, x: 28 }}
                        animate={prefersReducedMotion ? { opacity: 1, scale: 1, rotate: 0, x: 0 } : {
                            opacity: 1,
                            scale: 1,
                            rotate: 0,
                            x: 0
                        }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.84, rotate: 8, x: 18 }}
                        transition={prefersReducedMotion ? undefined : {
                            type: "spring",
                            stiffness: 200,
                            damping: 18,
                            delay: 0.04
                        }}
                    >
                        <motion.div
                            animate={prefersReducedMotion || !isActive || !enableFloat ? undefined : {
                                y: [-4, 5, -4],
                                rotate: [-1.5, 1.5, -1.5],
                                scale: [0.98, 1.02, 0.98]
                            }}
                            transition={prefersReducedMotion || !isActive || !enableFloat ? undefined : {
                                duration: 5.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: floatDelay
                            }}
                            className="text-current"
                        >
                            <div
                                className={cn("flex items-center justify-center", wrapperClassName, tintClassName)}
                                style={resolvedTintStyle}
                            >
                                {renderIcon
                                    ? renderIcon()
                                    : createElement(icon as ElementType, {
                                        className: cn("h-24 w-24 opacity-80", iconClassName),
                                        strokeWidth
                                    })}
                            </div>
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}
