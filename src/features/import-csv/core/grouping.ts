import { EnrichedRow, Group } from "./types";
import { format } from "date-fns";
import { computeSubgroups } from "./subgrouping";

export function groupRowsByMerchant(rows: EnrichedRow[]): Group[] {
    const map = new Map<string, EnrichedRow[]>();

    // 1. Cluster by merchantKey
    for (const row of rows) {
        const key = row.merchantKey || "UNCATEGORIZED"; // fallback if empty
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(row);
    }

    // 2. Build Group objects
    const groups: Group[] = [];

    for (const [key, groupRows] of map.entries()) {
        const totalCents = groupRows.reduce((sum, r) => sum + r.amountCents, 0);

        // Calculate Date Range
        const timestamps = groupRows.map(r => r.timestamp);
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);

        const from = format(new Date(minTime), "yyyy-MM-dd");
        const to = format(new Date(maxTime), "yyyy-MM-dd");

        // Create partial group to pass to subgrouping
        const partialGroup: Group = {
            id: crypto.randomUUID(),
            merchantKey: key,
            label: key, // Could be prettified
            rowCount: groupRows.length,
            totalCents,
            dateRange: { from, to },
            subgroups: [], // Temporary
            categoryId: null,
            categoryLocked: false,
        };

        // 3. Compute Subgroups (this ensures rows are preserved in subgroup.rowIds)
        partialGroup.subgroups = computeSubgroups(partialGroup, groupRows);

        groups.push(partialGroup);
    }

    // Sort groups by row count desc
    return groups.sort((a, b) => b.rowCount - a.rowCount);
}
