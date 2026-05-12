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

export interface LandingComparisonQaSection extends LandingSectionCopy {
  summaryTitle: string
  summary: string
}

export interface LandingHeroEditorialContent {
  srTitle: string
  headline: string
  headlineHighlight?: string
  supportingCopy: string
  primaryCtaLabel: string
  primaryCtaHref: string
  trustItems: readonly string[]
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
export const LANDING_COMPARISON_QA_SECTION =
  landingDataRaw.COMPARISON_QA_SECTION as LandingComparisonQaSection
export const LANDING_CLOSING = landingDataRaw.CLOSING as LandingClosingContent
export const LANDING_FOOTER = landingDataRaw.FOOTER as LandingFooterContent
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
