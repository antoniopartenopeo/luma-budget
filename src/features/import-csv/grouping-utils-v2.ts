/**
 * Grouping Utilities V2
 * 
 * Advanced grouping with:
 * - Subgroups by identical amount
 * - Sorting by total (absolute)
 * - Significance scoring
 * - Group-level selection
 * - Split/merge state
 * 
 * Performance: O(n) grouping + O(g log g) sorting
 */

import type { PreviewRow, MerchantGroupV2, AmountSubgroup, GroupsV2Result, SignificanceStrategy } from "./types"
import { MIN_DUP_COUNT, DEFAULT_SIGNIFICANCE_THRESHOLD_CENTS } from "./types"
import { generatePatternKey, capitalizeWords } from "./normalization-utils"

// ============================================================================
// COMPUTE GROUPS V2
// ============================================================================

interface ComputeGroupsV2Options {
    thresholdCents?: number
    strategy?: SignificanceStrategy
}

/**
 * Groups rows by pattern key with subgroups, significance, and selection.
 * O(n) for grouping + O(g log g) for sorting.
 * 
 * @returns GroupsV2Result with income/expense separated and sorted by totalAbsCents desc
 */
export function computeGroupsV2(
    rows: PreviewRow[],
    options: ComputeGroupsV2Options = {}
): GroupsV2Result {
    const {
        thresholdCents = DEFAULT_SIGNIFICANCE_THRESHOLD_CENTS,
        strategy = "threshold"
    } = options

    // Phase 1: Group rows by patternKey (O(n))
    const groupMap = new Map<string, {
        patternKey: string
        merchantKey: string
        isFallback: boolean
        rows: PreviewRow[]
        type: "income" | "expense"
    }>()

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

    // Phase 2: Build MerchantGroupV2 with subgroups (O(n))
    const groups: MerchantGroupV2[] = []

    for (const { patternKey, merchantKey, isFallback, rows: groupRows, type } of groupMap.values()) {
        // Compute subgroups (cluster by amountCents)
        const subgroups = computeSubgroups(groupRows)

        // Get most common category
        const categoryCounts = new Map<string, number>()
        for (const row of groupRows) {
            const cat = row.selectedCategoryId
            categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1)
        }
        const mostCommonCategory = [...categoryCounts.entries()]
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "altro"

        // Calculate totals
        const totalAmountCents = groupRows.reduce((sum, r) => sum + r.amountCents, 0)
        const totalAbsCents = Math.abs(totalAmountCents)

        // Significance (applied after all groups are built if strategy is topN)
        const isSignificant = strategy === "threshold"
            ? totalAbsCents >= thresholdCents
            : true // Will be set later for topN

        groups.push({
            patternKey,
            merchantKey,
            isFallback,
            displayName: capitalizeWords(merchantKey),
            rowIndices: groupRows.map(r => r.rowIndex),
            totalAmountCents,
            totalAbsCents,
            count: groupRows.length,
            type,
            sampleDescriptions: groupRows.slice(0, 3).map(r => r.description),
            assignedCategoryId: mostCommonCategory,
            subgroups,
            isSignificant,
            isGroupSelected: isSignificant // Default: select significant groups
        })
    }

    // Phase 3: Sort and separate by type (O(g log g))
    const incomeGroups = groups
        .filter(g => g.type === "income")
        .sort((a, b) => b.totalAbsCents - a.totalAbsCents)

    const expenseGroups = groups
        .filter(g => g.type === "expense")
        .sort((a, b) => b.totalAbsCents - a.totalAbsCents)

    // Combined: expenses first (usually more important), then income
    const allGroups = [...expenseGroups, ...incomeGroups]

    return {
        income: incomeGroups,
        expense: expenseGroups,
        all: allGroups
    }
}

/**
 * Computes amount-based subgroups for a set of rows.
 * Only creates subgroup if count >= MIN_DUP_COUNT.
 * Sorted by (count * abs(amount)) desc, then count desc.
 */
function computeSubgroups(rows: PreviewRow[]): AmountSubgroup[] {
    // Group by absolute amount
    const amountMap = new Map<number, number[]>()

    for (const row of rows) {
        const absAmount = Math.abs(row.amountCents)
        if (!amountMap.has(absAmount)) {
            amountMap.set(absAmount, [])
        }
        amountMap.get(absAmount)!.push(row.rowIndex)
    }

    // Filter to MIN_DUP_COUNT and build subgroups
    const subgroups: AmountSubgroup[] = []

    for (const [amountCents, rowIndices] of amountMap.entries()) {
        if (rowIndices.length >= MIN_DUP_COUNT) {
            subgroups.push({
                amountCents,
                rowIndices,
                count: rowIndices.length,
                isSplit: false
            })
        }
    }

    // Sort by (count * amount) desc, then count desc
    return subgroups.sort((a, b) => {
        const scoreA = a.count * a.amountCents
        const scoreB = b.count * b.amountCents
        if (scoreB !== scoreA) return scoreB - scoreA
        return b.count - a.count
    })
}

// ============================================================================
// SPLIT / MERGE FUNCTIONS
// ============================================================================

/**
 * Marks a subgroup as "split" for independent categorization.
 * Pure function - returns new group with updated subgroup.
 */
export function splitSubgroup(
    group: MerchantGroupV2,
    amountCents: number
): MerchantGroupV2 {
    return {
        ...group,
        subgroups: group.subgroups.map(sg =>
            sg.amountCents === amountCents
                ? { ...sg, isSplit: true }
                : sg
        )
    }
}

/**
 * Marks a subgroup as "merged" back into parent.
 * Pure function - returns new group with updated subgroup.
 */
export function mergeSubgroup(
    group: MerchantGroupV2,
    amountCents: number
): MerchantGroupV2 {
    return {
        ...group,
        subgroups: group.subgroups.map(sg =>
            sg.amountCents === amountCents
                ? { ...sg, isSplit: false }
                : sg
        )
    }
}

// ============================================================================
// GROUP SELECTION
// ============================================================================

/**
 * Sets group-level selection.
 * Pure function - returns new group with updated isGroupSelected.
 */
export function setGroupSelected(
    group: MerchantGroupV2,
    selected: boolean
): MerchantGroupV2 {
    return {
        ...group,
        isGroupSelected: selected
    }
}

/**
 * Bulk update group selection for multiple groups.
 */
export function setAllGroupsSelected(
    groups: MerchantGroupV2[],
    selected: boolean
): MerchantGroupV2[] {
    return groups.map(g => setGroupSelected(g, selected))
}

// ============================================================================
// SIGNIFICANCE SCORING
// ============================================================================

/**
 * Applies significance scoring to groups based on strategy.
 * Pure function - returns new array with updated isSignificant.
 */
export function computeSignificance(
    groups: MerchantGroupV2[],
    thresholdCents: number,
    strategy: SignificanceStrategy = "threshold"
): MerchantGroupV2[] {
    if (strategy === "threshold") {
        return groups.map(g => ({
            ...g,
            isSignificant: g.totalAbsCents >= thresholdCents,
            isGroupSelected: g.totalAbsCents >= thresholdCents
        }))
    }
    // topN strategy uses markTopNAsSignificant
    return groups
}

/**
 * Marks top N groups (by totalAbsCents) as significant.
 * Useful for "top 10 merchants" view.
 */
export function markTopNAsSignificant(
    groups: MerchantGroupV2[],
    n: number
): MerchantGroupV2[] {
    // Sort by totalAbsCents to find top N
    const sorted = [...groups].sort((a, b) => b.totalAbsCents - a.totalAbsCents)
    const topNKeys = new Set(sorted.slice(0, n).map(g => g.patternKey))

    return groups.map(g => ({
        ...g,
        isSignificant: topNKeys.has(g.patternKey),
        isGroupSelected: topNKeys.has(g.patternKey)
    }))
}

/**
 * Gets groups filtered by significance.
 */
export function getGroupsBySignificance(
    result: GroupsV2Result,
    significantOnly: boolean
): GroupsV2Result {
    if (!significantOnly) return result

    return {
        income: result.income.filter(g => g.isSignificant),
        expense: result.expense.filter(g => g.isSignificant),
        all: result.all.filter(g => g.isSignificant)
    }
}

// ============================================================================
// CATEGORY APPLICATION
// ============================================================================

/**
 * Applies a category to all rows in a group.
 * Works with V2 groups.
 */
export function applyCategoryToGroupV2(
    rows: PreviewRow[],
    group: MerchantGroupV2,
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
 * Applies a category to a specific subgroup within a group.
 */
export function applyCategoryToSubgroup(
    rows: PreviewRow[],
    subgroup: AmountSubgroup,
    categoryId: string
): PreviewRow[] {
    const indexSet = new Set(subgroup.rowIndices)

    return rows.map(row => {
        if (indexSet.has(row.rowIndex)) {
            return { ...row, selectedCategoryId: categoryId }
        }
        return row
    })
}
