/**
 * Payment Rails Definitions and Extractor
 */

export const PAYMENT_RAILS = [
    // Digital wallets
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
    // Card networks (should be stripped, not extracted as merchant)
    "MASTERCARD NFC",
    "MASTERCARD E-COMMERCE",
    "MASTERCARD",
    "VISA NFC",
    "VISA",
    "MAESTRO",
    "AMERICAN EXPRESS",
    "AMEX",
    "NFC",
    "E-COMMERCE",
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
 * The rails are REMOVED from the text to prevent them from competing as merchants.
 * v2: Now removes ALL matching rails, not just the first one.
 */
export function extractPaymentRail(normalizedText: string): PaymentRailResult {
    const foundRails: string[] = [];
    let remainder = normalizedText;

    // Check for rails - longest match first
    const sortedRails = [...PAYMENT_RAILS].sort((a, b) => b.length - a.length);

    // Keep removing rails until no more are found
    let changed = true;
    while (changed) {
        changed = false;
        for (const rail of sortedRails) {
            // Escape special regex characters in rail name
            const escapedRail = rail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // We look for the rail as a distinct word
            const regex = new RegExp(`(^|\\s|\\*)${escapedRail}($|\\s|\\*)`, "gi");

            if (regex.test(remainder)) {
                if (!foundRails.includes(rail)) {
                    foundRails.push(rail);
                }
                // Remove ALL occurrences of this rail
                remainder = remainder.replace(new RegExp(`(^|\\s)${escapedRail}(\\s|$)`, "gi"), " ");
                // Clean up potential double spaces
                remainder = remainder.replace(/\s+/g, " ").replace(/^\*|\*$/g, "").trim();
                changed = true;
            }
        }
    }

    return {
        paymentRail: foundRails.length > 0 ? foundRails[0] : null, // Return first for compatibility
        remainder: remainder
    };
}
