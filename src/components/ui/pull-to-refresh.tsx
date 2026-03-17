"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { animate, motion, useMotionValue, useTransform } from "framer-motion"
import { RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh?: () => Promise<void> | void
  className?: string
}

const TRIGGER_THRESHOLD = 40 // Very low threshold for high sensitivity

export function PullToRefresh({ 
  children, 
  onRefresh, 
  className 
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const pullDistance = useMotionValue(0)
  const opacity = useTransform(pullDistance, [0, TRIGGER_THRESHOLD], [0, 1])
  const scale = useTransform(pullDistance, [0, TRIGGER_THRESHOLD], [0.5, 1])
  const rotate = useTransform(pullDistance, [0, TRIGGER_THRESHOLD], [0, 360])
  const y = useTransform(pullDistance, (val) => val * 0.8) // High sensitivity

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)

    // Hold at refresh state
    animate(pullDistance, TRIGGER_THRESHOLD, { type: "spring" })

    if (onRefresh) {
      await onRefresh()
    } else {
      // Default: hard reload after a short delay for feedback
      await new Promise((resolve) => window.setTimeout(resolve, 1000))
      window.location.reload()
    }

    setIsRefreshing(false)
    animate(pullDistance, 0, { type: "spring", stiffness: 300, damping: 30 })
  }, [onRefresh, pullDistance])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let startY = 0
    let isAtTop = false
    let isDragging = false
    let currentPull = 0
    let wheelResetTimer: ReturnType<typeof setTimeout> | null = null

    const onStart = (y: number) => {
      startY = y
      isAtTop = el.scrollTop <= 2
      isDragging = true
      currentPull = 0
    }

    const onMove = (y: number, e: TouchEvent | MouseEvent) => {
      if (!isAtTop || isRefreshing || !isDragging) return
      
      const delta = y - startY
      if (delta > 0) {
        if (e.cancelable) e.preventDefault()
        currentPull = delta
        pullDistance.set(delta)
      } else {
        currentPull = 0
        pullDistance.set(0)
      }
    }

    const onEnd = () => {
      if (!isDragging) return
      isDragging = false
      
      if (currentPull >= TRIGGER_THRESHOLD) {
        handleRefresh()
      } else {
        animate(pullDistance, 0, { type: "spring", stiffness: 400, damping: 35 })
      }
      currentPull = 0
    }

    const handleWheel = (e: WheelEvent) => {
      if (isRefreshing) return
      
      // If we are at the top and scrolling "up" (pulling content down)
      if (el.scrollTop <= 0 && e.deltaY < 0) {
        if (e.cancelable) e.preventDefault()
        
        currentPull += Math.abs(e.deltaY) * 0.5 // Accumulate with sensitivity factor
        pullDistance.set(currentPull)

        if (currentPull >= TRIGGER_THRESHOLD) {
          handleRefresh()
          currentPull = 0
        }
      } else {
        currentPull = 0
        if (pullDistance.get() > 0) {
            animate(pullDistance, 0, { type: "spring", stiffness: 400, damping: 35 })
        }
      }

      // Reset if no activity
      if (wheelResetTimer !== null) {
        clearTimeout(wheelResetTimer)
      }

      wheelResetTimer = setTimeout(() => {
        if (!isRefreshing && pullDistance.get() > 0) {
          animate(pullDistance, 0, { type: "spring", stiffness: 400, damping: 35 })
          currentPull = 0
        }
      }, 200)
    }

    el.addEventListener("touchstart", handleTouchStart)
    el.addEventListener("touchmove", handleTouchMove, { passive: false })
    el.addEventListener("touchend", handleTouchEnd)
    
    el.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    el.addEventListener("wheel", handleWheel, { passive: false })

    function handleTouchStart(e: TouchEvent) { onStart(e.touches[0].pageY) }
    function handleTouchMove(e: TouchEvent) { onMove(e.touches[0].pageY, e) }
    function handleTouchEnd() { onEnd() }
    function handleMouseDown(e: MouseEvent) { onStart(e.pageY) }
    function handleMouseMove(e: MouseEvent) { onMove(e.pageY, e) }
    function handleMouseUp() { onEnd() }

    return () => {
      el.removeEventListener("touchstart", handleTouchStart)
      el.removeEventListener("touchmove", handleTouchMove)
      el.removeEventListener("touchend", handleTouchEnd)
      el.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      el.removeEventListener("wheel", handleWheel)

      if (wheelResetTimer !== null) {
        clearTimeout(wheelResetTimer)
      }
    }
  }, [handleRefresh, isRefreshing, pullDistance])

  return (
    <div 
      ref={containerRef}
      className={cn("relative h-full w-full overflow-y-auto scroll-smooth", className)}
    >
      {/* Pull Indicator Area */}
      <motion.div 
        className="pointer-events-none absolute inset-x-0 flex justify-center pt-8 z-50"
        style={{ opacity, scale }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary shadow-xl backdrop-blur-md">
          <motion.div style={{ rotate: isRefreshing ? undefined : rotate }}>
            <RefreshCcw className={cn("h-6 w-6", isRefreshing && "animate-spin")} />
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  )
}
