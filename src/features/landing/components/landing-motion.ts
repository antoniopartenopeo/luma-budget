export const LANDING_MOTION_EASE = [0.22, 1, 0.36, 1] as const

export const LANDING_MOTION_TIMINGS = {
  instant: { duration: 0 },
  fast: { duration: 0.34, ease: LANDING_MOTION_EASE },
  medium: { duration: 0.45, ease: LANDING_MOTION_EASE },
  slow: { duration: 0.55, ease: LANDING_MOTION_EASE }
} as const

export const LANDING_NO_BLUR = "blur(0px)"
export const LANDING_BLUR = "blur(12px)"
export const LANDING_BLUR_TRANSITION = [LANDING_BLUR, LANDING_NO_BLUR, LANDING_NO_BLUR, LANDING_BLUR]
export const LANDING_NO_BLUR_TRANSITION = [
  LANDING_NO_BLUR,
  LANDING_NO_BLUR,
  LANDING_NO_BLUR,
  LANDING_NO_BLUR
]
export const LANDING_BLUR_REVEAL = [LANDING_BLUR, LANDING_NO_BLUR]
export const LANDING_NO_BLUR_REVEAL = [LANDING_NO_BLUR, LANDING_NO_BLUR]

export const LANDING_BRAIN_RANGES = {
  fluidExpansion: [0, 0.4, 0.8],
  act1: [0, 0.05, 0.22, 0.28],
  act2: [0.32, 0.38, 0.55, 0.62],
  act3: [0.68, 0.78, 0.95, 1],
  act3Y: [0.68, 0.78]
}
