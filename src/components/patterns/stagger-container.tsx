"use client"

import * as React from "react"
import { motion, Variants, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StaggerContainerProps {
    children: React.ReactNode
    className?: string
    staggerDelay?: number
    delayChildren?: number
}


/**
 * StaggerContainer: Orchestratore del Global Motion System.
 * Gestisce l'ingresso sequenziale delle MacroSection o altri elementi motion-aware.
 * Assicura che il timing sia centralizzato e non deciso dai singoli componenti.
 */
export function StaggerContainer({
    children,
    className,
    staggerDelay = 0.1,
    delayChildren = 0.05,
}: StaggerContainerProps) {
    const prefersReducedMotion = useReducedMotion()

    // Update variants with dynamic delays if provided
    const dynamicVariants: Variants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                delayChildren: delayChildren,
            },
        },
    }

    return (
        <motion.div
            variants={dynamicVariants}
            initial={prefersReducedMotion ? false : "hidden"}
            animate={prefersReducedMotion ? undefined : "visible"}
            className={cn("w-full space-y-6", className)}
        >
            {children}
        </motion.div>
    )
}
