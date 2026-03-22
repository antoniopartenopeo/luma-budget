"use client"

import { motion, Variants } from "framer-motion"

interface CinematicTextRevealProps {
  text: string
  className?: string
  delay?: number
}

export function CinematicTextReveal({ text, className, delay = 0 }: CinematicTextRevealProps) {
  // Split into words for staggered reveal
  const words = text.split(" ")

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
      className={className}
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.25em" }}
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={child} style={{ display: "inline-block" }}>
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}
