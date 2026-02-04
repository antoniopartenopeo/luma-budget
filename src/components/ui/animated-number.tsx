"use client"

import { useEffect, useRef } from "react"
import { useSpring, useMotionValue } from "framer-motion"

interface AnimatedNumberProps {
    value: number
    formatFn?: (value: number) => string
    className?: string
    springOptions?: {
        stiffness?: number
        damping?: number
        mass?: number
    }
}

export function AnimatedNumber({
    value,
    formatFn = (v) => Math.round(v).toString(),
    className,
    springOptions = { stiffness: 100, damping: 30, mass: 1 }
}: AnimatedNumberProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const motionValue = useMotionValue(value)
    const springValue = useSpring(motionValue, springOptions)

    useEffect(() => {
        motionValue.set(value)
    }, [value, motionValue])

    useEffect(() => {
        const unsubscribe = springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = formatFn(latest)
            }
        })
        return () => unsubscribe()
    }, [springValue, formatFn])

    // Initial render
    useEffect(() => {
        if (ref.current) {
            ref.current.textContent = formatFn(value)
        }
    }, [value, formatFn])

    return <span ref={ref} className={className} />
}
