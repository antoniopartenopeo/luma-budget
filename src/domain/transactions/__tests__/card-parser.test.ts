import { describe, expect, it } from "vitest"
import { parseCardFromDescription } from "../card-parser"

describe("parseCardFromDescription", () => {
    it("extracts high-confidence data from masked card pattern", () => {
        const result = parseCardFromDescription(
            "PAGAMENTO APPLE PAY MASTERCARD NFC del 18/02/2026 CARTA *7298 DI EUR 30,40 SVAPO S"
        )

        expect(result).toEqual({
            last4: "7298",
            network: "Mastercard",
            walletProvider: "Apple Pay",
            confidence: "high"
        })
    })

    it("extracts medium-confidence data when context is strong", () => {
        const result = parseCardFromDescription("GOOGLE PAY NFC TRANSAZIONE 8871 MARKET SRL")

        expect(result).toEqual({
            last4: "8871",
            network: "Unknown",
            walletProvider: "Google Pay",
            confidence: "medium"
        })
    })

    it("rejects isolated last4 when context is weak", () => {
        const result = parseCardFromDescription("RIF OPERAZIONE 8871 BONIFICO")
        expect(result).toBeNull()
    })

    it("does not parse date fragments as card last4", () => {
        const result = parseCardFromDescription("BONIFICO DEL 18/02/2026 A FAVORE DI FORNITORE")
        expect(result).toBeNull()
    })

    it("honors conservative safety level for medium-only candidates", () => {
        const result = parseCardFromDescription("GOOGLE PAY NFC TRANSAZIONE 8871 MARKET SRL", "conservative")
        expect(result).toBeNull()
    })
})
