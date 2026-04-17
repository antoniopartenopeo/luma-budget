"use client"

import dynamic from "next/dynamic"
import { LandingImmersiveFallback } from "./landing-immersive-fallback"
import { LANDING_IMMERSIVE_FALLBACKS } from "../content"

export const LandingDifferentiatorCards = dynamic(
  () => import("./landing-differentiator-cards").then((module) => module.LandingDifferentiatorCards),
  {
    ssr: false,
    loading: () => (
      <LandingImmersiveFallback
        eyebrow={LANDING_IMMERSIVE_FALLBACKS.difference.eyebrow}
        title={LANDING_IMMERSIVE_FALLBACKS.difference.title}
        description={LANDING_IMMERSIVE_FALLBACKS.difference.description}
        heightClassName="h-[300svh]"
      />
    )
  }
)

export const LandingBrainHero = dynamic(
  () => import("./landing-brain-hero").then((module) => module.LandingBrainHero),
  {
    ssr: false,
    loading: () => (
      <LandingImmersiveFallback
        eyebrow={LANDING_IMMERSIVE_FALLBACKS.brain.eyebrow}
        title={LANDING_IMMERSIVE_FALLBACKS.brain.title}
        description={LANDING_IMMERSIVE_FALLBACKS.brain.description}
        heightClassName="h-[440svh]"
      />
    )
  }
)
