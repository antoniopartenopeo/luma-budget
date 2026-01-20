/**
 * Parses a currency string into integer cents.
 * Handles both EU (1.234,56) and US (1,234.56) formats.
 * 
 * @param input The currency string to parse (e.g., "€1.234,56", "-30.00", "15")
 * @returns The value in cents as an integer (signed)
 */
export function parseCurrencyToCents(input: string): number {
    if (!input) return 0

    // 1. Determine sign
    const isNegative = input.includes("-")

    // 2. Extract digits and decimal separators (. or ,)
    // We keep only digits and the last separator as potential decimal point
    const cleaned = input.replace(/[^\d.,]/g, "")

    if (!cleaned) return 0

    // 3. Find the occurrences of decimal separators
    const lastDot = cleaned.lastIndexOf(".")
    const lastComma = cleaned.lastIndexOf(",")
    const lastSeparatorIndex = Math.max(lastDot, lastComma)

    // 4. If no separator found, it's a whole number
    if (lastSeparatorIndex === -1) {
        return (parseInt(cleaned, 10) || 0) * 100 * (isNegative ? -1 : 1)
    }

    // 5. Heuristic for ambiguous single separator
    // If there's only ONE separator (of any type) and it's followed by EXACTLY 3 digits,
    // we assume it's a thousand separator (e.g. "1.234" -> 1234.00)
    // UNLESS there are other separators earlier (already handled by lastSeparatorIndex logic).
    const dotCount = (cleaned.match(/\./g) || []).length
    const commaCount = (cleaned.match(/,/g) || []).length
    const isSingleSeparator = (dotCount + commaCount) === 1

    const fractionalPartRaw = cleaned.substring(lastSeparatorIndex + 1)
    if (isSingleSeparator && fractionalPartRaw.length === 3) {
        // Treat as whole number (thousand separator)
        const wholeUnits = parseInt(cleaned.replace(/\D/g, ""), 10) || 0
        return wholeUnits * 100 * (isNegative ? -1 : 1)
    }

    // 6. Split into whole and fractional parts (last separator is decimal)
    const wholePartStr = cleaned.substring(0, lastSeparatorIndex).replace(/\D/g, "")
    let fractionalPartStr = fractionalPartRaw.replace(/\D/g, "")

    // Normalize fractional part to exactly 2 digits
    if (fractionalPartStr.length === 0) {
        fractionalPartStr = "00"
    } else if (fractionalPartStr.length === 1) {
        fractionalPartStr += "0"
    } else if (fractionalPartStr.length > 2) {
        fractionalPartStr = fractionalPartStr.substring(0, 2)
    }

    const wholeUnits = parseInt(wholePartStr || "0", 10)
    const cents = parseInt(fractionalPartStr, 10)

    const totalCents = (wholeUnits * 100) + cents
    return totalCents * (isNegative ? -1 : 1)
}

/**
 * Converts a Euro number (e.g. 10.50) to cents (1050).
 */
export function euroToCents(amount: number): number {
    return Math.round(amount * 100)
}

/**
 * Formats cents into a currency string.
 * @param cents Integer value in cents (e.g. 1050)
 * @param currency Currency code (e.g. "EUR", "USD")
 * @param locale Locale string (default "it-IT")
 */
export function formatCents(cents: number, currency: string = "EUR", locale: string = "it-IT"): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
    }).format(cents / 100)
}

/**
 * Formats cents into a currency string, forcing a + sign for positive numbers.
 * @param cents Integer value in cents (e.g. 1050)
 */
export function formatSignedCents(cents: number, currency: string = "EUR", locale: string = "it-IT"): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        signDisplay: "exceptZero"
    }).format(cents / 100)
}

/**
 * Formats a number (in units/Euros) to a currency string.
 * Wrapper around formatCents for convenience.
 */
export function formatEuroNumber(value: number, currency: string = "EUR", locale: string = "it-IT"): string {
    const cents = euroToCents(value)
    return formatCents(cents, currency, locale)
}
