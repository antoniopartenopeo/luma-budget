/**
 * Brand normalization dictionary
 * Maps common variations to canonical brand names
 */
export const BRAND_DICT: Record<string, string> = {
    // Supermarkets
    "ESSE LUNGA": "ESSELUNGA",
    "ESSELUNGA VIA": "ESSELUNGA",
    "ESSELUNGA VIALE": "ESSELUNGA",
    "COOP ITALIA": "COOP",
    "COOP LOMBARDIA": "COOP",
    "CONAD CITY": "CONAD",
    "CONAD SUPERSTORE": "CONAD",
    "CARREFOUR EXPRESS": "CARREFOUR",
    "CARREFOUR MARKET": "CARREFOUR",
    "EUROSPIN ITALIA": "EUROSPIN",
    "LIDL ITALIA": "LIDL",

    // Fast Food
    "MC DONALD": "MCDONALD",
    "MC DONALDS": "MCDONALD",
    "MCDONALDS": "MCDONALD",
    "BURGER KING": "BURGERKING",
    "OLD WILD": "OLDWILDWEST",

    // Services
    "AUTOSTRADE PER": "AUTOSTRADE",
    "TELEPASS PAY": "TELEPASS",

    // Streaming
    "NETFLIX COM": "NETFLIX",
    "SPOTIFY AB": "SPOTIFY",
    "APPLE COM": "APPLE",
    "DISNEY PLUS": "DISNEYPLUS",

    // Utilities
    "ENEL ENERGIA": "ENEL",
    "A2A ENERGIA": "A2A",

    // Marketplaces (special handling)
    "AMAZON EU": "AMAZON",
    "AMAZON PRIME": "AMAZON PRIME",
    "AMAZON PAYMENTS": "AMAZON",
    "PAYPAL EUROPE": "PAYPAL",
    "SUMUP": "SUMUP",
};

/**
 * Known marketplace/aggregator prefixes
 * These may have sub-merchant info after a separator
 */
export const MARKETPLACE_PREFIXES = [
    "AMAZON",
    "PAYPAL",
    "SUMUP",
    "STRIPE",
    "SQUARE",
    "KLARNA",
    "SATISPAY",
];

/**
 * Separator patterns for sub-merchant extraction
 */
export const SUB_MERCHANT_SEPARATORS = [
    "*",
    " - ",
    "MARKETPLACE",
    "SELLER",
    "PAGAMENTO A",
];
