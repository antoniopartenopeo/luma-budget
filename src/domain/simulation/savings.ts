export interface CategoryAverage {
    categoryId: string
    averageAmount: number // in cents, integer
    totalInPeriod: number
    monthCount: number
}

export interface SimulationResult {
    baselineTotal: number
    simulatedTotal: number
    savingsAmount: number
    savingsPercent: number
    categoryResults: Record<string, {
        baseline: number
        simulated: number
        saving: number
        percent: number
    }>
}

export interface SavingsByNature {
    superfluous: number
    comfort: number
}

export interface SpendNatureCategory {
    id: string
    spendingNature: string
}

function clampPercent(value: number): number {
    return Math.min(100, Math.max(0, value || 0))
}

/**
 * Builds a categoryId -> reduction % map from semantic spending natures.
 * Essential or unknown natures are intentionally fixed to 0.
 */
export function buildNatureApplicationMap(
    categories: ReadonlyArray<SpendNatureCategory>,
    savings: SavingsByNature
): Record<string, number> {
    const superfluous = clampPercent(savings.superfluous)
    const comfort = clampPercent(savings.comfort)
    const applicationMap: Record<string, number> = {}

    categories.forEach(cat => {
        if (cat.spendingNature === "superfluous") {
            applicationMap[cat.id] = superfluous
        } else if (cat.spendingNature === "comfort") {
            applicationMap[cat.id] = comfort
        } else {
            applicationMap[cat.id] = 0
        }
    })

    return applicationMap
}

/**
 * Applies savings percentages to baseline category averages.
 * Runs entirely on integer cents.
 */
export function applySavings(
    averages: Record<string, CategoryAverage>,
    applicationMap: Record<string, number> // categoryId -> reduction percent (0-100)
): SimulationResult {
    const categoryResults: SimulationResult["categoryResults"] = {}
    let baselineTotal = 0
    let simulatedTotal = 0

    Object.values(averages).forEach(avg => {
        const percent = clampPercent(applicationMap[avg.categoryId])
        const baseline = avg.averageAmount

        // Simulated = baseline * (1 - pct/100), rounded to integer cents.
        const simulated = Math.round(baseline * (1 - percent / 100))
        const saving = baseline - simulated

        categoryResults[avg.categoryId] = {
            baseline,
            simulated,
            saving,
            percent,
        }

        baselineTotal += baseline
        simulatedTotal += simulated
    })

    return {
        baselineTotal,
        simulatedTotal,
        savingsAmount: baselineTotal - simulatedTotal,
        savingsPercent: baselineTotal > 0
            ? Math.round(((baselineTotal - simulatedTotal) / baselineTotal) * 100)
            : 0,
        categoryResults,
    }
}
