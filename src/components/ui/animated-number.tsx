"use client"

import { useEffect, useRef } from "react"
import { useSpring, useMotionValue } from "framer-motion"

interface AnimatedNumberProps {
    value: number
    initialValue?: number
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
    initialValue,
    formatFn = (v) => Math.round(v).toString(),
    className,
    springOptions = { stiffness: 100, damping: 30, mass: 1 }
}: AnimatedNumberProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const startValue = initialValue !== undefined ? initialValue : value
    const motionValue = useMotionValue(startValue)
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

    return <span ref={ref} className={className}>{formatFn(startValue)}</span>
}
