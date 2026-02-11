import { resolveBudgetGroupForTransaction } from "@/domain/transactions/utils"
import {
    BRAIN_FEATURE_NAMES,
    BrainCurrentMonthInferenceInput,
    BrainDataset,
    NeuralTrainingSample
} from "./types"

export interface BrainTransactionLike {
    amountCents: number
    type: "income" | "expense"
    timestamp: number
    categoryId: string
    isSuperfluous?: boolean
}

export interface BrainCategoryLike {
    id: string
    spendingNature: "essential" | "comfort" | "superfluous"
}

interface MonthlySignal {
    period: string
    incomeCents: number
    expensesCents: number
    superfluousCents: number
    comfortCents: number
    transactionCount: number
}

interface MonthlyAggregation {
    months: MonthlySignal[]
    transactionsByPeriod: Map<string, BrainTransactionLike[]>
    categoryNatureMap: Map<string, BrainCategoryLike["spendingNature"]>
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

function normalizeSigned(value: number): number {
    const normalized = clamp(value, -1, 1)
    return (normalized + 1) / 2
}

function toPeriod(timestamp: number): string {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    return `${year}-${month}`
}

function toDate(period: string): Date {
    const [year, month] = period.split("-").map(Number)
    return new Date(year, month - 1, 1)
}

function toPeriodFromDate(date: Date): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    return `${year}-${month}`
}

function hashString(value: string): string {
    let h = 2166136261
    for (let i = 0; i < value.length; i++) {
        h ^= value.charCodeAt(i)
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
    }
    return (h >>> 0).toString(16).padStart(8, "0")
}

function summarizeSignalForTransactions(
    period: string,
    transactions: BrainTransactionLike[],
    categoryNatureMap: Map<string, BrainCategoryLike["spendingNature"]>
): MonthlySignal {
    const summary: MonthlySignal = {
        period,
        incomeCents: 0,
        expensesCents: 0,
        superfluousCents: 0,
        comfortCents: 0,
        transactionCount: 0,
    }

    for (const transaction of transactions) {
        const amount = Math.abs(transaction.amountCents || 0)
        if (transaction.type === "income") {
            summary.incomeCents += amount
        } else {
            summary.expensesCents += amount

            const categoryNature = categoryNatureMap.get(transaction.categoryId)
            const budgetGroup = resolveBudgetGroupForTransaction(
                {
                    ...transaction,
                    id: "__brain__",
                    date: "",
                    description: "",
                    category: "",
                    classificationSource: "ruleBased",
                },
                categoryNature
            )

            if (budgetGroup === "superfluous") summary.superfluousCents += amount
            if (budgetGroup === "comfort") summary.comfortCents += amount
        }

        summary.transactionCount += 1
    }

    return summary
}

function aggregateMonthlySignals(
    transactions: BrainTransactionLike[],
    categories: BrainCategoryLike[],
): MonthlyAggregation {
    const categoryNatureMap = new Map(categories.map((category) => [category.id, category.spendingNature]))
    const byPeriod = new Map<string, MonthlySignal>()
    const transactionsByPeriod = new Map<string, BrainTransactionLike[]>()

    transactions.forEach((transaction) => {
        const period = toPeriod(transaction.timestamp)

        const periodTransactions = transactionsByPeriod.get(period) || []
        periodTransactions.push(transaction)
        transactionsByPeriod.set(period, periodTransactions)

        const current = byPeriod.get(period) || {
            period,
            incomeCents: 0,
            expensesCents: 0,
            superfluousCents: 0,
            comfortCents: 0,
            transactionCount: 0,
        }

        const amount = Math.abs(transaction.amountCents || 0)
        if (transaction.type === "income") {
            current.incomeCents += amount
        } else {
            current.expensesCents += amount

            const categoryNature = categoryNatureMap.get(transaction.categoryId)
            const budgetGroup = resolveBudgetGroupForTransaction(
                {
                    ...transaction,
                    id: "__brain__",
                    date: "",
                    description: "",
                    category: "",
                    classificationSource: "ruleBased",
                },
                categoryNature
            )

            if (budgetGroup === "superfluous") current.superfluousCents += amount
            if (budgetGroup === "comfort") current.comfortCents += amount
        }

        current.transactionCount += 1
        byPeriod.set(period, current)
    })

    for (const txs of transactionsByPeriod.values()) {
        txs.sort((a, b) => a.timestamp - b.timestamp)
    }

    const ordered = Array.from(byPeriod.values()).sort((a, b) => a.period.localeCompare(b.period))
    if (ordered.length <= 1) {
        return {
            months: ordered,
            transactionsByPeriod,
            categoryNatureMap,
        }
    }

    const expanded: MonthlySignal[] = []
    const first = toDate(ordered[0].period)
    const last = toDate(ordered[ordered.length - 1].period)
    const cursor = new Date(first.getFullYear(), first.getMonth(), 1)

    while (cursor <= last) {
        const period = toPeriodFromDate(cursor)
        const found = byPeriod.get(period)
        expanded.push(found || {
            period,
            incomeCents: 0,
            expensesCents: 0,
            superfluousCents: 0,
            comfortCents: 0,
            transactionCount: 0,
        })
        cursor.setMonth(cursor.getMonth() + 1)
    }

    return {
        months: expanded,
        transactionsByPeriod,
        categoryNatureMap,
    }
}

function buildFeatureValues(current: MonthlySignal, previous: MonthlySignal): number[] {
    const incomeSafe = Math.max(current.incomeCents, 1)
    const prevExpensesSafe = Math.max(previous.expensesCents, 1)

    const expenseIncomeRatio = clamp((current.expensesCents / incomeSafe) / 2, 0, 1)
    const superfluousShare = current.expensesCents > 0
        ? clamp(current.superfluousCents / current.expensesCents, 0, 1)
        : 0
    const comfortShare = current.expensesCents > 0
        ? clamp(current.comfortCents / current.expensesCents, 0, 1)
        : 0
    const txDensity = clamp(current.transactionCount / 120, 0, 1)
    const expenseMomentum = normalizeSigned((current.expensesCents - previous.expensesCents) / prevExpensesSafe)

    return [
        expenseIncomeRatio,
        superfluousShare,
        comfortShare,
        txDensity,
        expenseMomentum,
    ]
}

function computeFingerprint(months: MonthlySignal[]): string {
    const payload = months
        .map((month) => [
            month.period,
            month.incomeCents,
            month.expensesCents,
            month.superfluousCents,
            month.comfortCents,
            month.transactionCount,
        ].join(":"))
        .join("|")

    return `brain-v2-${hashString(payload)}`
}

export function computeNowcastBaseline(incomeCents: number, expensesCents: number): number {
    return Math.max(incomeCents, expensesCents, 1)
}

function resolveCheckpointIndexes(transactionCount: number): number[] {
    if (transactionCount <= 0) return []
    const checkpoints = new Set<number>()
    checkpoints.add(0)
    checkpoints.add(transactionCount - 1)

    const anchors = [0.16, 0.28, 0.4, 0.52, 0.64, 0.76, 0.88]
    for (const anchor of anchors) {
        const index = Math.floor((transactionCount - 1) * anchor)
        checkpoints.add(clamp(index, 0, transactionCount - 1))
    }

    return Array.from(checkpoints).sort((a, b) => a - b)
}

function buildCurrentMonthInferenceInput(
    period: string,
    values: number[],
    incomeCents: number,
    expensesCents: number
): BrainCurrentMonthInferenceInput {
    return {
        period,
        values,
        names: BRAIN_FEATURE_NAMES,
        currentIncomeCents: incomeCents,
        currentExpensesCents: expensesCents,
        nowcastBaselineCents: computeNowcastBaseline(incomeCents, expensesCents),
    }
}

function buildCurrentMonthNowcastSamples(
    months: MonthlySignal[],
    transactionsByPeriod: Map<string, BrainTransactionLike[]>,
    categoryNatureMap: Map<string, BrainCategoryLike["spendingNature"]>
): NeuralTrainingSample[] {
    const nowcastSamples: NeuralTrainingSample[] = []
    if (months.length < 2) return nowcastSamples

    // Exclude latest month from supervised nowcast training: treated as inference horizon.
    for (let i = 1; i < months.length - 1; i++) {
        const previousMonth = months[i - 1]
        const currentMonth = months[i]
        if (currentMonth.expensesCents <= 0) continue

        const monthTransactions = transactionsByPeriod.get(currentMonth.period) || []
        if (monthTransactions.length < 2) continue

        const checkpoints = resolveCheckpointIndexes(monthTransactions.length)
        for (const checkpointIndex of checkpoints) {
            const partialTransactions = monthTransactions.slice(0, checkpointIndex + 1)
            const partialSignal = summarizeSignalForTransactions(
                currentMonth.period,
                partialTransactions,
                categoryNatureMap
            )
            if (partialSignal.expensesCents <= 0) continue

            const remainingExpensesCents = Math.max(
                currentMonth.expensesCents - partialSignal.expensesCents,
                0
            )
            const baseline = computeNowcastBaseline(
                partialSignal.incomeCents,
                partialSignal.expensesCents
            )
            const y = clamp(remainingExpensesCents / baseline, 0, 2)

            nowcastSamples.push({
                period: `${currentMonth.period}@${checkpointIndex + 1}/${monthTransactions.length}`,
                x: buildFeatureValues(partialSignal, previousMonth),
                y,
            })
        }
    }

    return nowcastSamples
}

export function buildBrainDataset(
    transactions: BrainTransactionLike[],
    categories: BrainCategoryLike[],
    preferredPeriod?: string
): BrainDataset {
    const aggregation = aggregateMonthlySignals(transactions, categories)
    const months = aggregation.months
    const fingerprint = computeFingerprint(months)

    const samples: NeuralTrainingSample[] = []
    const nowcastSamples = buildCurrentMonthNowcastSamples(
        months,
        aggregation.transactionsByPeriod,
        aggregation.categoryNatureMap
    )

    if (months.length === 0) {
        return {
            samples,
            inferenceInput: null,
            nowcastSamples,
            currentMonthInferenceInput: null,
            fingerprint,
            months: months.length,
        }
    }

    const fallbackIndex = months.length - 1
    let selectedIndex = preferredPeriod
        ? months.findIndex((month) => month.period === preferredPeriod)
        : fallbackIndex

    if (selectedIndex < 0) selectedIndex = fallbackIndex
    if (selectedIndex <= 0 && months.length > 1) selectedIndex = fallbackIndex

    const current = months[selectedIndex]
    const previous = selectedIndex > 0
        ? months[selectedIndex - 1]
        : months[selectedIndex]
    const values = buildFeatureValues(current, previous)

    const inferenceInput = {
        period: current.period,
        values,
        names: BRAIN_FEATURE_NAMES,
        currentIncomeCents: current.incomeCents,
        currentExpensesCents: current.expensesCents,
    }
    const currentMonthInferenceInput = buildCurrentMonthInferenceInput(
        current.period,
        values,
        current.incomeCents,
        current.expensesCents
    )

    if (months.length >= 3) {
        for (let i = 1; i < months.length - 1; i++) {
            const previousMonth = months[i - 1]
            const currentMonth = months[i]
            const nextMonth = months[i + 1]

            const x = buildFeatureValues(currentMonth, previousMonth)
            const nextIncomeSafe = Math.max(nextMonth.incomeCents || currentMonth.incomeCents, 1)
            const y = clamp(nextMonth.expensesCents / nextIncomeSafe, 0, 2)

            samples.push({
                period: currentMonth.period,
                x,
                y,
            })
        }
    } else if (months.length === 2) {
        const previousMonth = months[0]
        const currentMonth = months[1]
        const x = buildFeatureValues(currentMonth, previousMonth)
        const incomeSafe = Math.max(currentMonth.incomeCents || previousMonth.incomeCents, 1)
        const y = clamp(currentMonth.expensesCents / incomeSafe, 0, 2)

        samples.push({
            period: currentMonth.period,
            x,
            y,
        })
    } else {
        const onlyMonth = months[0]
        const x = buildFeatureValues(onlyMonth, onlyMonth)
        const incomeSafe = Math.max(onlyMonth.incomeCents, 1)
        const y = clamp(onlyMonth.expensesCents / incomeSafe, 0, 2)

        // Bootstrap minimale ma reale: usa esclusivamente il mese corrente.
        samples.push({
            period: onlyMonth.period,
            x,
            y,
        })
    }

    return {
        samples,
        inferenceInput,
        nowcastSamples,
        currentMonthInferenceInput,
        fingerprint,
        months: months.length,
    }
}
