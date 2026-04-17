"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { LazyMotion, domAnimation } from "framer-motion"

interface LandingClientWrapperProps {
  children: ReactNode
}

export function LandingClientWrapper({ children }: LandingClientWrapperProps) {
  useEffect(() => {
    const scrollingElement = document.scrollingElement as HTMLElement | null

    if (!scrollingElement) {
      return
    }

    const previousPosition = scrollingElement.style.position

    if (window.getComputedStyle(scrollingElement).position === "static") {
      scrollingElement.style.position = "relative"
    }

    return () => {
      scrollingElement.style.position = previousPosition
    }
  }, [])

  return (
    <LazyMotion features={domAnimation}>
      {children}
    </LazyMotion>
  )
}
