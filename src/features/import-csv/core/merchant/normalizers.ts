/**
 * Normalizers for merchant key extraction
 * Steps 1-3 of the pipeline
 */

// Italian stopwords and common suffixes to remove
const STOPWORDS = new Set([
    // Articles and prepositions
    "DI", "IL", "LA", "LO", "LE", "GLI", "UN", "UNA", "DA", "IN", "SU", "PER", "CON", "TRA", "FRA", "DEL", "DELLA", "DELLO", "DEI", "DEGLI", "DELLE", "AL", "ALLA", "ALLO", "AI", "AGLI", "ALLE",
    // Countries/regions
    // Countries/regions
    "IT", "ITA", "ITALIA", "ITALY",
    // Legal suffixes
    "SRL", "S.R.L.", "SPA", "S.P.A.", "SRLS", "SNC", "SAS", "LTD", "GMBH", "LLC", "INC", "CORP", "AG", "SA", "BV", "NV",
    // Address components
    "VIA", "VIALE", "PIAZZA", "CORSO", "LARGO", "VICOLO", "PIAZZALE", "STRADA", "CONTRADA",
    // Numbers and codes
    "NR", "N.", "TEL", "FAX", "NUM",
    // Currency
    "EUR", "USD", "CHF", "GBP",
    // Common noise
    "PAGAMENTO", "TRANSAZIONE", "OPERAZIONE", "CARTA", "BANCOMAT",
]);

// Common prefixes to strip
const PREFIXES = [
    "POS ",
    "PAGAMENTO ",
    "BONIFICO ",
    "ADDEBITO ",
    "ACQUISTO ",
    "OP. ",
    "PRELIEVO ",
    "ATM ",
    "SEPA ",
    "DISP. ",
    "DISPOSIZIONE ",
    "GIROCONTO ",
    "COMMISSIONE ",
];

// Bank-specific patterns (regex)
const BANK_PATTERNS = [
    /^OPERAZIONE\s+/i,
    /^TRANSAZIONE\s+/i,
    /^MOVIMENTO\s+/i,
    /^CARTA\s+\d+\s+/i,
    /^POS\s+\d{2}\.\d{2}\s+/i, // POS with date
];

// Patterns to remove
const NOISE_PATTERNS = [
    /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g,  // Dates
    /\d{8,}/g,                                   // Long IDs
    /[\*X]{4,}\d{0,4}/g,                        // Masked cards
    /\d{6,}/g,                                   // 6+ digit sequences
    /[.,;:!?()'"\[\]{}@#$%\^&\*+=/]/g            // Punctuation (added * and /)
];

/**
 * Step 1: Normalize - uppercase and basic cleanup
 */
export function normalize(description: string): string {
    return description.toUpperCase().trim();
}

/**
 * Step 2: Strip prefixes
 */
export function stripPrefixes(normalized: string): string {
    let result = normalized;

    // Strip static prefixes
    for (const prefix of PREFIXES) {
        if (result.startsWith(prefix)) {
            result = result.substring(prefix.length);
        }
    }

    // Strip bank-specific patterns
    for (const pattern of BANK_PATTERNS) {
        result = result.replace(pattern, "");
    }

    return result.trim();
}

/**
 * Step 3: Clean noise patterns
 */
export function cleanNoise(text: string): string {
    let result = text;

    for (const pattern of NOISE_PATTERNS) {
        result = result.replace(pattern, " ");
    }

    // New in v2.1: Remove trailing locations (e.g., RM IT, DE)
    // Only strip 2-letter codes (Country, Province) at the end
    const locationPattern = /(\s+[A-Z]{2})+$/;
    if (locationPattern.test(result)) {
        result = result.replace(locationPattern, "");
    }

    return result.trim();
}

/**
 * Filter out stopwords from tokens
 */
export function filterStopwords(tokens: string[]): string[] {
    // v2.1: Allow 2-letter tokens (MC, HM) but filter confirmed stopwords
    return tokens.filter(t => (t.length >= 2 || /^[A-Z0-9]$/.test(t)) && !STOPWORDS.has(t));
}

/**
 * Tokenize a string into words
 */
export function tokenize(text: string): string[] {
    return text.split(/\s+/).filter(t => t.length > 0);
}
