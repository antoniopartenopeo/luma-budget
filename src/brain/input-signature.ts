interface BrainSignatureTransaction {
    amountCents: number
    timestamp: number
    categoryId: string
    type: "income" | "expense"
    isSuperfluous?: boolean
}

interface BrainSignatureCategory {
    id: string
    spendingNature: "essential" | "comfort" | "superfluous"
}

/**
 * Lightweight signature used to detect relevant input changes before invoking
 * the heavier dataset builder/training pipeline.
 */
export function computeBrainInputSignature(
    transactions: BrainSignatureTransaction[],
    categories: BrainSignatureCategory[],
    period: string
): string {
    let h = 2166136261

    for (const tx of transactions) {
        h ^= tx.timestamp
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)

        h ^= tx.amountCents
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)

        h ^= tx.type === "income" ? 1 : 2
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)

        for (let i = 0; i < tx.categoryId.length; i++) {
            h ^= tx.categoryId.charCodeAt(i)
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
        }

        h ^= tx.isSuperfluous === true ? 19 : tx.isSuperfluous === false ? 23 : 29
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
    }

    for (const category of categories) {
        for (let i = 0; i < category.id.length; i++) {
            h ^= category.id.charCodeAt(i)
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
        }
        h ^= category.spendingNature === "essential" ? 11 : category.spendingNature === "comfort" ? 13 : 17
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
    }

    return `${period}:${transactions.length}:${categories.length}:${(h >>> 0).toString(16)}`
}

