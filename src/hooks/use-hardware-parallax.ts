import { useMotionValue, useSpring, useTransform } from "framer-motion"
import { useDeviceHardware } from "./use-device-hardware"

interface HardwareParallaxConfig {
  /** Inclinazione massima in gradi (default: 5) */
  tiltMax?: number
  /** Damping per l'animazione a molla (default: 25) */
  springDamping?: number
  /** Stiffness per l'animazione a molla (default: 200) */
  springStiffness?: number
}

export function useHardwareParallax(config?: HardwareParallaxConfig) {
  const { tiltMax = 5, springDamping = 25, springStiffness = 200 } = config || {}
  const { safeToAnimate3D } = useDeviceHardware()
  
  const effectiveTiltMax = safeToAnimate3D ? tiltMax : 0

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: springDamping, stiffness: springStiffness, mass: 0.5 }

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [effectiveTiltMax, -effectiveTiltMax]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-effectiveTiltMax, effectiveTiltMax]), springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>, rect: DOMRect) => {
    if (!safeToAnimate3D) return
    requestAnimationFrame(() => {
      const width = rect.width
      const height = rect.height
      const clientX = e.clientX - rect.left
      const clientY = e.clientY - rect.top
      const xPct = clientX / width - 0.5
      const yPct = clientY / height - 0.5
      mouseX.set(xPct)
      mouseY.set(yPct)
    })
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return {
    mouseX,
    mouseY,
    rotateX,
    rotateY,
    handleMouseMove,
    handleMouseLeave
  }
}
