import {
    CardParserSafetyLevel,
    CardNetwork,
    ParsedCardReference,
    WalletProvider
} from "./card-parser.types"

const HIGH_CONFIDENCE_PATTERNS: RegExp[] = [
    /\b(?:CARTA|CARD)\s*[:#-]?\s*(?:\*+|X+)?\s*(\d{4})\b/i,
    /\b(?:NUM(?:ERO)?\s*CARTA|PAN)\s*[:#-]?\s*(?:\*+|X+)?\s*(\d{4})\b/i
]

const DATE_FRAGMENT_PATTERN = /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/g
const PAN_SEGMENT_PATTERN = /\b\d{4}(?:\s+\d{4}){2,3}\b/

const QUICK_GUARD_PATTERN =
    /\b(CARTA|CARD|DEBIT|CREDIT|APPLE PAY|GOOGLE PAY|MASTERCARD|VISA|AMEX|AMERICAN EXPRESS|BANCOMAT|MAESTRO|NFC|E-COMMERCE)\b|(?:\*{1,}|X{2,})\s*\d{4}\b/i

const STRONG_CONTEXT_PATTERN =
    /\b(CARTA|CARD|DEBIT|CREDIT|APPLE PAY|GOOGLE PAY|MASTERCARD|VISA|AMEX|AMERICAN EXPRESS|BANCOMAT|MAESTRO|NFC|POS|E-COMMERCE)\b/i

const OTHER_WALLET_HINT_PATTERN =
    /\b(PAYPAL|CURVE|SATISPAY|BANCOMAT PAY|NEXI|MOONEY|POSTEPAY|KLARNA|SCALAPAY|STRIPE|SUMUP)\b/i

interface MediumCandidate {
    last4: string
    index: number
}

function normalizeDescription(description: string): string {
    return description
        .toUpperCase()
        .replace(/[()[\]{}'"\\,@#$%^&+=]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
}

function resolveNetwork(text: string): CardNetwork {
    if (/\b(AMERICAN EXPRESS|AMEX)\b/.test(text)) return "Amex"
    if (/\b(MASTERCARD|MC)\b/.test(text)) return "Mastercard"
    if (/\bVISA\b/.test(text)) return "Visa"
    if (/\bBANCOMAT\b/.test(text)) return "Bancomat"
    if (/\bMAESTRO\b/.test(text)) return "Maestro"
    return "Unknown"
}

function resolveWalletProvider(text: string): WalletProvider {
    if (/\bAPPLE PAY\b/.test(text)) return "Apple Pay"
    if (/\bGOOGLE PAY\b/.test(text)) return "Google Pay"
    if (OTHER_WALLET_HINT_PATTERN.test(text)) return "Other"
    return "Unknown"
}

function hasStrongContext(text: string, index: number, length: number): boolean {
    const contextStart = Math.max(0, index - 25)
    const contextEnd = Math.min(text.length, index + length + 25)
    const contextWindow = text.slice(contextStart, contextEnd)
    return STRONG_CONTEXT_PATTERN.test(contextWindow)
}

function extractHighConfidenceLast4(text: string): string | null {
    for (const pattern of HIGH_CONFIDENCE_PATTERNS) {
        const match = text.match(pattern)
        if (match?.[1]) return match[1]
    }
    return null
}

function shouldAcceptMediumCandidate(
    safetyLevel: CardParserSafetyLevel,
    candidate: MediumCandidate,
    text: string,
    network: CardNetwork,
    walletProvider: WalletProvider
): boolean {
    const hasContext = hasStrongContext(text, candidate.index, candidate.last4.length)

    if (safetyLevel === "conservative") return false
    if (safetyLevel === "balanced") return hasContext

    return hasContext || network !== "Unknown" || walletProvider !== "Unknown"
}

function extractMediumConfidenceLast4(
    text: string,
    safetyLevel: CardParserSafetyLevel,
    network: CardNetwork,
    walletProvider: WalletProvider
): string | null {
    const textWithoutDates = text.replace(DATE_FRAGMENT_PATTERN, " ")

    for (const match of textWithoutDates.matchAll(/(?:\*{1,}|X{2,})\s*(\d{4})\b/g)) {
        const rawLast4 = match[1]
        const matchIndex = match.index ?? -1
        if (!rawLast4 || matchIndex < 0) continue

        if (shouldAcceptMediumCandidate(
            safetyLevel,
            { last4: rawLast4, index: matchIndex },
            textWithoutDates,
            network,
            walletProvider
        )) {
            return rawLast4
        }
    }

    for (const match of textWithoutDates.matchAll(/\b(\d{4})\b/g)) {
        const rawLast4 = match[1]
        const matchIndex = match.index ?? -1
        if (!rawLast4 || matchIndex < 0) continue

        const prevChar = textWithoutDates[matchIndex - 1] || ""
        const nextChar = textWithoutDates[matchIndex + rawLast4.length] || ""
        if (/[\/\-.]/.test(prevChar) || /[\/\-.]/.test(nextChar)) {
            continue
        }

        const panProbeStart = Math.max(0, matchIndex - 12)
        const panProbeEnd = Math.min(textWithoutDates.length, matchIndex + rawLast4.length + 16)
        const panProbe = textWithoutDates.slice(panProbeStart, panProbeEnd)
        if (PAN_SEGMENT_PATTERN.test(panProbe)) {
            continue
        }

        if (shouldAcceptMediumCandidate(
            safetyLevel,
            { last4: rawLast4, index: matchIndex },
            textWithoutDates,
            network,
            walletProvider
        )) {
            return rawLast4
        }
    }

    return null
}

export function parseCardFromDescription(
    description: string,
    safetyLevel: CardParserSafetyLevel = "balanced"
): ParsedCardReference | null {
    if (!description || description.trim().length === 0) return null

    const normalized = normalizeDescription(description)
    if (!normalized || !QUICK_GUARD_PATTERN.test(normalized)) return null

    const network = resolveNetwork(normalized)
    const walletProvider = resolveWalletProvider(normalized)

    const highLast4 = extractHighConfidenceLast4(normalized)
    if (highLast4) {
        return {
            last4: highLast4,
            network,
            walletProvider,
            confidence: "high"
        }
    }

    const mediumLast4 = extractMediumConfidenceLast4(normalized, safetyLevel, network, walletProvider)
    if (mediumLast4) {
        return {
            last4: mediumLast4,
            network,
            walletProvider,
            confidence: "medium"
        }
    }

    return null
}

export type {
    CardNetwork,
    CardParseConfidence,
    CardParserSafetyLevel,
    ParsedCardReference,
    WalletProvider
} from "./card-parser.types"
