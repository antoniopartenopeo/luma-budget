
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
    buildDiagnosticsSnapshot,
    countBudgetPlansFromRaw,
    countTransactionsFromRaw,
    estimateBytes,
    getAppVersion,
    safeGetItem,
} from "../diagnostics-utils"

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString()
        }),
        removeItem: vi.fn(),
        clear: vi.fn(() => {
            store = {}
        }),
        getStore: () => store,
    }
})()

describe("diagnostics-utils", () => {
    beforeEach(() => {
        vi.stubGlobal("localStorage", localStorageMock)
        localStorageMock.clear()
        vi.stubGlobal("window", {}) // Ensure window exists for strict checks
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe("getAppVersion", () => {
        it("should return version from env or fallback", () => {
            // Since we removed package.json import, it should return default or env
            const version = getAppVersion()
            expect(version).toBeDefined()
            // In test env, it might be 'dev' or undefined depending on setup
            expect(version).toBeTruthy()
        })
    })

    describe("safeGetItem", () => {
        it("should return item from localStorage", () => {
            localStorage.setItem("test_key", "test_value")
            expect(safeGetItem("test_key")).toBe("test_value")
        })

        it("should return null if key missing", () => {
            expect(safeGetItem("missing_key")).toBeNull()
        })

        it("should return null if window is undefined (SSR)", () => {
            vi.stubGlobal("window", undefined)
            expect(safeGetItem("test_key")).toBeNull()
        })
    })

    describe("estimateBytes", () => {
        it("should return 0 for null", () => {
            expect(estimateBytes(null)).toBe(0)
        })

        it("should return correct byte size for ASCII string", () => {
            expect(estimateBytes("hello")).toBe(5)
        })

        it("should return correct byte size for Unicode string", () => {
            // '€' is 3 bytes in UTF-8
            expect(estimateBytes("€")).toBe(3)
        })

        it("should fallback to length if Blob is undefined", () => {
            const originalBlob = global.Blob
            vi.stubGlobal("Blob", undefined)
            expect(estimateBytes("hello")).toBe(5)
            // '€' length is 1, but bytes are 3. If Blob missing, length is 1.
            expect(estimateBytes("€")).toBe(1)
            vi.stubGlobal("Blob", originalBlob)
        })
    })

    describe("countTransactionsFromRaw", () => {
        it("should count from array", () => {
            expect(countTransactionsFromRaw([1, 2, 3])).toBe(3)
        })

        it("should count from record of arrays", () => {
            const data = {
                a: [1, 2],
                b: [3, 4, 5],
                c: "not array", // should be ignored
            }
            expect(countTransactionsFromRaw(data)).toBe(5)
        })

        it("should return 0 for other types", () => {
            expect(countTransactionsFromRaw(null)).toBe(0)
            expect(countTransactionsFromRaw("string")).toBe(0)
            expect(countTransactionsFromRaw({ a: 1 })).toBe(0)
        })
    })

    describe("countBudgetPlansFromRaw", () => {
        it("should count keys from record", () => {
            expect(countBudgetPlansFromRaw({ a: 1, b: 2 })).toBe(2)
        })

        it("should count length from array", () => {
            expect(countBudgetPlansFromRaw([1, 2, 3])).toBe(3)
        })

        it("should return 0 for other types", () => {
            expect(countBudgetPlansFromRaw(null)).toBe(0)
            expect(countBudgetPlansFromRaw("string")).toBe(0)
        })
    })

    describe("buildDiagnosticsSnapshot", () => {
        it("should build snapshot with storage info", () => {
            localStorage.setItem("luma_transactions_v1", JSON.stringify([1, 2]))
            localStorage.setItem("luma_budget_plans_v1", JSON.stringify({ jan: {}, feb: {} }))
            localStorage.setItem("luma_settings_v1", JSON.stringify({ version: 1 }))

            const snapshot = buildDiagnosticsSnapshot()

            expect(snapshot.generatedAt).toBeDefined()
            expect(snapshot.app.version).toBeDefined()

            const transactions = snapshot.storage.find(s => s.key === "luma_transactions_v1")
            expect(transactions?.present).toBe(true)
            expect(transactions?.summary).toContain("transactions: 2")

            const budgets = snapshot.storage.find(s => s.key === "luma_budget_plans_v1")
            expect(budgets?.present).toBe(true)
            expect(budgets?.summary).toContain("budgetPlans: 2")

            const settings = snapshot.storage.find(s => s.key === "luma_settings_v1")
            expect(settings?.present).toBe(true)
            expect(settings?.summary).toBe("settings: ok")
        })

        it("should handle missing keys", () => {
            const snapshot = buildDiagnosticsSnapshot()
            const transactions = snapshot.storage.find(s => s.key === "luma_transactions_v1")
            expect(transactions?.present).toBe(false)
            expect(transactions?.summary).toBe("missing")
        })

        it("should handle corrupted JSON", () => {
            localStorage.setItem("luma_transactions_v1", "{ invalid json")
            const snapshot = buildDiagnosticsSnapshot()
            const transactions = snapshot.storage.find(s => s.key === "luma_transactions_v1")
            expect(transactions?.present).toBe(true)
            expect(transactions?.summary).toBe("corrupted JSON")
        })
    })
})
