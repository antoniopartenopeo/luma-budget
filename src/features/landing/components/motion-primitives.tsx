"use client"

import type { CSSProperties, ReactNode } from "react"
import { useRef } from "react"
import { m, useReducedMotion, useScroll, useTransform, useInView, useMotionValue, useSpring, useMotionTemplate, type MotionValue } from "framer-motion"
import { useDeviceHardware } from "@/hooks/use-device-hardware"
import { cn } from "@/lib/utils"

const CURRENT_COLOR_STOP = { stopColor: "currentColor" }
const NOISE_TEXTURE_STYLE: CSSProperties = {
  backgroundImage:
    "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"noiseFilter\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23noiseFilter)\"/></svg>')",
}

export const EDITORIAL_EDGE_LIGHT_SPRING = {
  damping: 40,
  stiffness: 300,
  mass: 0.5,
} as const

interface EditorialEdgeLightOptions {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  inputRange?: [number, number]
  springConfig?: {
    damping: number
    stiffness: number
    mass?: number
  }
}

export function useEditorialEdgeLight({
  mouseX,
  mouseY,
  inputRange = [-0.5, 0.5],
  springConfig = EDITORIAL_EDGE_LIGHT_SPRING,
}: EditorialEdgeLightOptions) {
  const lightX = useSpring(useTransform(mouseX, inputRange, [0, 100]), springConfig)
  const lightY = useSpring(useTransform(mouseY, inputRange, [0, 100]), springConfig)

  const laserBackground = useMotionTemplate`
    radial-gradient(520px circle at ${lightX}% ${lightY}%, rgba(45,212,191,0.96) 0%, rgba(34,211,238,0.82) 18%, rgba(20,184,166,0.36) 42%, transparent 74%),
    radial-gradient(220px circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.26) 44%, transparent 78%)
  `

  return {
    laserBackground,
  }
}

export function AppleFluidMesh({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion() ?? false
  const { safeToAnimate3D } = useDeviceHardware()
  const isInView = useInView(ref, { margin: "20%" })
  const shouldAnimate = safeToAnimate3D && !prefersReducedMotion && isInView
  const loopTransition = (duration: number) => ({
    duration,
    repeat: Infinity,
    repeatType: "mirror" as const,
    ease: "easeInOut" as const,
  })

  return (
    <div ref={ref} className={cn("overflow-hidden pointer-events-none transition-opacity duration-1000", className)}>
      <m.svg
        className="absolute h-[150%] w-[150%] -top-[25%] -left-[25%] opacity-90 dark:opacity-[0.96] saturate-100 dark:saturate-75 mix-blend-normal"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="numa-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="text-cyan-300 dark:text-zinc-200" stopOpacity="0.8" style={CURRENT_COLOR_STOP} />
            <stop offset="100%" className="text-emerald-400 dark:text-zinc-700" stopOpacity="0.6" style={CURRENT_COLOR_STOP} />
          </linearGradient>

          <radialGradient id="numa-grad-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" className="text-teal-100 dark:text-zinc-700" stopOpacity="0.6" style={CURRENT_COLOR_STOP} />
            <stop offset="100%" className="text-slate-100 dark:text-zinc-950" stopOpacity="0.2" style={CURRENT_COLOR_STOP} />
          </radialGradient>

          <linearGradient id="numa-grad-3" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" className="text-blue-300 dark:text-zinc-300" stopOpacity="0.85" style={CURRENT_COLOR_STOP} />
            <stop offset="100%" className="text-teal-300 dark:text-zinc-700" stopOpacity="0.6" style={CURRENT_COLOR_STOP} />
          </linearGradient>

          <linearGradient id="numa-grad-4" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" className="text-emerald-200 dark:text-stone-300" stopOpacity="0.8" style={CURRENT_COLOR_STOP} />
            <stop offset="100%" className="text-cyan-100 dark:text-zinc-700" stopOpacity="0.5" style={CURRENT_COLOR_STOP} />
          </linearGradient>
        </defs>

        <m.rect
          width="100%"
          height="100%"
          fill="url(#numa-grad-2)"
          animate={
            shouldAnimate
              ? {
                scale: [1, 1.12, 1],
              }
              : undefined
          }
          transition={shouldAnimate ? loopTransition(20) : undefined}
          style={{ originX: "50%", originY: "50%" }}
        />

        <m.g
          animate={
            shouldAnimate
              ? {
                rotate: [0, 180, 360],
                scale: [1, 1.08, 0.92, 1],
              }
              : undefined
          }
          transition={shouldAnimate ? loopTransition(45) : undefined}
          style={{ originX: "50%", originY: "50%", transformBox: "fill-box" }}
        >
          <path fill="url(#numa-grad-1)" d="M -200,800 C 200,900 400,200 800,100 C 1200,0 1200,400 900,600 C 600,800 200,1200 -200,800 Z" />
        </m.g>

        <m.g
          animate={
            shouldAnimate
              ? {
                rotate: [360, 180, 0],
                x: [-90, 90, -90],
                y: [-70, 70, -70],
              }
              : undefined
          }
          transition={shouldAnimate ? loopTransition(35) : undefined}
          style={{ originX: "50%", originY: "50%", transformBox: "fill-box" }}
        >
          <path fill="url(#numa-grad-3)" d="M 1200,200 C 800,100 600,800 200,900 C -200,1000 -200,600 100,400 C 400,200 800,-200 1200,200 Z" />
        </m.g>

        <m.g
          animate={
            shouldAnimate
              ? {
                rotate: [0, -180, -360],
                scale: [1, 0.84, 1.14, 1],
              }
              : undefined
          }
          transition={shouldAnimate ? loopTransition(55) : undefined}
          style={{ originX: "50%", originY: "50%", transformBox: "fill-box" }}
        >
          <path fill="url(#numa-grad-4)" d="M 500,200 C 800,200 1000,500 1000,800 C 1000,1100 700,900 400,900 C 100,900 0,600 200,400 C 300,300 400,200 500,200 Z" />
        </m.g>
      </m.svg>

      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.035] pointer-events-none mix-blend-overlay"
        style={NOISE_TEXTURE_STYLE}
      />
    </div>
  )
}

export function AppleFluidBackground({ className, style }: { className?: string, style?: CSSProperties }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)} style={style}>
      <AppleFluidMesh className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background dark:from-black/0 dark:via-black/56 dark:to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_var(--tw-gradient-stops))] from-transparent via-background/50 to-background dark:via-black/74 dark:to-background" />
    </div>
  )
}

export function CinematicScrollCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 96%", "center center"]
  })

  // Scroll transforms
  const scrollRotateX = useTransform(scrollYProgress, [0, 1], [40, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [80, 0])

  // Interattività Hover (Tilt & Glare)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const isHoveredRaw = useMotionValue(0)
  const xSpring = useSpring(mouseX, EDITORIAL_EDGE_LIGHT_SPRING)
  const ySpring = useSpring(mouseY, EDITORIAL_EDGE_LIGHT_SPRING)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const yVal = (e.clientY - rect.top) / rect.height - 0.5
    isHoveredRaw.set(1)
    mouseX.set(x)
    mouseY.set(yVal)
  }

  const handleMouseLeave = () => {
    isHoveredRaw.set(0)
    mouseX.set(0)
    mouseY.set(0)
  }

  const hoverRevealSpring = useSpring(isHoveredRaw, EDITORIAL_EDGE_LIGHT_SPRING)
  const hoverRotateX = useTransform(ySpring, [-0.5, 0.5], [2.4, -2.4])
  const hoverRotateY = useTransform(xSpring, [-0.5, 0.5], [-2.4, 2.4])

  // Composizione sicura asse X: scroll + tilt algebrico
  const rotateX = useTransform(() => scrollRotateX.get() + hoverRotateX.get())
  const laserOpacity = useTransform(hoverRevealSpring, [0, 1], [0.26, 1])
  const laserHaloOpacity = useTransform(hoverRevealSpring, [0, 1], [0.16, 0.78])
  const edgeLiftOpacity = useTransform(hoverRevealSpring, [0, 1], [0, 1])
  const { laserBackground } = useEditorialEdgeLight({
    mouseX: xSpring,
    mouseY: ySpring,
    inputRange: [-0.5, 0.5],
    springConfig: EDITORIAL_EDGE_LIGHT_SPRING,
  })

  return (
    <m.div
      ref={ref}
      onMouseEnter={() => isHoveredRaw.set(1)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY: hoverRotateY,
        scale,
        opacity,
        y,
        transformStyle: "preserve-3d",
        transformPerspective: 1200,
      }}
      className={cn("motion-reduce:!transform-none motion-reduce:!opacity-100", className)}
    >
      <m.div
        className="pointer-events-none absolute inset-0 z-40 rounded-[inherit] opacity-0 shadow-[0_32px_90px_-48px_rgba(15,23,42,0.58)] motion-reduce:!opacity-0 dark:shadow-[0_36px_110px_-54px_rgba(45,212,191,0.36)]"
        style={{ opacity: edgeLiftOpacity }}
      />

      <m.div
        className="pointer-events-none absolute inset-[-3px] z-40 rounded-[inherit] blur-[10px] motion-reduce:!opacity-0"
        style={{
          background: laserBackground,
          opacity: laserHaloOpacity,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "5px"
        }}
      />

      <m.div
        className="pointer-events-none absolute inset-0 z-50 rounded-[inherit] motion-reduce:!opacity-0"
        style={{
          background: laserBackground,
          opacity: laserOpacity,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "2.5px"
        }}
      />

      {children}
    </m.div>
  )
}
