"use client"

import { motion, Variants, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

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
