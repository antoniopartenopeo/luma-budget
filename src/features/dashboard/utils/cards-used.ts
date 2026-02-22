import { parseCardFromDescription, CardParseConfidence, CardNetwork, WalletProvider, Transaction } from "@/domain/transactions"
import { CardUsageStatus, DashboardCardUsage } from "../api/types"

interface MutableCardAgg {
    cardId: string
    last4: string
    network: CardNetwork
    walletProvider: WalletProvider
    firstSeenTs: number
    lastSeenTs: number
    confidence: CardParseConfidence
}

const ACTIVE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

function buildCardKey(network: CardNetwork, last4: string): string {
    return network === "Unknown"
        ? `unk_${last4}`
        : `${network.toLowerCase()}_${last4}`
}

function maxConfidence(a: CardParseConfidence, b: CardParseConfidence): CardParseConfidence {
    if (a === "high" || b === "high") return "high"
    return "medium"
}

function mergeWalletProvider(current: WalletProvider, incoming: WalletProvider): WalletProvider {
    if (current === incoming) return current
    if (current === "Unknown") return incoming
    if (incoming === "Unknown") return current

    if (current === "Other") return incoming
    if (incoming === "Other") return current

    return "Other"
}

function resolveCardStatus(lastSeenTs: number, nowTs: number): CardUsageStatus {
    return nowTs - lastSeenTs <= ACTIVE_WINDOW_MS ? "active" : "stale"
}

function reconcileUnknownNetworks(
    byKey: Map<string, MutableCardAgg>,
    unknownKeysByLast4: Map<string, Set<string>>,
    knownKeysByLast4: Map<string, Set<string>>
): void {
    unknownKeysByLast4.forEach((unknownKeys, last4) => {
        const knownKeys = knownKeysByLast4.get(last4)
        if (!knownKeys || knownKeys.size !== 1) return

        const knownKey = Array.from(knownKeys)[0]
        const knownAgg = byKey.get(knownKey)
        if (!knownAgg) return

        unknownKeys.forEach((unknownKey) => {
            if (unknownKey === knownKey) return
            const unknownAgg = byKey.get(unknownKey)
            if (!unknownAgg) return

            knownAgg.firstSeenTs = Math.min(knownAgg.firstSeenTs, unknownAgg.firstSeenTs)
            knownAgg.lastSeenTs = Math.max(knownAgg.lastSeenTs, unknownAgg.lastSeenTs)
            knownAgg.confidence = maxConfidence(knownAgg.confidence, unknownAgg.confidence)
            knownAgg.walletProvider = mergeWalletProvider(knownAgg.walletProvider, unknownAgg.walletProvider)

            byKey.delete(unknownKey)
        })
    })
}

function toDashboardCardUsage(agg: MutableCardAgg, nowTs: number): DashboardCardUsage {
    return {
        cardId: agg.cardId,
        last4: agg.last4,
        network: agg.network,
        walletProvider: agg.walletProvider,
        firstSeen: new Date(agg.firstSeenTs).toISOString(),
        lastSeen: new Date(agg.lastSeenTs).toISOString(),
        status: resolveCardStatus(agg.lastSeenTs, nowTs),
        confidence: agg.confidence
    }
}

export function buildCardsUsed(rangeTransactions: Transaction[], now: Date = new Date()): DashboardCardUsage[] {
    const byKey = new Map<string, MutableCardAgg>()
    const unknownKeysByLast4 = new Map<string, Set<string>>()
    const knownKeysByLast4 = new Map<string, Set<string>>()

    for (const transaction of rangeTransactions) {
        const parsed = parseCardFromDescription(transaction.description, "balanced")
        if (!parsed) continue

        const key = buildCardKey(parsed.network, parsed.last4)
        const current = byKey.get(key)

        if (!current) {
            byKey.set(key, {
                cardId: key,
                last4: parsed.last4,
                network: parsed.network,
                walletProvider: parsed.walletProvider,
                firstSeenTs: transaction.timestamp,
                lastSeenTs: transaction.timestamp,
                confidence: parsed.confidence
            })
        } else {
            current.firstSeenTs = Math.min(current.firstSeenTs, transaction.timestamp)
            current.lastSeenTs = Math.max(current.lastSeenTs, transaction.timestamp)
            current.confidence = maxConfidence(current.confidence, parsed.confidence)
            current.walletProvider = mergeWalletProvider(current.walletProvider, parsed.walletProvider)
        }

        if (parsed.network === "Unknown") {
            const unknownKeys = unknownKeysByLast4.get(parsed.last4) ?? new Set<string>()
            unknownKeys.add(key)
            unknownKeysByLast4.set(parsed.last4, unknownKeys)
            continue
        }

        const knownKeys = knownKeysByLast4.get(parsed.last4) ?? new Set<string>()
        knownKeys.add(key)
        knownKeysByLast4.set(parsed.last4, knownKeys)
    }

    reconcileUnknownNetworks(byKey, unknownKeysByLast4, knownKeysByLast4)

    const nowTs = now.getTime()
    return Array.from(byKey.values())
        .map((agg) => toDashboardCardUsage(agg, nowTs))
        .sort((a, b) => {
            const recencyDelta = Date.parse(b.lastSeen) - Date.parse(a.lastSeen)
            if (recencyDelta !== 0) return recencyDelta

            const networkDelta = a.network.localeCompare(b.network, "it-IT")
            if (networkDelta !== 0) return networkDelta

            return a.last4.localeCompare(b.last4, "it-IT")
        })
}
