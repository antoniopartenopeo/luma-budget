import { calculateUtilizationPct, formatCents } from "@/domain/money"

type LandingPreviewStatus = "healthy" | "warning" | "incomplete"

const WHOLE_EURO_FORMATTER = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 0,
  useGrouping: true,
})

interface LandingHeroPreviewInput {
  incomeCents?: number | null
  estimatedExpensesCents?: number | null
  scenarioExpenseCents?: number | null
}

interface LandingPreviewAmount {
  prefix: string
  value: string
  accessibleLabel: string
}

interface LandingPreviewMetric {
  label: string
  value: string
  tone: "income" | "expense" | "scenario"
  widthPct: number
}

export interface LandingHeroPreview {
  status: LandingPreviewStatus
  isComplete: boolean
  marginCents: number | null
  scenarioRemainingCents: number | null
  marginAmount: LandingPreviewAmount
  formula: string
  metrics: readonly LandingPreviewMetric[]
}

export const LANDING_HERO_PREVIEW_INPUT = {
  incomeCents: 230000,
  estimatedExpensesCents: 105500,
  scenarioExpenseCents: 4200,
} as const satisfies Required<LandingHeroPreviewInput>

function normalizeCents(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  return Math.trunc(value)
}

function normalizeMagnitudeCents(value: number | null | undefined) {
  const cents = normalizeCents(value)
  return cents === null ? null : Math.abs(cents)
}

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

export function formatLandingWholeCurrency(cents: number): LandingPreviewAmount {
  const signPrefix = cents < 0 ? "- €" : "€"
  const absCents = Math.abs(cents)
  const roundedWholeUnits = Math.trunc((absCents + 50) / 100)

  return {
    prefix: signPrefix,
    value: WHOLE_EURO_FORMATTER.format(roundedWholeUnits),
    accessibleLabel: formatCents(cents),
  }
}

function formatLandingSignedWholeCurrency(cents: number) {
  const sign = cents < 0 ? "- €" : "+ €"
  const absCents = Math.abs(cents)
  const roundedWholeUnits = Math.trunc((absCents + 50) / 100)

  return `${sign} ${WHOLE_EURO_FORMATTER.format(roundedWholeUnits)}`
}

export function buildLandingHeroPreview(
  input: LandingHeroPreviewInput = LANDING_HERO_PREVIEW_INPUT
): LandingHeroPreview {
  const incomeCents = normalizeMagnitudeCents(input.incomeCents)
  const estimatedExpensesCents = normalizeMagnitudeCents(input.estimatedExpensesCents)
  const scenarioExpenseCents = normalizeMagnitudeCents(input.scenarioExpenseCents) ?? 0
  const isComplete = incomeCents !== null && estimatedExpensesCents !== null && incomeCents > 0
  const marginCents = isComplete ? incomeCents - estimatedExpensesCents : null
  const scenarioRemainingCents = marginCents === null ? null : marginCents - scenarioExpenseCents
  const safeIncomeCents = incomeCents ?? 0
  const safeEstimatedExpensesCents = estimatedExpensesCents ?? 0
  const safeMarginCents = Math.max(0, marginCents ?? 0)

  const expenseWidthPct =
    safeIncomeCents > 0
      ? clampPercentage(calculateUtilizationPct(safeEstimatedExpensesCents, safeIncomeCents))
      : 0
  const marginWidthPct =
    safeIncomeCents > 0
      ? clampPercentage(calculateUtilizationPct(safeMarginCents, safeIncomeCents))
      : 0

  return {
    status: !isComplete ? "incomplete" : marginCents !== null && marginCents < 0 ? "warning" : "healthy",
    isComplete,
    marginCents,
    scenarioRemainingCents,
    marginAmount: formatLandingWholeCurrency(marginCents ?? 0),
    formula: "Entrate - spese previste = quanto ti resta",
    metrics: [
      {
        label: "Entrate",
        value: isComplete ? formatLandingSignedWholeCurrency(safeIncomeCents) : "da completare",
        tone: "income",
        widthPct: safeIncomeCents > 0 ? 100 : 0,
      },
      {
        label: "Spese",
        value:
          estimatedExpensesCents !== null
            ? formatLandingSignedWholeCurrency(-safeEstimatedExpensesCents)
            : "da completare",
        tone: "expense",
        widthPct: expenseWidthPct,
      },
      {
        label: "Prova",
        value: formatLandingSignedWholeCurrency(-scenarioExpenseCents),
        tone: "scenario",
        widthPct: marginWidthPct,
      },
    ],
  }
}

export const LANDING_HERO_PREVIEW = buildLandingHeroPreview()
