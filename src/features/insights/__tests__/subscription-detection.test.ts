import { beforeEach, describe, expect, it, vi } from "vitest"
import { detectActiveSubscriptions, SUBSCRIPTION_ACTIVE_WINDOW_DAYS } from "../subscription-detection"

const extractMerchantKeyMock = vi.fn()

vi.mock("@/features/import-csv/core/merchant/pipeline", () => ({
    extractMerchantKey: (description: string) => extractMerchantKeyMock(description),
}))

function ts(isoDate: string): number {
    return new Date(isoDate).getTime()
}

function tx(
    description: string,
    amountCents: number,
    isoDate: string,
    overrides: Partial<{
        categoryId: string
        categoryLabel: string
    }> = {}
) {
    return {
        description,
        amountCents,
        timestamp: ts(isoDate),
        categoryId: overrides.categoryId ?? "abbonamenti",
        categoryLabel: overrides.categoryLabel ?? "Abbonamenti"
    }
}

describe("detectActiveSubscriptions", () => {
    beforeEach(() => {
        extractMerchantKeyMock.mockReset()
        extractMerchantKeyMock.mockImplementation((description: string) => {
            return description.split(":")[0]
        })
    })

    it("detects a stable monthly recurring charge and computes yearly total", () => {
        const result = detectActiveSubscriptions([
            tx("NETFLIX:dec", 1599, "2025-12-03T09:00:00.000Z"),
            tx("NETFLIX:jan", 1599, "2026-01-03T09:00:00.000Z"),
            tx("NETFLIX:feb", 1599, "2026-02-03T09:00:00.000Z"),
        ], {
            now: new Date("2026-02-20T09:00:00.000Z")
        })

        expect(result.subscriptions).toHaveLength(1)
        expect(result.subscriptions[0]).toMatchObject({
            description: "NETFLIX",
            amountCents: 1599,
            frequency: "monthly",
            occurrences: 3,
            categoryId: "abbonamenti",
            categoryLabel: "Abbonamenti"
        })
        expect(result.subscriptions[0].charges).toHaveLength(3)
        expect(result.subscriptions[0].charges[0].timestamp).toBe(ts("2026-02-03T09:00:00.000Z"))
        expect(result.totalYearlyCents).toBe(1599 * 12)
    })

    it("rejects irregular cadence that does not match monthly recurrence", () => {
        const result = detectActiveSubscriptions([
            tx("GYM:one", 3999, "2025-12-03T09:00:00.000Z"),
            tx("GYM:two", 3999, "2025-12-11T09:00:00.000Z"),
            tx("GYM:three", 3999, "2026-02-03T09:00:00.000Z"),
        ], {
            now: new Date("2026-02-20T09:00:00.000Z")
        })

        expect(result.subscriptions).toHaveLength(0)
    })

    it("rejects recurring cadence when amount drift is too high", () => {
        const result = detectActiveSubscriptions([
            tx("SERVICE:a", 1000, "2025-12-03T09:00:00.000Z"),
            tx("SERVICE:b", 2100, "2026-01-03T09:00:00.000Z"),
            tx("SERVICE:c", 1000, "2026-02-03T09:00:00.000Z"),
        ], {
            now: new Date("2026-02-20T09:00:00.000Z")
        })

        expect(result.subscriptions).toHaveLength(0)
    })

    it("supports multiple recurring plans from the same merchant via amount clustering", () => {
        const result = detectActiveSubscriptions([
            tx("APPLE:music-dec", 1099, "2025-12-04T09:00:00.000Z"),
            tx("APPLE:music-jan", 1099, "2026-01-04T09:00:00.000Z"),
            tx("APPLE:music-feb", 1099, "2026-02-04T09:00:00.000Z"),
            tx("APPLE:storage-dec", 599, "2025-12-18T09:00:00.000Z"),
            tx("APPLE:storage-jan", 599, "2026-01-18T09:00:00.000Z"),
            tx("APPLE:storage-feb", 599, "2026-02-18T09:00:00.000Z"),
        ], {
            now: new Date("2026-02-20T09:00:00.000Z")
        })

        expect(result.subscriptions).toHaveLength(2)
        expect(result.subscriptions.map((item) => item.description)).toEqual([
            "APPLE (Piano 1)",
            "APPLE (Piano 2)"
        ])
        expect(result.subscriptions.map((item) => item.amountCents)).toEqual([1099, 599])
    })

    it("filters out old recurring charges beyond active window", () => {
        const oldWindowDays = SUBSCRIPTION_ACTIVE_WINDOW_DAYS + 5
        const now = new Date("2026-04-20T09:00:00.000Z")
        const latest = new Date(now.getTime() - oldWindowDays * DAY_MS)
        const previous = new Date(latest.getTime() - 31 * DAY_MS)

        const result = detectActiveSubscriptions([
            tx("SPOTIFY:old-1", 1099, previous.toISOString()),
            tx("SPOTIFY:old-2", 1099, latest.toISOString()),
        ], {
            now
        })

        expect(result.subscriptions).toHaveLength(0)
    })

    it("assigns the dominant transaction category to the detected merchant", () => {
        const result = detectActiveSubscriptions([
            tx("PER PER:dec", 6204, "2025-12-05T09:00:00.000Z", {
                categoryId: "abbonamenti",
                categoryLabel: "Abbonamenti"
            }),
            tx("PER PER:jan", 6204, "2026-01-05T09:00:00.000Z", {
                categoryId: "abbonamenti",
                categoryLabel: "Abbonamenti"
            }),
            tx("PER PER:feb", 6204, "2026-02-05T09:00:00.000Z", {
                categoryId: "svago_extra",
                categoryLabel: "Svago Extra"
            }),
        ], {
            now: new Date("2026-02-20T09:00:00.000Z")
        })

        expect(result.subscriptions).toHaveLength(1)
        expect(result.subscriptions[0]).toMatchObject({
            description: "PER PER",
            categoryId: "abbonamenti",
            categoryLabel: "Abbonamenti"
        })
    })

    it("skips unresolved or generic merchants", () => {
        const result = detectActiveSubscriptions([
            tx("ALTRO:dec", 1599, "2025-12-03T09:00:00.000Z"),
            tx("ALTRO:jan", 1599, "2026-01-03T09:00:00.000Z"),
            tx("ALTRO:feb", 1599, "2026-02-03T09:00:00.000Z"),
            tx("UNRESOLVED:dec", 1599, "2025-12-03T09:00:00.000Z"),
            tx("UNRESOLVED:jan", 1599, "2026-01-03T09:00:00.000Z"),
            tx("UNRESOLVED:feb", 1599, "2026-02-03T09:00:00.000Z"),
        ], {
            now: new Date("2026-02-20T09:00:00.000Z")
        })

        expect(result.subscriptions).toHaveLength(0)
    })

    it("keeps merchant active with adaptive 35-70 day window when latest month is an amount outlier", () => {
        const result = detectActiveSubscriptions([
            tx("FLEXIA:dec", 13454, "2025-12-05T09:00:00.000Z", {
                categoryId: "rate_prestiti",
                categoryLabel: "Rate & Prestiti"
            }),
            tx("FLEXIA:jan", 13674, "2026-01-05T09:00:00.000Z", {
                categoryId: "rate_prestiti",
                categoryLabel: "Rate & Prestiti"
            }),
            tx("FLEXIA:feb", 20120, "2026-02-05T09:00:00.000Z", {
                categoryId: "rate_prestiti",
                categoryLabel: "Rate & Prestiti"
            }),
        ], {
            now: new Date("2026-02-20T09:00:00.000Z")
        })

        expect(result.subscriptions).toHaveLength(1)
        expect(result.subscriptions[0]).toMatchObject({
            description: "FLEXIA",
            categoryId: "rate_prestiti",
            categoryLabel: "Rate & Prestiti",
            occurrences: 2,
        })
    })
})

const DAY_MS = 24 * 60 * 60 * 1000
