/**
 * Holt-Winters Additive Exponential Smoothing Forecaster.
 *
 * Produces expense amount forecasts in centesimi using:
 * - Level (baseline spending)
 * - Trend (monthly change direction)
 * - Seasonal component (12-month cycle, additive)
 *
 * Falls back to Double Exponential Smoothing (trend-only) when
 * fewer than 2 full seasonal cycles (24 data points) are available,
 * and to simple level smoothing with fewer than 3 points.
 */

export interface HoltWintersDataPoint {
    period: string
    valueCents: number
}

export interface HoltWintersResult {
    /** Forecasted value for the next period, in centesimi */
    forecastCents: number
    /** Current trend component: positive = spending growing */
    trendCents: number
    /** Seasonal adjustment for the forecasted month, in centesimi */
    seasonalAdjustmentCents: number
    /** Current smoothed level (baseline), in centesimi */
    levelCents: number
    /** Simple confidence interval half-width based on fitting residuals */
    confidenceIntervalCents: number
    /** Number of data points used */
    dataPoints: number
    /** Which method was actually used */
    method: "triple" | "double" | "single"
}

// ── Smoothing parameters (conservative defaults for personal finance) ───

const ALPHA = 0.35   // level smoothing – moderate reactivity
const BETA = 0.15   // trend smoothing – slow, avoids overreacting to one-off spikes
const GAMMA = 0.25   // seasonal smoothing – moderate, captures holiday patterns
const SEASON_LENGTH = 12

/**
 * Forecast the next period's expense amount using Holt-Winters.
 * Requires at least 3 data points. Returns null if insufficient data.
 * Input must be sorted chronologically (oldest first).
 */
export function forecastHoltWinters(
    series: HoltWintersDataPoint[]
): HoltWintersResult | null {
    if (series.length < 3) return null

    const values = series.map((d) => d.valueCents)

    // ── Triple Exponential Smoothing (trend + seasonality) ──────────
    if (values.length >= SEASON_LENGTH * 2) {
        return fitTriple(values)
    }

    // ── Double Exponential Smoothing (trend only) ───────────────────
    if (values.length >= 3) {
        return fitDouble(values)
    }

    return null
}

// ────────────────────────────────────────────────────────────────────────

function fitTriple(values: number[]): HoltWintersResult {
    const n = values.length
    const m = SEASON_LENGTH

    // Initialize level: average of first season
    let level = 0
    for (let i = 0; i < m; i++) level += values[i]
    level /= m

    // Initialize trend: average difference between first two seasons
    let trend = 0
    for (let i = 0; i < m; i++) {
        trend += (values[m + i] - values[i]) / m
    }
    trend /= m

    // Initialize seasonal indices: deviation from level in first season
    const seasonal = new Array<number>(n + 1)
    for (let i = 0; i < m; i++) {
        seasonal[i] = values[i] - level
    }

    // Smooth
    const residuals: number[] = []
    for (let t = m; t < n; t++) {
        const prevSeasonal = seasonal[t - m]
        const observation = values[t]

        const newLevel = ALPHA * (observation - prevSeasonal) + (1 - ALPHA) * (level + trend)
        const newTrend = BETA * (newLevel - level) + (1 - BETA) * trend
        seasonal[t] = GAMMA * (observation - newLevel) + (1 - GAMMA) * prevSeasonal

        // One-step-ahead forecast error for confidence interval
        const fitted = level + trend + prevSeasonal
        residuals.push(Math.abs(observation - fitted))

        level = newLevel
        trend = newTrend
    }

    // Forecast: next period seasonal index
    const forecastSeasonalIdx = n - m  // wraps back to same month last year
    const seasonalAdj = seasonal[forecastSeasonalIdx] ?? 0
    const forecastCents = Math.max(0, Math.round(level + trend + seasonalAdj))
    const confidenceIntervalCents = computeConfidenceInterval(residuals)

    return {
        forecastCents,
        trendCents: Math.round(trend),
        seasonalAdjustmentCents: Math.round(seasonalAdj),
        levelCents: Math.round(level),
        confidenceIntervalCents,
        dataPoints: n,
        method: "triple",
    }
}

function fitDouble(values: number[]): HoltWintersResult {
    const n = values.length

    // Initialize
    let level = values[0]
    let trend = values[1] - values[0]

    const residuals: number[] = []

    for (let t = 1; t < n; t++) {
        const observation = values[t]

        const newLevel = ALPHA * observation + (1 - ALPHA) * (level + trend)
        const newTrend = BETA * (newLevel - level) + (1 - BETA) * trend

        // One-step-ahead residual
        const fitted = level + trend
        residuals.push(Math.abs(observation - fitted))

        level = newLevel
        trend = newTrend
    }

    const forecastCents = Math.max(0, Math.round(level + trend))
    const confidenceIntervalCents = computeConfidenceInterval(residuals)

    return {
        forecastCents,
        trendCents: Math.round(trend),
        seasonalAdjustmentCents: 0,
        levelCents: Math.round(level),
        confidenceIntervalCents,
        dataPoints: n,
        method: "double",
    }
}

function computeConfidenceInterval(residuals: number[]): number {
    if (residuals.length === 0) return 0
    const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length
    // ~1.96 * MAE as a simple 95% CI proxy (works well for roughly normal residuals)
    return Math.round(mean * 1.96)
}
