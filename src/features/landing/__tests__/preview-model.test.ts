import { describe, expect, it } from "vitest"
import {
  buildLandingHeroPreview,
  formatLandingWholeCurrency,
  LANDING_HERO_PREVIEW,
} from "../preview-model"

describe("landing hero preview model", () => {
  it("derives the visible hero margin from the curated demo cents", () => {
    expect(LANDING_HERO_PREVIEW.marginCents).toBe(124500)
    expect(LANDING_HERO_PREVIEW.marginAmount.prefix).toBe("€")
    expect(LANDING_HERO_PREVIEW.marginAmount.value).toBe("1.245")
    expect(LANDING_HERO_PREVIEW.formula).toBe("Entrate - uscite stimate = quanto resta")
    expect(LANDING_HERO_PREVIEW.metrics.map((metric) => metric.label)).toEqual([
      "Entrate",
      "Spese",
      "Margine",
    ])
    expect(LANDING_HERO_PREVIEW.metrics.map((metric) => metric.value)).toEqual([
      "+ € 2.300",
      "- € 1.055",
      "+ € 1.245",
    ])
  })

  it("keeps percentages bounded for empty or incomplete data", () => {
    const preview = buildLandingHeroPreview({
      incomeCents: 0,
      estimatedExpensesCents: null,
    })

    expect(preview.status).toBe("incomplete")
    expect(preview.marginCents).toBeNull()
    expect(preview.metrics.every((metric) => metric.widthPct >= 0 && metric.widthPct <= 100)).toBe(true)
    expect(preview.metrics[0].value).toBe("da completare")
  })

  it("marks negative margin as warning without losing signed display", () => {
    const preview = buildLandingHeroPreview({
      incomeCents: 100000,
      estimatedExpensesCents: 125000,
    })

    expect(preview.status).toBe("warning")
    expect(preview.marginCents).toBe(-25000)
    expect(preview.marginAmount.prefix).toBe("- €")
    expect(preview.marginAmount.value).toBe("250")
    expect(preview.metrics.every((metric) => metric.widthPct >= 0 && metric.widthPct <= 100)).toBe(true)
  })

  it("rounds display amounts using integer cents", () => {
    expect(formatLandingWholeCurrency(124550)).toMatchObject({
      prefix: "€",
      value: "1.246",
    })
  })
})
