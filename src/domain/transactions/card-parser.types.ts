export type CardParserSafetyLevel = "conservative" | "balanced" | "permissive"

export type CardNetwork =
    | "Mastercard"
    | "Visa"
    | "Bancomat"
    | "Amex"
    | "Maestro"
    | "Unknown"

export type WalletProvider = "Apple Pay" | "Google Pay" | "Other" | "Unknown"

export type CardParseConfidence = "high" | "medium"

export interface ParsedCardReference {
    last4: string
    network: CardNetwork
    walletProvider: WalletProvider
    confidence: CardParseConfidence
}
