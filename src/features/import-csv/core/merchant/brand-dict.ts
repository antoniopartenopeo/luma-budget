/**
 * Brand normalization dictionary
 * Maps common variations to canonical brand names
 */
export const BRAND_DICT: Record<string, string> = {
    // Supermarkets
    "ESSELUNGA": "ESSELUNGA",
    "ESSE LUNGA": "ESSELUNGA",
    "COOP": "COOP",
    "CONAD": "CONAD",
    "CARREFOUR": "CARREFOUR",
    "EUROSPIN": "EUROSPIN",
    "LIDL": "LIDL",
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
    "BURGER KING": "BURGER KING",
    "BURGERKING": "BURGER KING",
    "OLD WILD": "OLDWILDWEST",
    "OLD WILD WEST": "OLDWILDWEST",

    // Services
    "AUTOSTRADE": "AUTOSTRADE",
    "AUTOSTRADE PER": "AUTOSTRADE",
    "TELEPASS": "TELEPASS",
    "TELEPASS PAY": "TELEPASS",
    "STARBUCKS": "STARBUCKS",
    "SHELL": "SHELL",

    // Streaming & Tech
    "NETFLIX": "NETFLIX",
    "SPOTIFY": "SPOTIFY",
    "APPLE": "APPLE",
    "GOOGLE": "GOOGLE",
    "AMAZON": "AMAZON",
    "DISNEY PLUS": "DISNEYPLUS",
    "DISNEYPLUS": "DISNEYPLUS",
    "NETFLIX COM": "NETFLIX",
    "SPOTIFY AB": "SPOTIFY",
    "APPLE COM": "APPLE",

    // Clothing
    "ZARA": "ZARA",
    "H&M": "H&M",
    "H M": "H&M",
    "ZARA ROMA": "ZARA",
    "ZARA MILANO": "ZARA",
    "AMZN": "AMAZON",

    // Tech
    "FACEBOOK": "FACEBOOK",

    // Restaurants
    "RISTORANTE DA GINO": "RISTORANTE DA GINO",

    // Utilities
    "ENEL": "ENEL",
    "A2A": "A2A",
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
 * Bridge tokens often found between marketplace and sub-merchant
 * e.g., "AMAZON *MARKETPLACE* ACME"
 */
export const BRIDGE_TOKENS = [
    "MARKETPLACE",
    "MKTP",
    "EU",
    "SRL",
    "SPA",
    "LU",
    "IE",
    "IT",
    "FR",
    "DE",
    "ES",
    "UK",
    "GB",
    "COM"
];

/**
 * Separator patterns for sub-merchant extraction
 */
export const SUB_MERCHANT_SEPARATORS = [
    " * ",
    " *",
    "* ",
    "*",
    " # ",
    " - ",
    " / ",
    " : ",
    "@",
    "PAGAMENTO A ",
    "SELLER ",
    "MARKETPLACE ",
    "MKTP "
];
