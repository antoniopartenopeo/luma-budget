"use client"

import type { CSSProperties, ReactNode } from "react"
import { useRef } from "react"
import { m, useReducedMotion, useScroll, useTransform, useInView, useMotionValue, useSpring, useMotionTemplate } from "framer-motion"
import { useDeviceHardware } from "@/hooks/use-device-hardware"
import { cn } from "@/lib/utils"

const CURRENT_COLOR_STOP = { stopColor: "currentColor" }
const NOISE_TEXTURE_STYLE: CSSProperties = {
  backgroundImage:
    "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"noiseFilter\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23noiseFilter)\"/></svg>')",
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
  const prefersReducedMotion = useReducedMotion()
  
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const yVal = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    mouseX.set(x)
    mouseY.set(yVal)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const springConfig = { damping: 20, stiffness: 150 }
  const hoverRotateX = useSpring(useTransform(mouseY, [-1, 1], [6, -6]), springConfig)
  const hoverRotateY = useSpring(useTransform(mouseX, [-1, 1], [-6, 6]), springConfig)
  
  // Composizione sicura asse X: scroll + tilt algebrico
  const rotateX = useTransform(() => scrollRotateX.get() + hoverRotateX.get())

  const glareX = useSpring(useTransform(mouseX, [-1, 1], [-20, 120]), springConfig)
  const glareY = useSpring(useTransform(mouseY, [-1, 1], [-20, 120]), springConfig)
  
  const glareBackground = useMotionTemplate`radial-gradient(450px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 50%, transparent 100%)`
  const laserBackground = useMotionTemplate`radial-gradient(1000px circle at ${glareX}% ${glareY}%, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 20%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.1) 80%, transparent 100%)`
  const fogMask = useMotionTemplate`radial-gradient(400px circle at ${glareX}% ${glareY}%, black 0%, rgba(0,0,0,0.6) 30%, transparent 80%)`

  if (prefersReducedMotion) {
    return (
      <m.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4 }}
        className={className}
      >
        {children}
      </m.div>
    )
  }

  return (
    <m.div
      ref={ref}
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
        cursor: "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='32'%20height='32'%20viewBox='0%200%2032%2032'%3E%3Cdefs%3E%3CradialGradient%20id='glow'%20cx='50%25'%20cy='50%25'%20r='50%25'%3E%3Cstop%20offset='0%25'%20stop-color='white'%20stop-opacity='1'/%3E%3Cstop%20offset='10%25'%20stop-color='white'%20stop-opacity='0.8'/%3E%3Cstop%20offset='30%25'%20stop-color='white'%20stop-opacity='0.3'/%3E%3Cstop%20offset='60%25'%20stop-color='white'%20stop-opacity='0.05'/%3E%3Cstop%20offset='100%25'%20stop-color='white'%20stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle%20cx='16'%20cy='16'%20r='16'%20fill='url(%23glow)'/%3E%3C/svg%3E\") 16 16, crosshair"
      }}
      className={className}
    >
      {/* 1. Internal Surface Glare (Tight Spotlight) */}
      <m.div
        className="pointer-events-none absolute inset-0 z-50 transition-opacity duration-300 opacity-0 mix-blend-overlay group-hover:opacity-100"
        style={{ background: glareBackground }}
      />
      
      {/* 2. Magical Border Laser Tracking (Ultra Premium) */}
      <m.div
        className="pointer-events-none absolute inset-0 z-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: laserBackground,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "2.5px"
        }}
      />
      <div className="absolute inset-0 z-50 pointer-events-none rounded-[inherit]" style={{ borderRadius: "inherit" }} />

      {/* 3. Volumetric Fog & Dust Particles */}
      <m.div
        className="pointer-events-none absolute inset-0 z-40 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.25] mix-blend-color-dodge"
        style={{
          ...NOISE_TEXTURE_STYLE,
          mask: fogMask,
          WebkitMask: fogMask
        }}
      />

      {children}
    </m.div>
  )
}
