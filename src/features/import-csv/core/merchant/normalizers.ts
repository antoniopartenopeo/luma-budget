/**
 * Normalizers for merchant key extraction
 * Steps 1-3 of the pipeline
 */

// Italian stopwords and common suffixes to remove
const STOPWORDS = new Set([
    // Articles and prepositions
    "DI", "IL", "LA", "LO", "LE", "GLI", "UN", "UNA", "DA", "IN", "SU", "PER", "CON", "TRA", "FRA", "DEL", "DELLA", "DELLO", "DEI", "DEGLI", "DELLE", "AL", "ALLA", "ALLO", "AI", "AGLI", "ALLE",
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
const NOISE_PATTERNS: RegExp[] = [
    // Italian date prefix: "del 31/01/2026" or "DEL 31.01.26"
    /\bDEL\s+\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/gi,
    // Malformed bank date: "del 17/0CARTA" or "del 24/1CARTA" (date merged with CARTA)
    /\bDEL\s+\d{1,2}[\/\-\.]\d?CARTA\b/gi,
    // Partial date prefix: "del 17/" or "del 24"
    /\bDEL\s+\d{1,2}[\/\-\.]?\s*/gi,
    // Standard dates
    /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g,
    // Malformed CARTA patterns: "0CARTA", "1CARTA" (digit stuck to CARTA)
    /\b\d?CARTA\b/gi,
    // Card number with amount: "*7298 DI EUR 25,04"
    /\*\d{4,}\s+DI\s+EUR\s+\d+[,.]\d{2}/gi,
    // Card number pattern alone
    /\*\d{4,}/g,
    // DI EUR amount (standalone)
    /\bDI\s+EUR\s+\d+[,.]\d{2}\b/gi,
    // Long IDs (8+ digits)
    /\d{8,}/g,
    // Masked cards
    /[\*X]{4,}\d{0,4}/g,
    // 6+ digit sequences
    /\d{6,}/g,
    // Punctuation (keep *)
    /[.,;:!?()'"\[\]{}@#$%\^&+=/]/g,
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

const COMMON_CITIES = [
    "ROMA", "MILANO", "TORINO", "NAPOLI", "FIRENZE", "BOLOGNA", "GENOVA", "VENEZIA", "VERONA", "BARI",
    "LONDRA", "PARIGI", "DUBLIN", "LUXEMBOURG", "AMSTERDAM", "BERLIN", "MADRID", "BARCELONA"
];

/**
 * Step 4b: Strip positional noise (Cities, Country Codes)
 * Only if they appear at the END of the string and aren't the only word.
 */
export function stripPositionalNoise(text: string): string {
    let result = text;
    const tokens = result.split(/\s+/);

    if (tokens.length <= 1) return result;

    // 1. Country codes (2 chars uppercase at end)
    // Already handled loosely in cleanNoise v2.1, but let's be strict here.
    const lastToken = tokens[tokens.length - 1];

    if (lastToken.length === 2 && /^[A-Z]{2}$/.test(lastToken)) {
        // Remove it
        result = result.substring(0, result.lastIndexOf(lastToken)).trim();
    }

    // 2. Common Cities
    // Check if the NEW last token (after country strip) is a city
    if (result.length > 0) {
        const currentTokens = result.split(/\s+/);
        if (currentTokens.length > 1) {
            const currentLast = currentTokens[currentTokens.length - 1];
            if (COMMON_CITIES.includes(currentLast)) {
                result = result.substring(0, result.lastIndexOf(currentLast)).trim();
            }
        }
    }

    return result;
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
