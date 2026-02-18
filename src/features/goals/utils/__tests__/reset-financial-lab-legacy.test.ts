import { beforeEach, describe, expect, test } from "vitest"

import { resetFinancialLabLegacyState } from "../reset-financial-lab-legacy"

const PORTFOLIO_KEY = "numa_goal_portfolio_v1"
const LEGACY_COMMIT_KEY = "numa_active_goal_v1"
const BUDGET_KEY = "luma_budget_plans_v1"
const MARKER_KEY = "numa_finlab_hard_switch_v1_done"

describe("resetFinancialLabLegacyState", () => {
    beforeEach(() => {
        localStorage.clear()
    })

    test("resets legacy portfolio, commit and budget once, then remains idempotent", async () => {
        localStorage.setItem(PORTFOLIO_KEY, JSON.stringify({ goals: [{ id: "g1" }] }))
        localStorage.setItem(LEGACY_COMMIT_KEY, JSON.stringify({ id: "legacy" }))
        localStorage.setItem(BUDGET_KEY, JSON.stringify({ "local-user:2026-02": { id: "b1" } }))

        const firstRun = await resetFinancialLabLegacyState()

        expect(firstRun).toBe(true)
        expect(localStorage.getItem(PORTFOLIO_KEY)).toBeNull()
        expect(localStorage.getItem(LEGACY_COMMIT_KEY)).toBeNull()
        expect(localStorage.getItem(MARKER_KEY)).toBe("true")
        expect(localStorage.getItem(BUDGET_KEY)).toBeNull()

        localStorage.setItem(PORTFOLIO_KEY, JSON.stringify({ goals: [{ id: "g2" }] }))
        const secondRun = await resetFinancialLabLegacyState()

        expect(secondRun).toBe(false)
        expect(localStorage.getItem(PORTFOLIO_KEY)).toBe(JSON.stringify({ goals: [{ id: "g2" }] }))
    })

    test("keeps budgets when no legacy rhythm state is present", async () => {
        localStorage.setItem(PORTFOLIO_KEY, JSON.stringify({ goals: [{ id: "g1" }] }))
        localStorage.setItem(BUDGET_KEY, JSON.stringify({ "local-user:2026-02": { id: "b1" } }))

        const didRun = await resetFinancialLabLegacyState()

        expect(didRun).toBe(true)
        expect(localStorage.getItem(PORTFOLIO_KEY)).toBeNull()
        expect(localStorage.getItem(BUDGET_KEY)).toBe(JSON.stringify({ "local-user:2026-02": { id: "b1" } }))
        expect(localStorage.getItem(MARKER_KEY)).toBe("true")
    })

    test("returns false when there is no legacy state to migrate", async () => {
        const didRun = await resetFinancialLabLegacyState()

        expect(didRun).toBe(false)
        expect(localStorage.getItem(MARKER_KEY)).toBe("true")
    })
})
