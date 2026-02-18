import { extractMerchantKey } from "@/features/import-csv/core/merchant/pipeline"

const DAY_MS = 24 * 60 * 60 * 1000
const MONTHLY_MIN_GAP_DAYS = 25
const MONTHLY_MAX_GAP_DAYS = 35
const SINGLE_GAP_MIN_DAYS = 27
const SINGLE_GAP_MAX_DAYS = 33
const MIN_SUBSCRIPTION_AMOUNT_CENTS = 500
const MAX_AMOUNT_DRIFT_RATIO = 0.25
const AMOUNT_CLUSTER_TOLERANCE_RATIO = 0.18
const MIN_CLUSTER_TOLERANCE_CENTS = 100
const BRIDGE_EXPECTED_DAY_TOLERANCE = 7

export const SUBSCRIPTION_ACTIVE_WINDOW_DAYS = 35
export const SUBSCRIPTION_ACTIVE_WINDOW_MAX_DAYS = 70

export interface SubscriptionDetectionTransaction {
    amountCents: number
    description: string
    timestamp: number
    categoryId?: string
    categoryLabel?: string
}

export interface DetectedSubscription {
    id: string
    description: string
    amountCents: number
    frequency: "monthly"
    occurrences: number
    lastChargeTimestamp: number
    categoryId: string
    categoryLabel: string
    charges: Array<{
        amountCents: number
        description: string
        timestamp: number
    }>
}

interface DetectActiveSubscriptionsOptions {
    activeWindowDays?: number
    now?: Date
}

interface SubscriptionSample {
    amountCents: number
    description: string
    timestamp: number
    categoryId?: string
    categoryLabel?: string
}

interface SubscriptionCluster {
    averageAmountCents: number
    samples: SubscriptionSample[]
}

interface CandidateSubscription {
    amountCents: number
    frequency: "monthly"
    lastChargeTimestamp: number
    occurrences: number
    categoryId: string
    categoryLabel: string
    charges: SubscriptionSample[]
}

function toSubscriptionId(value: string): string {
    const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    return slug.length > 0 ? slug : "subscription"
}

function normalizeCategoryId(value: string | undefined): string {
    return (value || "").trim().toLowerCase()
}

function normalizeCategoryLabel(value: string | undefined): string {
    return (value || "").trim()
}

function toMedian(values: number[]): number {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 1) {
        return sorted[middle]
    }

    return Math.round((sorted[middle - 1] + sorted[middle]) / 2)
}

function isWithinMonthlyCadence(sortedDates: number[]): boolean {
    if (sortedDates.length < 2) return false

    const gapsInDays: number[] = []
    for (let index = 1; index < sortedDates.length; index++) {
        gapsInDays.push((sortedDates[index] - sortedDates[index - 1]) / DAY_MS)
    }

    if (gapsInDays.length === 1) {
        return gapsInDays[0] >= SINGLE_GAP_MIN_DAYS && gapsInDays[0] <= SINGLE_GAP_MAX_DAYS
    }

    const monthlyMatches = gapsInDays.filter(
        (gapDays) => gapDays >= MONTHLY_MIN_GAP_DAYS && gapDays <= MONTHLY_MAX_GAP_DAYS
    ).length
    const cadenceRatio = monthlyMatches / gapsInDays.length

    return monthlyMatches >= 2 && cadenceRatio >= 0.6
}

function isAmountStable(samples: SubscriptionSample[]): boolean {
    if (samples.length < 2) return true

    const amounts = samples.map((sample) => sample.amountCents)
    const medianAmount = Math.max(1, toMedian(amounts))
    const maxDriftRatio = Math.max(
        ...amounts.map((amountCents) => Math.abs(amountCents - medianAmount) / medianAmount)
    )

    return maxDriftRatio <= MAX_AMOUNT_DRIFT_RATIO
}

function isRecentlyActive(latestTimestamp: number, now: Date, activeWindowDays: number): boolean {
    const diffInDays = (now.getTime() - latestTimestamp) / DAY_MS
    return diffInDays <= activeWindowDays
}

function hasRecentBridgeSample(
    merchantSamples: SubscriptionSample[],
    latestClusterTimestamp: number,
    now: Date,
    baseWindowDays: number
): boolean {
    const expectedNextCharge = new Date(latestClusterTimestamp)
    expectedNextCharge.setHours(0, 0, 0, 0)
    expectedNextCharge.setMonth(expectedNextCharge.getMonth() + 1)
    const expectedNextChargeTs = expectedNextCharge.getTime()

    return merchantSamples.some((sample) => {
        if (sample.timestamp <= latestClusterTimestamp) return false

        const daysSinceSample = (now.getTime() - sample.timestamp) / DAY_MS
        if (daysSinceSample < 0 || daysSinceSample > baseWindowDays) return false

        const expectedDistanceInDays = Math.abs(sample.timestamp - expectedNextChargeTs) / DAY_MS
        return expectedDistanceInDays <= BRIDGE_EXPECTED_DAY_TOLERANCE
    })
}

function isRecentlyActiveAdaptive(
    latestTimestamp: number,
    merchantSamples: SubscriptionSample[],
    now: Date,
    baseWindowDays: number,
    maxWindowDays: number
): boolean {
    if (isRecentlyActive(latestTimestamp, now, baseWindowDays)) return true
    if (!isRecentlyActive(latestTimestamp, now, maxWindowDays)) return false

    return hasRecentBridgeSample(merchantSamples, latestTimestamp, now, baseWindowDays)
}

function clusterByAmount(samples: SubscriptionSample[]): SubscriptionCluster[] {
    const clusters: SubscriptionCluster[] = []

    for (const sample of samples) {
        let bestClusterIndex = -1
        let bestDistance = Number.POSITIVE_INFINITY

        for (let index = 0; index < clusters.length; index++) {
            const cluster = clusters[index]
            const tolerance = Math.max(
                MIN_CLUSTER_TOLERANCE_CENTS,
                Math.round(cluster.averageAmountCents * AMOUNT_CLUSTER_TOLERANCE_RATIO)
            )
            const distance = Math.abs(sample.amountCents - cluster.averageAmountCents)

            if (distance <= tolerance && distance < bestDistance) {
                bestDistance = distance
                bestClusterIndex = index
            }
        }

        if (bestClusterIndex === -1) {
            clusters.push({
                averageAmountCents: sample.amountCents,
                samples: [sample]
            })
            continue
        }

        const cluster = clusters[bestClusterIndex]
        cluster.samples.push(sample)
        const totalAmountCents = cluster.samples.reduce((sum, item) => sum + item.amountCents, 0)
        cluster.averageAmountCents = Math.round(totalAmountCents / cluster.samples.length)
    }

    return clusters
}

function resolveDominantCategory(samples: SubscriptionSample[]): {
    categoryId: string
    categoryLabel: string
} {
    const byCategoryId = new Map<string, { count: number; lastTimestamp: number }>()
    const latestLabelByCategoryId = new Map<string, { label: string; timestamp: number }>()

    samples.forEach((sample) => {
        const normalizedCategoryId = normalizeCategoryId(sample.categoryId)
        if (!normalizedCategoryId) return

        const current = byCategoryId.get(normalizedCategoryId) || {
            count: 0,
            lastTimestamp: 0
        }

        current.count += 1
        current.lastTimestamp = Math.max(current.lastTimestamp, sample.timestamp)
        byCategoryId.set(normalizedCategoryId, current)

        const normalizedLabel = normalizeCategoryLabel(sample.categoryLabel)
        if (normalizedLabel.length > 0) {
            const currentLabel = latestLabelByCategoryId.get(normalizedCategoryId)
            if (!currentLabel || sample.timestamp >= currentLabel.timestamp) {
                latestLabelByCategoryId.set(normalizedCategoryId, {
                    label: normalizedLabel,
                    timestamp: sample.timestamp
                })
            }
        }
    })

    let dominantCategoryId = ""
    let dominantCount = 0
    let dominantLastTimestamp = 0

    byCategoryId.forEach((summary, categoryId) => {
        if (summary.count > dominantCount) {
            dominantCategoryId = categoryId
            dominantCount = summary.count
            dominantLastTimestamp = summary.lastTimestamp
            return
        }

        if (summary.count === dominantCount && summary.lastTimestamp > dominantLastTimestamp) {
            dominantCategoryId = categoryId
            dominantLastTimestamp = summary.lastTimestamp
        }
    })

    if (!dominantCategoryId) {
        return {
            categoryId: "",
            categoryLabel: "Senza categoria"
        }
    }

    const label = latestLabelByCategoryId.get(dominantCategoryId)?.label || dominantCategoryId
    return {
        categoryId: dominantCategoryId,
        categoryLabel: label
    }
}

export function detectActiveSubscriptions(
    transactions: SubscriptionDetectionTransaction[],
    options: DetectActiveSubscriptionsOptions = {}
): { subscriptions: DetectedSubscription[]; totalYearlyCents: number } {
    const now = options.now || new Date()
    const activeWindowDays = options.activeWindowDays || SUBSCRIPTION_ACTIVE_WINDOW_DAYS
    const maxActiveWindowDays = Math.max(activeWindowDays, SUBSCRIPTION_ACTIVE_WINDOW_MAX_DAYS)
    const merchantMap = new Map<string, SubscriptionSample[]>()

    transactions.forEach((transaction) => {
        const amountCents = Math.abs(transaction.amountCents || 0)
        if (amountCents < MIN_SUBSCRIPTION_AMOUNT_CENTS) return

        const merchantKey = extractMerchantKey(transaction.description)
        if (!merchantKey || merchantKey === "ALTRO" || merchantKey === "UNRESOLVED") return

        const samples = merchantMap.get(merchantKey) || []
        samples.push({
            amountCents,
            description: transaction.description,
            timestamp: transaction.timestamp,
            categoryId: transaction.categoryId,
            categoryLabel: transaction.categoryLabel
        })
        merchantMap.set(merchantKey, samples)
    })

    const subscriptions: DetectedSubscription[] = []

    merchantMap.forEach((samples, merchantKey) => {
        if (samples.length < 2) return

        const clusters = clusterByAmount(samples)
        const candidates: CandidateSubscription[] = []

        clusters.forEach((cluster) => {
            if (cluster.samples.length < 2) return
            if (!isAmountStable(cluster.samples)) return

            const sortedDates = cluster.samples
                .map((sample) => sample.timestamp)
                .sort((a, b) => a - b)

            if (!isWithinMonthlyCadence(sortedDates)) return

            const latestTimestamp = sortedDates[sortedDates.length - 1]
            if (!isRecentlyActiveAdaptive(latestTimestamp, samples, now, activeWindowDays, maxActiveWindowDays)) return

            const medianAmountCents = toMedian(cluster.samples.map((sample) => sample.amountCents))
            if (medianAmountCents < MIN_SUBSCRIPTION_AMOUNT_CENTS) return

            const { categoryId, categoryLabel } = resolveDominantCategory(cluster.samples)

            candidates.push({
                amountCents: medianAmountCents,
                frequency: "monthly",
                lastChargeTimestamp: latestTimestamp,
                occurrences: cluster.samples.length,
                categoryId,
                categoryLabel,
                charges: cluster.samples
                    .slice()
                    .sort((a, b) => b.timestamp - a.timestamp)
            })
        })

        candidates
            .sort((a, b) => {
                if (b.amountCents !== a.amountCents) return b.amountCents - a.amountCents
                return b.lastChargeTimestamp - a.lastChargeTimestamp
            })
            .forEach((candidate, index) => {
                const hasMultiplePlans = candidates.length > 1
                const baseId = toSubscriptionId(merchantKey)

                subscriptions.push({
                    id: `${baseId}-${candidate.amountCents}-${index + 1}`,
                    description: hasMultiplePlans ? `${merchantKey} (Piano ${index + 1})` : merchantKey,
                    amountCents: candidate.amountCents,
                    frequency: candidate.frequency,
                    occurrences: candidate.occurrences,
                    lastChargeTimestamp: candidate.lastChargeTimestamp,
                    categoryId: candidate.categoryId,
                    categoryLabel: candidate.categoryLabel,
                    charges: candidate.charges
                })
            })
    })

    subscriptions.sort((a, b) => {
        if (b.amountCents !== a.amountCents) return b.amountCents - a.amountCents
        return a.description.localeCompare(b.description)
    })

    const totalYearlyCents = subscriptions.reduce((sum, subscription) => {
        return sum + (subscription.amountCents * 12)
    }, 0)

    return {
        subscriptions,
        totalYearlyCents
    }
}
