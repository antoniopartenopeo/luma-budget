import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useTrendData, type TrendDataItem } from "../use-trend-data"

const useTransactionsMock = vi.fn()
const useCurrencyMock = vi.fn()

vi.mock("@/features/transactions/api/use-transactions", () => ({
    useTransactions: () => useTransactionsMock(),
}))

vi.mock("@/features/settings/api/use-currency", () => ({
    useCurrency: () => useCurrencyMock(),
}))

type TrendDataResult = {
    data: TrendDataItem[]
    isLoading: boolean
}

function HookHarness({ onValue }: { onValue: (value: TrendDataResult) => void }) {
    onValue(useTrendData())
    return null
}

describe("useTrendData", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-02-14T10:00:00.000Z"))
        useCurrencyMock.mockReturnValue({ locale: "it-IT" })
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.clearAllMocks()
    })

    it("returns 12 months and aggregates monthly totals", () => {
        useTransactionsMock.mockReturnValue({
            isLoading: false,
            data: [
                { type: "income", amountCents: 200000, timestamp: new Date("2026-02-01T08:00:00.000Z").getTime() },
                { type: "expense", amountCents: 45000, timestamp: new Date("2026-02-03T08:00:00.000Z").getTime() },
                { type: "expense", amountCents: 30000, timestamp: new Date("2026-02-11T08:00:00.000Z").getTime() },
                { type: "income", amountCents: 150000, timestamp: new Date("2026-01-05T08:00:00.000Z").getTime() },
            ],
        })

        let latest: TrendDataResult | null = null
        render(<HookHarness onValue={(value) => { latest = value }} />)

        const value = latest as TrendDataResult | null

        expect(value?.data).toHaveLength(12)
        expect(value?.data.at(-1)?.month).toBe("Feb")
        expect(value?.data.at(-1)?.yearMonth).toBe("2026-02")
        expect(value?.data.at(-1)?.incomeCents).toBe(200000)
        expect(value?.data.at(-1)?.expensesCents).toBe(75000)
        expect(value?.data.at(-1)?.hasTransactions).toBe(true)
        expect(value?.data.at(-2)?.month).toBe("Gen")
        expect(value?.data.at(-2)?.yearMonth).toBe("2026-01")
        expect(value?.data.at(-2)?.incomeCents).toBe(150000)
        expect(value?.data.at(-2)?.hasTransactions).toBe(true)
        expect(value?.data.at(-3)?.hasTransactions).toBe(false)
    })

    it("normalizes signed amounts to absolute values", () => {
        useTransactionsMock.mockReturnValue({
            isLoading: false,
            data: [
                { type: "income", amountCents: -100000, timestamp: new Date("2026-02-05T08:00:00.000Z").getTime() },
                { type: "expense", amountCents: -40000, timestamp: new Date("2026-02-06T08:00:00.000Z").getTime() },
            ],
        })

        let latest: TrendDataResult | null = null
        render(<HookHarness onValue={(value) => { latest = value }} />)

        const value = latest as TrendDataResult | null

        expect(value?.data.at(-1)?.incomeCents).toBe(100000)
        expect(value?.data.at(-1)?.expensesCents).toBe(40000)
        expect(value?.data.at(-1)?.hasTransactions).toBe(true)
    })
})
