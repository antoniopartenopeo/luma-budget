import { describe, expect, it, vi } from "vitest"
import {
    buildTransactionsHrefForDashboardFilter,
    parseDashboardTimeFilter,
    writeDashboardTimeFilter
} from "../utils/dashboard-filter"

describe("dashboard-filter utils", () => {
    it("falls back to current month when search params are invalid", () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-03-08T10:00:00.000Z"))

        expect(parseDashboardTimeFilter(new URLSearchParams("mode=range&months=99"))).toEqual({
            mode: "month",
            period: "2026-03"
        })

        vi.useRealTimers()
    })

    it("parses a valid range filter from search params", () => {
        expect(parseDashboardTimeFilter(new URLSearchParams("period=2025-11&mode=range&months=6"))).toEqual({
            mode: "range",
            period: "2025-11",
            months: 6
        })
    })

    it("writes dashboard filters back to URL search params", () => {
        const nextParams = writeDashboardTimeFilter(new URLSearchParams("foo=bar"), {
            mode: "range",
            period: "2025-11",
            months: 3
        })

        expect(nextParams.get("foo")).toBe("bar")
        expect(nextParams.get("period")).toBe("2025-11")
        expect(nextParams.get("mode")).toBe("range")
        expect(nextParams.get("months")).toBe("3")
    })

    it("builds a custom transactions URL that preserves the selected dashboard window", () => {
        expect(buildTransactionsHrefForDashboardFilter({
            mode: "month",
            period: "2025-11"
        })).toBe("/transactions?period=custom&from=2025-11-01&to=2025-11-30")

        expect(buildTransactionsHrefForDashboardFilter({
            mode: "range",
            period: "2025-11",
            months: 3
        })).toBe("/transactions?period=custom&from=2025-09-01&to=2025-11-30")
    })
})
