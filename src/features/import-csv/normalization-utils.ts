/**
 * Normalization Utilities
 * 
 * Shared normalization and tokenization for CSV Import feature.
 * Used by both dedup and grouping logic.
 * 
 * Key concepts:
 * - normalizeBase: basic cleanup (lowercase, collapse whitespace, remove punctuation)
 * - tokenizeDescription: split into tokens for pattern analysis
 * - generatePatternKey: deterministic key for grouping by repeated patterns
 */

import type { TransactionType } from "@/features/transactions/api/types"

// ============================================================================
// STOPWORDS & BLACKLISTS
// ============================================================================

/**
 * Banking operation prefixes - always removed
 * These indicate the type of operation, not the merchant
 */
const BANKING_PREFIXES = new Set([
    // Italian banking terms
    "pagamento", "addebito", "bonifico", "prelievo", "versamento",
    "rid", "mav", "rata", "commissione", "canone", "interessi",
    // Card/POS
    "carta", "pos", "atm", "bancomat", "contactless",
    // SEPA/International
    "sepa", "dd", "sdd", "sct", "swift", "iban",
    // Online
    "online", "internet", "homebanking", "app",
    // Other
    "accredito", "ricarica", "giroconto", "storno", "rimborso"
])

/**
 * Legal/generic suffixes - removed because too common
 * These are corporate structure indicators, not useful for grouping
 */
const LEGAL_GENERICS = new Set([
    // Corporate structures
    "srl", "spa", "snc", "sas", "sapa", "srls", "soc", "societa",
    "ltd", "llc", "inc", "corp", "gmbh", "ag", "bv", "sarl", "sa",
    // Geographic
    "italia", "italy", "eu", "europe", "uk", "usa", "de", "fr", "es",
    // Generic qualifiers
    "service", "services", "servizi", "group", "gruppo", "holding",
    "international", "intl", "global", "worldwide"
])

/**
 * Stopwords - removed because they add no grouping value
 */
const STOPWORDS = new Set([
    // Italian prepositions/articles
    "di", "da", "del", "della", "dei", "delle", "al", "alla", "per", "con", "su",
    "il", "la", "lo", "le", "gli", "un", "una", "uno",
    // Reference markers
    "ord", "ordine", "ref", "rif", "id", "nr", "num", "numero", "cod", "codice",
    // Date/time
    "data", "ore", "gg", "mm", "aa",
    // Transaction markers
    "del", "alle", "presso", "conto", "vs", "vostro", "ns", "nostro"
])

// ============================================================================
// NORMALIZATION
// ============================================================================

/**
 * Base normalization - shared between dedup and grouping
 * - Lowercase
 * - Collapse whitespace
 * - Remove non-alphanumeric except spaces
 */
export function normalizeBase(raw: string): string {
    return raw
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[^\w\s]/g, "")
        .trim()
}

// ============================================================================
// TOKENIZATION
// ============================================================================

/**
 * Tokenizes a description into individual tokens
 */
export function tokenizeDescription(raw: string): string[] {
    const normalized = normalizeBase(raw)
    return normalized.split(/\s+/).filter(t => t.length > 0)
}

/**
 * Token classification result
 */
export type TokenClass = "useful" | "stopword" | "variable" | "legal_generic" | "banking_prefix"

/**
 * Classifies a token for pattern key generation
 */
export function classifyToken(token: string): TokenClass {
    // Variable patterns (IDs, dates, codes)
    // Long numbers (4+ digits)
    if (/^\d{4,}$/.test(token)) return "variable"
    // Date-like patterns (12/01/2024, 2024-01-12)
    if (/^\d{1,4}[-/]\d{1,2}([-/]\d{2,4})?$/.test(token)) return "variable"
    // Alphanumeric codes with numbers (ORD123, 402xyz)
    if (/\d{3,}/.test(token)) return "variable"
    // UUID-like patterns
    if (/^[a-f0-9]{8,}$/.test(token)) return "variable"

    // Banking prefixes
    if (BANKING_PREFIXES.has(token)) return "banking_prefix"

    // Legal/generic
    if (LEGAL_GENERICS.has(token)) return "legal_generic"

    // Stopwords
    if (STOPWORDS.has(token)) return "stopword"

    // Very short tokens (1-2 chars) are usually noise
    if (token.length <= 2) return "stopword"

    return "useful"
}

/**
 * Extracts useful tokens from a description
 */
export function extractUsefulTokens(raw: string): string[] {
    const tokens = tokenizeDescription(raw)
    return tokens.filter(t => classifyToken(t) === "useful")
}

// ============================================================================
// PATTERN KEY GENERATION
// ============================================================================

/**
 * Generates a deterministic pattern key for grouping
 * 
 * Algorithm:
 * 1. Tokenize description
 * 2. Filter to useful tokens only
 * 3. Join with space
 * 4. If ≤1 useful token, fallback to merchantKey (first 3 words)
 * 5. Append type (|expense or |income)
 */
export function generatePatternKey(
    description: string,
    type: TransactionType
): { patternKey: string; merchantKey: string; isFallback: boolean } {
    const usefulTokens = extractUsefulTokens(description)
    const merchantKey = extractMerchantKey(description)

    // Fallback if pattern too sparse
    if (usefulTokens.length <= 1) {
        return {
            patternKey: `${merchantKey}|${type}`,
            merchantKey,
            isFallback: true
        }
    }

    // Build pattern key from useful tokens (sorted for stability)
    // Note: we don't sort to preserve word order which may be meaningful
    const pattern = usefulTokens.join(" ")

    return {
        patternKey: `${pattern}|${type}`,
        merchantKey,
        isFallback: false
    }
}

/**
 * Legacy merchantKey extraction (first 3 significant words)
 * Used as fallback and for display name
 */
export function extractMerchantKey(description: string): string {
    const normalized = normalizeBase(description)

    // Remove banking prefixes from start
    let cleaned = normalized
    for (const prefix of BANKING_PREFIXES) {
        const regex = new RegExp(`^${prefix}\\s+`, "i")
        cleaned = cleaned.replace(regex, "")
    }

    // Remove dates
    cleaned = cleaned.replace(/\d{2}\/\d{2}\/\d{4}/g, "")
    cleaned = cleaned.replace(/\d{4,}/g, "")
    cleaned = cleaned.trim()

    // Take first 3 words
    const words = cleaned.split(/\s+/).filter(w => w.length > 1)
    const key = words.slice(0, 3).join(" ")

    return key || "altro"
}

/**
 * Capitalizes words for display
 */
export function capitalizeWords(str: string): string {
    return str
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
}

// ============================================================================
// EXPORTS FOR TESTING
// ============================================================================

export const __test__ = {
    BANKING_PREFIXES,
    LEGAL_GENERICS,
    STOPWORDS
}
