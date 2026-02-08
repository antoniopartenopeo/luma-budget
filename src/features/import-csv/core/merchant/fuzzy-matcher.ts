/**
 * Fuzzy Matcher v1.0
 * 
 * Provides approximate string matching using Levenshtein distance.
 * Used to match merchant names with typos/variations to known brands.
 */

/**
 * Calculate Levenshtein distance between two strings.
 * This is the minimum number of single-character edits needed to transform one into the other.
 */
function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Calculate similarity ratio between two strings (0-1).
 * 1 = identical, 0 = completely different.
 */
export function similarityRatio(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
    const maxLength = Math.max(a.length, b.length);

    return 1 - distance / maxLength;
}

/**
 * Configuration for fuzzy matching
 */
export interface FuzzyMatchOptions {
    /** Minimum similarity ratio to consider a match (0-1). Default: 0.85 */
    threshold?: number;
    /** Maximum length difference to even attempt matching. Default: 3 */
    maxLengthDiff?: number;
}

const DEFAULT_OPTIONS: Required<FuzzyMatchOptions> = {
    threshold: 0.85,
    maxLengthDiff: 3,
};

/**
 * Find the best fuzzy match for an input string from a dictionary.
 * 
 * @param input The string to match
 * @param dictionary Array of possible match targets
 * @param options Matching configuration
 * @returns The best matching string from dictionary, or null if no match above threshold
 */
export function fuzzyMatch(
    input: string,
    dictionary: string[],
    options: FuzzyMatchOptions = {}
): string | null {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const normalizedInput = input.toUpperCase().trim();

    if (normalizedInput.length < 3) return null; // Too short for fuzzy matching

    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const candidate of dictionary) {
        // Skip if length difference is too large
        if (Math.abs(candidate.length - normalizedInput.length) > opts.maxLengthDiff) {
            continue;
        }

        const score = similarityRatio(normalizedInput, candidate);

        if (score > bestScore && score >= opts.threshold) {
            bestScore = score;
            bestMatch = candidate;
        }
    }

    return bestMatch;
}

/**
 * Batch fuzzy match with result details.
 * Useful for debugging and testing.
 */
export interface FuzzyMatchResult {
    input: string;
    match: string | null;
    score: number;
}

export function fuzzyMatchWithScore(
    input: string,
    dictionary: string[],
    options: FuzzyMatchOptions = {}
): FuzzyMatchResult {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const normalizedInput = input.toUpperCase().trim();

    if (normalizedInput.length < 3) {
        return { input, match: null, score: 0 };
    }

    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const candidate of dictionary) {
        if (Math.abs(candidate.length - normalizedInput.length) > opts.maxLengthDiff) {
            continue;
        }

        const score = similarityRatio(normalizedInput, candidate);

        if (score > bestScore && score >= opts.threshold) {
            bestScore = score;
            bestMatch = candidate;
        }
    }

    return { input, match: bestMatch, score: bestScore };
}
