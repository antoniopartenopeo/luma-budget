import { Group } from "./types";

// Fixed threshold range: 0-1000€ = 0-100000 cents
export const THRESHOLD_MAX_CENTS = 100000;
export const THRESHOLD_STEP_CENTS = 500; // 5€ steps

export interface FilterResult {
    includedGroups: Group[];
    excludedGroupIds: string[];
}

/**
 * Filters groups by threshold and returns both included groups and excluded IDs.
 * Single source of truth for threshold filtering used by:
 * - step-review.tsx (display)
 * - step-summary.tsx (payload generation)
 * 
 * Groups are sorted by absolute totalCents descending.
 */
export function getIncludedGroups(
    groups: Group[],
    thresholdCents: number
): FilterResult {
    const included = groups
        .filter(g => Math.abs(g.totalCents) >= thresholdCents)
        .sort((a, b) => Math.abs(b.totalCents) - Math.abs(a.totalCents));

    const includedSet = new Set(included.map(g => g.id));
    const excludedGroupIds = groups
        .filter(g => !includedSet.has(g.id))
        .map(g => g.id);

    return { includedGroups: included, excludedGroupIds };
}
