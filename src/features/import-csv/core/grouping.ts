import { EnrichedRow, Group } from "./types";
import { format } from "date-fns";
import { computeSubgroups } from "./subgrouping";

export function groupRowsByMerchant(rows: EnrichedRow[]): Group[] {
    const map = new Map<string, { merchantKey: string; direction: "income" | "expense" | null; rows: EnrichedRow[] }>();

    // 1. Cluster by merchantKey
    for (const row of rows) {
        const merchantKey = row.merchantKey || "UNCATEGORIZED"; // fallback if empty
        const direction = row.amountCents > 0 ? "income" : "expense";
        const shouldSplitByDirection = merchantKey === "UNRESOLVED" || merchantKey === "ALTRO";
        const clusterKey = shouldSplitByDirection ? `${merchantKey}::${direction}` : merchantKey;

        if (!map.has(clusterKey)) {
            map.set(clusterKey, {
                merchantKey,
                direction: shouldSplitByDirection ? direction : null,
                rows: []
            });
        }
        map.get(clusterKey)!.rows.push(row);
    }

    // 2. Build Group objects
    const groups: Group[] = [];

    for (const { merchantKey, direction, rows: groupRows } of map.values()) {
        const totalCents = groupRows.reduce((sum, r) => sum + r.amountCents, 0);
        const label =
            direction === null
                ? merchantKey
                : `${merchantKey} • ${direction === "income" ? "Entrate" : "Uscite"}`;

        // Calculate Date Range
        const timestamps = groupRows.map(r => r.timestamp);
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);

        const from = format(new Date(minTime), "yyyy-MM-dd");
        const to = format(new Date(maxTime), "yyyy-MM-dd");

        // Create partial group to pass to subgrouping
        const partialGroup: Group = {
            id: crypto.randomUUID(),
            merchantKey,
            label,
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
