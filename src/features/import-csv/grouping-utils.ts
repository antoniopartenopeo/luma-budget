/**
 * Grouping Utilities
 * 
 * Groups import rows by pattern key for bulk categorization.
 * Uses deterministic pattern-based grouping with merchantKey fallback.
 * 
 * V2: Uses patternKey (signature-based) instead of merchantKey
 */

import type { PreviewRow, MerchantGroup } from "./types"
import { generatePatternKey, capitalizeWords, extractMerchantKey } from "./normalization-utils"

/**
 * Groups preview rows by pattern key
 * O(n) with Map aggregation
 * Returns sorted by count (most frequent first)
 */
export function computeGroups(rows: PreviewRow[]): MerchantGroup[] {
    const groupMap = new Map<string, {
        patternKey: string
        merchantKey: string
        isFallback: boolean
        rows: PreviewRow[]
        type: "income" | "expense"
    }>()

    // Group rows by patternKey
    for (const row of rows) {
        if (!row.isValid) continue

        const { patternKey, merchantKey, isFallback } = generatePatternKey(
            row.description,
            row.type
        )

        if (!groupMap.has(patternKey)) {
            groupMap.set(patternKey, {
                patternKey,
                merchantKey,
                isFallback,
                rows: [],
                type: row.type
            })
        }
        groupMap.get(patternKey)!.rows.push(row)
    }

    // Convert to MerchantGroup array
    const groups: MerchantGroup[] = []

    for (const { patternKey, merchantKey, isFallback, rows: groupRows, type } of groupMap.values()) {
        // Get most common category in group (for default)
        const categoryCounts = new Map<string, number>()
        for (const row of groupRows) {
            const cat = row.selectedCategoryId
            categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1)
        }
        const mostCommonCategory = [...categoryCounts.entries()]
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "altro"

        groups.push({
            patternKey,
            merchantKey,
            isFallback,
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
 * Legacy alias for backwards compatibility
 * @deprecated Use computeGroups instead
 */
export function groupRowsByMerchant(rows: PreviewRow[]): MerchantGroup[] {
    return computeGroups(rows)
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

// Re-export for convenience (used by UI components)
export { extractMerchantKey } from "./normalization-utils"
