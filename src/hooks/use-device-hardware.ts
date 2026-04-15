import { useEffect, useState } from "react"

function getReducedMotionPreference() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function shouldEnableLowPowerMode(isReducedMotion: boolean) {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return isReducedMotion
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
  return isIOS || isReducedMotion
}

export function useDeviceHardware() {
  const [isReducedMotion, setIsReducedMotion] = useState(getReducedMotionPreference)
  const [isLowPowerMode, setIsLowPowerMode] = useState(() =>
    shouldEnableLowPowerMode(getReducedMotionPreference())
  )

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches)
      setIsLowPowerMode(shouldEnableLowPowerMode(e.matches))
    }

    motionQuery.addEventListener("change", handleMotionChange)

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange)
    }
  }, [])

  return {
    isReducedMotion,
    isLowPowerMode,
    // safeToAnimate3D = false = degrada animazioni su flat 2D e spegne calcoli requestAnimationFrame costosi
    safeToAnimate3D: !isLowPowerMode && !isReducedMotion
  }
}
