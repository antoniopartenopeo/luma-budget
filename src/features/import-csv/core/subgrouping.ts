import { EnrichedRow, Group, Subgroup } from "./types";
import { format } from "date-fns";

/**
 * Strategy pattern for subgrouping
 */
type SubgroupStrategy = (rows: EnrichedRow[]) => Map<string, EnrichedRow[]>;

const strategies: Record<string, SubgroupStrategy> = {
    // Strategy 1: By Amount Bucket
    AMOUNT: (rows) => {
        const map = new Map<string, EnrichedRow[]>();
        for (const row of rows) {
            const abs = Math.abs(row.amountCents);
            let key = "Medium";
            // Micro: < 1000 (10€)
            // Small: 1000-5000 (10-50€)
            // Medium: 5000-20000 (50-200€)
            // Large: > 20000 (200€)
            if (abs < 1000) key = "Micro (<10€)";
            else if (abs < 5000) key = "Small (10-50€)";
            else if (abs < 20000) key = "Medium (50-200€)";
            else key = "Large (>200€)";

            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(row);
        }
        return map;
    },

    // Strategy 2: By Month
    MONTH: (rows) => {
        const map = new Map<string, EnrichedRow[]>();
        for (const row of rows) {
            const key = format(new Date(row.timestamp), "yyyy-MM");
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(row);
        }
        return map;
    },

    // Strategy 3: By Sign
    SIGN: (rows) => {
        const map = new Map<string, EnrichedRow[]>();
        for (const row of rows) {
            const key = row.amountCents >= 0 ? "Income" : "Expense";
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(row);
        }
        return map;
    },
};

export function computeSubgroups(group: Group, rows: EnrichedRow[]): Subgroup[] {
    // If group is single row, just return 1 subgroup
    if (rows.length <= 1) {
        return [{
            id: crypto.randomUUID(),
            label: "All Items",
            rowIds: rows.map(r => r.id),
            categoryId: null,
            categoryLocked: false
        }];
    }

    // Try strategies in order
    const order = ["AMOUNT", "MONTH", "SIGN"];

    for (const strategyName of order) {
        const strategy = strategies[strategyName];
        const grouped = strategy(rows);

        // Stop at first strategy that produces > 1 subgroup
        if (grouped.size > 1) {
            return Array.from(grouped.entries()).map(([label, subRows]) => ({
                id: crypto.randomUUID(),
                label,
                rowIds: subRows.map(r => r.id),
                categoryId: null,
                categoryLocked: false
            }));
        }
    }

    // Fallback: 1 subgroup
    return [{
        id: crypto.randomUUID(),
        label: "All Items",
        rowIds: rows.map(r => r.id),
        categoryId: null,
        categoryLocked: false
    }];
}

/**
 * Main function to process all groups
 */
export function populateSubgroups(groups: Group[], allRows: Map<string, EnrichedRow>): Group[] {
    return groups.map(group => {
        // Reconstruct rows for this group
        // The group structure from grouping.ts grouped rows, but we only stored counts/stats?
        // Wait, grouping.ts didn't store row IDs yet in Group interface?
        // The `Group` interface in types.ts does NOT have `rowIds`!
        // But `Subgroup` HAS `rowIds`.
        // And `grouping.ts` was implemented: `subgroups: []`.
        // So where did reference to rows go?

        // Ah, `grouping.ts` logic I wrote:
        // `map.set(key, []); map.get(key)!.push(row);`
        // It grouped them in memory but didn't output them in `Group` object?
        // We need to pass the rows *into* `computeSubgroups`. 
        // BUT `grouping.ts` returns `Group[]` which lost the row refs.

        // FIX: `grouping.ts` output is incomplete if we can't access rows later.
        // EITHER:
        // 1. `Group` should have `rowIds`.
        // 2. Or `groupRowsByMerchant` should call `computeSubgroups` immediately before returning.

        // Option 2 is cleaner for "pipeline" since grouping+subgrouping effectively organizes the rows.
        // However, I separated them.
        // Let's modify `grouping.ts` to call strict logic OR pass `groupedRows` separately?
        // The simplest is to do grouping & subgrouping in one pass or modify `Group` type.
        // But I can't modify `types.ts` easily now unless I rewrite it.
        // `Group` interface: `subgroups: Subgroup[]`. `Subgroup` has `rowIds`.
        // So `Group` indirectly has rows via subgroups.
        // Thus `grouping.ts` MUST populate valid subgroups (at least one) to preserve row refs.

        // I will fix `grouping.ts` in next step to call `computeSubgroups` internally.
        // This file `subgrouping.ts` provides the logic function `computeSubgroups` which `grouping.ts` should iterate.

        return group; // Placeholder, real logic will be called inside grouping
    });
}
