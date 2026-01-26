"use client"

import * as React from "react"
import { motion, Variants } from "framer-motion"
import { cn } from "@/lib/utils"

interface StaggerContainerProps {
    children: React.ReactNode
    className?: string
    staggerDelay?: number
    delayChildren?: number
}

const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08, // Slightly faster stagger for 0.4s items
            delayChildren: 0.05,
        },
    },
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
            initial="hidden"
            animate="visible"
            className={cn("w-full space-y-6", className)}
        >
            {children}
        </motion.div>
    )
}
