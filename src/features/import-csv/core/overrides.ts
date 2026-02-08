import { EnrichedRow, Group, Override, Subgroup } from "./types";

/**
 * Resolves the effective category for a row based on the hierarchy.
 */
export function resolveCategory(
    row: EnrichedRow,
    subgroup: Subgroup,
    group: Group,
    overrides: Override[]
): string | null {
    // 1. Check Row Override
    const rowOverride = overrides.find(o => o.targetId === row.id && o.level === "row");
    if (rowOverride) return rowOverride.categoryId;

    // 2. Check Subgroup Override (if locked)
    // Logic: if subgroup has category AND it is "locked" (applied to children), use it.
    // Actually, UI usually sets "locked" when user selects category for the subgroup.
    // We assume if `subgroup.categoryId` is set, it might be an override or suggestion?
    // Spec says: "When user sets category at subgroup level -> categoryLocked = true -> all rows inherit"
    if (subgroup.categoryLocked && subgroup.categoryId) return subgroup.categoryId;

    // 3. Check Group Override (if locked)
    if (group.categoryLocked && group.categoryId) return group.categoryId;

    // 4 Check for specific overrides in the array that target the group/subgroup but might not be "locked" on object?
    // We assume the state `group.categoryLocked` reflects the presence of such override application.
    // But strict functional approach might pass overrides array and we look up there too?
    // Spec says "Input: Group[], Override[]".
    // So we should check `overrides` array for group/subgroup IDs too logic-wise?
    // "Override" type has targetId.
    // If `overrides` contains { targetId: group.id, level: 'group' }, it implies we should use it.
    // Should we assume `Group` object is already mutated with this, or lookup here?
    // A pure lookup is safer.

    const subgroupOverride = overrides.find(o => o.targetId === subgroup.id && o.level === "subgroup");
    if (subgroupOverride) return subgroupOverride.categoryId;

    const groupOverride = overrides.find(o => o.targetId === group.id && o.level === "group");
    if (groupOverride) return groupOverride.categoryId;

    // 5. Use Suggestion
    return row.suggestedCategoryId || null;
}

/**
 * Apply overrides to update the structure state (Group/Subgroup properties)
 * This mutates or clones the structure to reflect "locked" state for UI?
 * Or just used for final payload build?
 * For payload build, we need the resolved category.
 * We'll export `resolveCategory` to be used in Payload stage.
 */
