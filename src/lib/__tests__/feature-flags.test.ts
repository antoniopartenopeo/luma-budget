import { afterEach, describe, expect, test } from "vitest"

import { isFinancialLabRealtimeOverlayEnabled } from "@/lib/feature-flags"

const FORCE_KEY = "NEXT_PUBLIC_FF_FINLAB_RT_OVERLAY_FORCE"
const PERCENT_KEY = "NEXT_PUBLIC_FF_FINLAB_RT_OVERLAY_PERCENT"

afterEach(() => {
    delete process.env[FORCE_KEY]
    delete process.env[PERCENT_KEY]
})

describe("isFinancialLabRealtimeOverlayEnabled", () => {
    test("is enabled by default when no env is configured", () => {
        expect(isFinancialLabRealtimeOverlayEnabled("user-1")).toBe(true)
    })

    test("respects force off override", () => {
        process.env[FORCE_KEY] = "off"
        expect(isFinancialLabRealtimeOverlayEnabled("user-1")).toBe(false)
    })

    test("respects explicit rollout percent when provided", () => {
        process.env[PERCENT_KEY] = "0"
        expect(isFinancialLabRealtimeOverlayEnabled("user-1")).toBe(false)

        process.env[PERCENT_KEY] = "100"
        expect(isFinancialLabRealtimeOverlayEnabled("user-1")).toBe(true)
    })
})
