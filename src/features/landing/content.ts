import type { LucideIcon } from "lucide-react"
import {
  ArrowDownUp,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Circle
} from "lucide-react"

// Importazione diretta e raw dal payload JSON
import landingDataRaw from "./data/landing.json"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface LandingSectionCopy {
  eyebrow: string
  title: string
  description: string
}

export interface LandingProblemContent extends LandingSectionCopy {
  statement: string
}

export interface LandingDifferentItem {
  icon: LucideIcon
  title: string
  kicker: string
  note: string
}

export interface LandingFlowStep {
  icon: LucideIcon
  cue: string
  stepLabel: string
  title: string
  description: string
}

export interface LandingOutcome {
  icon: LucideIcon
  title: string
  description: string
}

export interface LandingHeroEditorialContent {
  srTitle: string
  headline: string
  supportingCopy: string
  primaryCtaLabel: string
  primaryCtaHref: string
  trustItems: readonly string[]
}

export interface LandingBrainAct {
  kicker: string
  titleLines: readonly string[]
  description: string
}

export interface LandingBrainContent {
  sectionTitle: string
  acts: readonly [LandingBrainAct, LandingBrainAct, LandingBrainAct]
}

export interface LandingClosingContent {
  eyebrow: string
  railLabel: string
  title: string
  description: string
  primaryCtaLabel: string
}

export interface LandingNavItem {
  href: string
  label: string
}

export interface LandingFooterLink {
  label: string
  href: string
}

export interface LandingFooterContent {
  description: string
  productHeading: string
  productItems: readonly string[]
  supportHeading: string
  supportItems: readonly LandingFooterLink[]
}

const FALLBACK_BRAIN_ACT: LandingBrainAct = {
  kicker: "",
  titleLines: [],
  description: ""
}

// ============================================================================
// ICON RESOLVER (Tree-Shaking Safe)
// ============================================================================

const ICON_REGISTRY: Record<string, LucideIcon> = {
  ArrowDownUp,
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  WalletCards
}

function resolveIcon(iconName: string): LucideIcon {
  return ICON_REGISTRY[iconName] || Circle
}

// ============================================================================
// EXPORTS & PARSERS
// ============================================================================

export const LANDING_HERO_EDITORIAL = landingDataRaw.HERO_EDITORIAL as LandingHeroEditorialContent
export const LANDING_NAV_ITEMS = landingDataRaw.NAV_ITEMS as readonly LandingNavItem[]
export const LANDING_PROBLEM_SECTION = landingDataRaw.PROBLEM_SECTION as LandingProblemContent

export const LANDING_HOW_IT_WORKS_SECTION = landingDataRaw.HOW_IT_WORKS_SECTION as LandingSectionCopy
export const LANDING_OUTCOMES_SECTION = landingDataRaw.OUTCOMES_SECTION as LandingSectionCopy
export const LANDING_CLOSING = landingDataRaw.CLOSING as LandingClosingContent
export const LANDING_FOOTER = landingDataRaw.FOOTER as LandingFooterContent
export const LANDING_IMMERSIVE_FALLBACKS = landingDataRaw.IMMERSIVE_FALLBACKS
const [brainActOne, brainActTwo, brainActThree] = landingDataRaw.BRAIN_CONTENT.acts
export const LANDING_BRAIN_CONTENT: LandingBrainContent = {
  sectionTitle: landingDataRaw.BRAIN_CONTENT.sectionTitle,
  acts: [
    brainActOne ?? FALLBACK_BRAIN_ACT,
    brainActTwo ?? FALLBACK_BRAIN_ACT,
    brainActThree ?? FALLBACK_BRAIN_ACT
  ]
}
export const LANDING_DIFFERENTIATORS: LandingDifferentItem[] = landingDataRaw.DIFFERENTIATORS.map((item) => ({
  ...item,
  icon: resolveIcon(item.icon)
}))

export const LANDING_FLOW_STEPS: LandingFlowStep[] = landingDataRaw.FLOW_STEPS.map((step) => ({
  ...step,
  icon: resolveIcon(step.icon)
}))

export const LANDING_OUTCOMES: LandingOutcome[] = landingDataRaw.OUTCOMES.map((outcome) => ({
  ...outcome,
  icon: resolveIcon(outcome.icon)
}))
