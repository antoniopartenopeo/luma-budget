import { useState, useEffect } from "react"

export function useDeviceHardware() {
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [isLowPowerMode, setIsLowPowerMode] = useState(false)

  useEffect(() => {
    // 1. Controlla preferenza utente (Riduci movimento)
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReducedMotion(motionQuery.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches)
    }

    motionQuery.addEventListener("change", handleMotionChange)

    // 2. Euristica base: se Safari Mobile, le animazioni complesse Z-depth 
    // assieme ai blur falliscono spesso o causano overheat.
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    
    // Per un layer aggiuntivo, potremmo stimare il framerate, ma per ora il
    // ridotto movimento e l'OS throttling è sufficiente come fallback.
    // Attiveremo fallback pesante su iOS nativi.
    if (isIOS || isReducedMotion) {
      setIsLowPowerMode(true)
    }

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
