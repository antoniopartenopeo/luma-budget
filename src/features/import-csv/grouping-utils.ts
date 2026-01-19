/**
 * Grouping Utilities
 * 
 * Groups import rows by merchant for bulk categorization.
 * Uses normalized description prefix as merchant key.
 */

import type { PreviewRow, MerchantGroup } from "./types"
import { normalizeDescription } from "./dedupe-utils"

/**
 * Extracts a merchant key from a description
 * Takes first 2-3 significant words, removes common patterns
 */
export function extractMerchantKey(description: string): string {
    const normalized = normalizeDescription(description)

    // Remove common prefixes (card purchases, transfers, etc.)
    const cleaned = normalized
        .replace(/^(pagamento|acquisto|addebito|bonifico|prelievo|versamento|rid|mav|rata)\s+/i, "")
        .replace(/^(carta|pos|atm|sepa)\s+/i, "")
        .replace(/\d{2}\/\d{2}\/\d{4}/g, "") // Remove dates
        .replace(/\d{4,}/g, "") // Remove long numbers (cards, references)
        .trim()

    // Take first 3 words max
    const words = cleaned.split(/\s+/).filter(w => w.length > 1)
    const key = words.slice(0, 3).join(" ")

    return key || "altro" // Fallback if nothing left
}

/**
 * Groups preview rows by merchant key
 * Returns sorted by count (most frequent first)
 */
export function groupRowsByMerchant(rows: PreviewRow[]): MerchantGroup[] {
    const groupMap = new Map<string, {
        rows: PreviewRow[],
        type: "income" | "expense"
    }>()

    // Group rows
    for (const row of rows) {
        if (!row.isValid) continue

        const key = extractMerchantKey(row.description)
        // Separate income/expense even with same merchant
        const fullKey = `${key}|${row.type}`

        if (!groupMap.has(fullKey)) {
            groupMap.set(fullKey, { rows: [], type: row.type })
        }
        groupMap.get(fullKey)!.rows.push(row)
    }

    // Convert to MerchantGroup array
    const groups: MerchantGroup[] = []

    for (const [fullKey, { rows: groupRows, type }] of groupMap) {
        const merchantKey = fullKey.split("|")[0]

        // Get most common category in group (for default)
        const categoryCounts = new Map<string, number>()
        for (const row of groupRows) {
            const cat = row.selectedCategoryId
            categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1)
        }
        const mostCommonCategory = [...categoryCounts.entries()]
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "altro"

        groups.push({
            merchantKey,
            displayName: capitalizeWords(merchantKey),
            rowIndices: groupRows.map(r => r.rowIndex),
            totalAmountCents: groupRows.reduce((sum, r) => sum + r.amountCents, 0),
            count: groupRows.length,
            type,
            sampleDescriptions: groupRows.slice(0, 3).map(r => r.description),
            assignedCategoryId: mostCommonCategory
        })
    }

    // Sort by count descending
    return groups.sort((a, b) => b.count - a.count)
}

/**
 * Applies a category to all rows in a merchant group
 */
export function applyCategoryToGroup(
    rows: PreviewRow[],
    group: MerchantGroup,
    categoryId: string
): PreviewRow[] {
    const indexSet = new Set(group.rowIndices)

    return rows.map(row => {
        if (indexSet.has(row.rowIndex)) {
            return { ...row, selectedCategoryId: categoryId }
        }
        return row
    })
}

/**
 * Capitalizes words for display
 */
function capitalizeWords(str: string): string {
    return str
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
}
