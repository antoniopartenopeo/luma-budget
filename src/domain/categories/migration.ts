/**
 * Migration map for legacy category IDs (kebab-case or outdated) to new snake_case system IDs.
 * Used by repository loaders to ensure existing data doesn't break.
 */
export const LEGACY_CATEGORY_ID_MAP: Record<string, string> = {
    // Exact kebab-to-snake renames
    "hobby-sport": "hobby_sport",
    "micro-digitali": "micro_digitali",
    "giochi-scommesse": "giochi_scommesse",
    "extra-impulsivi": "extra_impulsivi",
    "regali-ricevuti": "regali_ricevuti",
    "entrate-occasionali": "entrate_occasionali",
    "formazione-extra": "libri_cultura",

    // Concept renames / merges
    "affitti": "affitti_percepiti",
    "rendite": "investimenti_profitti",
    "bonus": "bonus_premi",
    "cashback": "cashback_punti",
    "servizi-domestici": "manutenzione_casa",
    "lavoro-essenziale": "altro_essenziale",
    "casa": "affitto_mutuo",
    "svago": "svago_extra",
    "salute": "salute_farmacia",
    "auto": "auto_carburante",
    "arredo": "casa_arredo",
    "investimenti": "investimenti_profitti",
    "altro": "altro_superfluo"
};

/**
 * Migrates a legacy ID to the new one if a mapping exists.
 */
export function migrateCategoryId(id: string): string {
    return LEGACY_CATEGORY_ID_MAP[id] || id;
}
