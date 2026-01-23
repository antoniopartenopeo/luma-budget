/**
 * Payment Rails Definitions and Extractor
 */

export const PAYMENT_RAILS = [
    "APPLE PAY",
    "GOOGLE PAY",
    "PAYPAL",
    "SUMUP",
    "STRIPE",
    "CURVE",
    "SATISPAY",
    "AMAZON PAYMENT",
    "AMAZON PAY",
    "KLARNA",
    "SCALAPAY",
    "NEXI",
    "MOONEY",
    "POSTEPAY",
    "BANCOMAT PAY",
    // Generic rails that often appear as prefixes/suffixes
    "POS",
    "CARTA",
    "PAGAMENTO",
    "ADDEBITO",
    "PRELIEVO",
    "BONIFICO"
];

// Rails that act as marketplaces (may contain * or space separators)
export const MARKETPLACE_RAILS = [
    "PAYPAL",
    "SUMUP",
    "STRIPE",
    "AMAZON PAYMENT",
    "AMAZON PAY",
    "GOOGLE PAY",
    "APPLE PAY",
    "CURVE"
];

export interface PaymentRailResult {
    paymentRail: string | null;
    remainder: string;
}

/**
 * Extracts the payment rail and returns the remainder of the text.
 * The rail is REMOVED from the text to prevent it from competing as a merchant.
 */
export function extractPaymentRail(normalizedText: string): PaymentRailResult {
    let bestRail: string | null = null;
    let remainder = normalizedText;

    // Check for rails - longest match first
    const sortedRails = [...PAYMENT_RAILS].sort((a, b) => b.length - a.length);

    for (const rail of sortedRails) {
        // We look for the rail as a distinct word (surrounded by bounds or start/end)
        // Note: normalizedText is expected to be uppercase and trimmed
        const regex = new RegExp(`(^|\\s|\\*)${rail}($|\\s|\\*)`);

        if (regex.test(remainder)) {
            bestRail = rail;
            // Remove the rail from the text, replacing with space to maintain separation
            remainder = remainder.replace(rail, " ").trim();
            // Clean up potential double spaces or leading/trailing separators created by removal
            remainder = remainder.replace(/\s+/g, " ").replace(/^\*|\*$/g, "").trim();
            break; // Stop after first rail found (usually the most significant one due to sorting)
        }
    }

    return {
        paymentRail: bestRail,
        remainder: remainder
    };
}
