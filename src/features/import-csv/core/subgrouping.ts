import { formatCents } from "@/domain/money/currency";
import { EnrichedRow, Group, Subgroup } from "./types";

/**
 * Computes subgroups based on EXACT amountCents clustering.
 * 
 * Rules:
 * - Subgroup for each amountCents with ≥2 occurrences (recurring pattern)
 * - Single occurrences aggregated into "Varie" (only if recurring exist)
 * - If no recurring patterns, return single "All Items" subgroup
 * - Always sorted descending by absolute total
 */
export function computeSubgroups(group: Group, rows: EnrichedRow[]): Subgroup[] {
    // Edge case: single or no rows
    if (rows.length <= 1) {
        return [{
            id: crypto.randomUUID(),
            label: "Tutti",
            rowIds: rows.map(r => r.id),
            categoryId: null,
            categoryLocked: false
        }];
    }

    // Group by exact amountCents
    const amountMap = new Map<number, EnrichedRow[]>();
    for (const row of rows) {
        const amount = row.amountCents;
        if (!amountMap.has(amount)) amountMap.set(amount, []);
        amountMap.get(amount)!.push(row);
    }

    // Separate recurring (≥2) from singles
    const recurring: Array<{ amount: number; rows: EnrichedRow[] }> = [];
    const singles: EnrichedRow[] = [];

    for (const [amount, amountRows] of amountMap.entries()) {
        if (amountRows.length >= 2) {
            recurring.push({ amount, rows: amountRows });
        } else {
            singles.push(...amountRows);
        }
    }

    // If no recurring patterns exist, return single subgroup
    if (recurring.length === 0) {
        return [{
            id: crypto.randomUUID(),
            label: "Tutti",
            rowIds: rows.map(r => r.id),
            categoryId: null,
            categoryLocked: false
        }];
    }

    // Build subgroups
    const subgroups: Subgroup[] = [];

    // Add recurring subgroups
    for (const { amount, rows: amountRows } of recurring) {
        subgroups.push({
            id: crypto.randomUUID(),
            label: formatCents(Math.abs(amount)),
            rowIds: amountRows.map(r => r.id),
            categoryId: null,
            categoryLocked: false
        });
    }

    // Add "Varie" for singles if any
    if (singles.length > 0) {
        subgroups.push({
            id: crypto.randomUUID(),
            label: "Varie",
            rowIds: singles.map(r => r.id),
            categoryId: null,
            categoryLocked: false
        });
    }

    // Sort descending by absolute total
    subgroups.sort((a, b) => {
        const totalA = a.rowIds.reduce((sum, id) => {
            const row = rows.find(r => r.id === id);
            return sum + (row ? Math.abs(row.amountCents) : 0);
        }, 0);
        const totalB = b.rowIds.reduce((sum, id) => {
            const row = rows.find(r => r.id === id);
            return sum + (row ? Math.abs(row.amountCents) : 0);
        }, 0);
        return totalB - totalA;
    });

    return subgroups;
}
