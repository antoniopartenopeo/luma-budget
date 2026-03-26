"use client"

import type { CSSProperties } from "react"
import { motion, useReducedMotion } from "framer-motion"
import type { Variants } from "framer-motion"
import { cn } from "@/lib/utils"

const CURRENT_COLOR_STOP = { stopColor: "currentColor" }
const NOISE_TEXTURE_STYLE: CSSProperties = {
  backgroundImage:
    "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"noiseFilter\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23noiseFilter)\"/></svg>')",
}

interface CinematicTextRevealProps {
  text: string
  className?: string
  delay?: number
}

export function CinematicTextReveal({ text, className, delay = 0 }: CinematicTextRevealProps) {
  const prefersReducedMotion = useReducedMotion()
  const words = text.split(" ")

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  }

  const child: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }

  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      className={cn("flex flex-wrap justify-center gap-[0.25em]", className)}
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={child} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

export function AppleFluidMesh({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden pointer-events-none transition-opacity duration-1000", className)}>
      <svg
        className="absolute h-[150%] w-[150%] -top-[25%] -left-[25%] opacity-90 dark:opacity-70"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="numa-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="text-cyan-300 dark:text-cyan-500" stopOpacity="0.8" style={CURRENT_COLOR_STOP} />
            <stop offset="100%" className="text-emerald-400 dark:text-emerald-900" stopOpacity="0.4" style={CURRENT_COLOR_STOP} />
          </linearGradient>

          <radialGradient id="numa-grad-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" className="text-teal-100 dark:text-slate-800" stopOpacity="0.6" style={CURRENT_COLOR_STOP} />
            <stop offset="100%" className="text-slate-100 dark:text-slate-950" stopOpacity="0.1" style={CURRENT_COLOR_STOP} />
          </radialGradient>

          <linearGradient id="numa-grad-3" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" className="text-blue-300 dark:text-indigo-500" stopOpacity="0.85" style={CURRENT_COLOR_STOP} />
            <stop offset="100%" className="text-teal-300 dark:text-teal-800" stopOpacity="0.4" style={CURRENT_COLOR_STOP} />
          </linearGradient>

          <linearGradient id="numa-grad-4" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" className="text-emerald-200 dark:text-emerald-400" stopOpacity="0.8" style={CURRENT_COLOR_STOP} />
            <stop offset="100%" className="text-cyan-100 dark:text-cyan-900" stopOpacity="0.3" style={CURRENT_COLOR_STOP} />
          </linearGradient>
          
          <linearGradient id="stroke-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="50%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#numa-grad-2)">
           <animateTransform attributeName="transform" type="scale" values="1; 1.2; 1" dur="20s" repeatCount="indefinite" />
        </rect>

        <g stroke="url(#stroke-grad)" strokeWidth="2">
          <path fill="url(#numa-grad-1)" d="M -200,800 C 200,900 400,200 800,100 C 1200,0 1200,400 900,600 C 600,800 200,1200 -200,800 Z">
            <animateTransform attributeName="transform" type="rotate" from="0 500 500" to="360 500 500" dur="45s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="scale" values="1; 1.1; 0.9; 1" dur="25s" repeatCount="indefinite" additive="sum" />
          </path>
          
          <path fill="url(#numa-grad-3)" d="M 1200,200 C 800,100 600,800 200,900 C -200,1000 -200,600 100,400 C 400,200 800,-200 1200,200 Z">
            <animateTransform attributeName="transform" type="rotate" from="360 500 500" to="0 500 500" dur="35s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="translate" values="-100 -100; 100 100; -100 -100" dur="20s" repeatCount="indefinite" additive="sum" />
          </path>

          <path fill="url(#numa-grad-4)" d="M 500,200 C 800,200 1000,500 1000,800 C 1000,1100 700,900 400,900 C 100,900 0,600 200,400 C 300,300 400,200 500,200 Z">
            <animateTransform attributeName="transform" type="rotate" from="0 500 500" to="-360 500 500" dur="55s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="scale" values="1; 0.8; 1.2; 1" dur="30s" repeatCount="indefinite" additive="sum" />
          </path>
        </g>
      </svg>
      
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none mix-blend-overlay" 
        style={NOISE_TEXTURE_STYLE} 
      />
    </div>
  )
}

export function AppleFluidBackground({ className, style }: { className?: string, style?: CSSProperties }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)} style={style}>
      <AppleFluidMesh className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background dark:from-background/20 dark:via-background/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_var(--tw-gradient-stops))] from-transparent via-background/60 to-background" />
    </div>
  )
}
