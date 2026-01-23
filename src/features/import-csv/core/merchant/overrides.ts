/**
 * Merchant Overrides
 * 
 * First priority lookup table for merchant recognition.
 * Maps exact NORMALIZED description (or clean description) to the desired Merchant Key.
 * 
 * Future: Load this from DB/User Config.
 */

export const MERCHANT_OVERRIDES: Map<string, string> = new Map([
    // Example: ["PAGAMENTO POS BAR DA GINO", "BAR DA GINO"]
]);

export function getOverride(normalizedDescription: string): string | null {
    if (MERCHANT_OVERRIDES.has(normalizedDescription)) {
        return MERCHANT_OVERRIDES.get(normalizedDescription) || null;
    }
    return null;
}
