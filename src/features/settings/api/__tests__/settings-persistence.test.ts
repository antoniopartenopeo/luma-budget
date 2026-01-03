import { describe, it, expect, beforeEach, vi } from "vitest"
import { fetchSettings, upsertSettings, resetSettings } from "../repository"
import { DEFAULT_SETTINGS_V1 } from "../types"

// Mock storage-utils directly would be one way, but here we can mock localStorage directly 
// since storage-utils uses it. However, the requirement says "Mock localStorage as you do in other tests".
// Let's assume a standard localStorage mock setup.

const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString()
        },
        removeItem: (key: string) => {
            delete store[key]
        },
        clear: () => {
            store = {}
        }
    }
})()

Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
})

describe("Settings V1 Persistence", () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it("fetchSettings should return default settings when storage is empty", async () => {
        const settings = await fetchSettings()
        expect(settings).toEqual(DEFAULT_SETTINGS_V1)
    })

    it("upsertSettings should save settings and fetchSettings should return them", async () => {
        const newSettings = await upsertSettings({ theme: "dark" })

        expect(newSettings.theme).toBe("dark")
        // Version should be preserved/set
        expect(newSettings.version).toBe(1)

        // Check persistence
        const fetched = await fetchSettings()
        expect(fetched).toEqual(newSettings)
    })

    it("fetchSettings should return default settings when JSON is corrupted", async () => {
        localStorage.setItem("luma_settings_v1", "{ invalid json")

        // Should not crash, but return default (console.error might be called, we can spy if we want supress)
        const settings = await fetchSettings()
        expect(settings).toEqual(DEFAULT_SETTINGS_V1)
    })

    it("fetchSettings should fallback to default for invalid fields but keep valid ones", async () => {
        // Manually set invalid data
        const invalidData = {
            version: 1,
            theme: "invalid-theme",
            currency: "USD"
        }
        localStorage.setItem("luma_settings_v1", JSON.stringify(invalidData))

        const settings = await fetchSettings()

        // Invalid theme should fallback to default (system)
        expect(settings.theme).toBe("system")
        // Valid currency should remain
        expect(settings.currency).toBe("USD")
        // Missing superfluous target should fallback to default (10)
        expect(settings.superfluousTargetPercent).toBe(10)
    })

    it("fetchSettings should clamp superfluousTargetPercent between 0 and 100", async () => {
        // Test too low
        await upsertSettings({ superfluousTargetPercent: -50 })
        let settings = await fetchSettings()
        expect(settings.superfluousTargetPercent).toBe(0)

        // Test too high
        await upsertSettings({ superfluousTargetPercent: 150 })
        settings = await fetchSettings()
        expect(settings.superfluousTargetPercent).toBe(100)

        // Test valid
        await upsertSettings({ superfluousTargetPercent: 25 })
        settings = await fetchSettings()
        expect(settings.superfluousTargetPercent).toBe(25)
    })

    it("fetchSettings should return defaults if version mismatch", async () => {
        const oldVersion = {
            version: 0,
            theme: "dark",
            currency: "EUR"
        }
        localStorage.setItem("luma_settings_v1", JSON.stringify(oldVersion))

        const settings = await fetchSettings()
        expect(settings).toEqual(DEFAULT_SETTINGS_V1)
    })

    it("resetSettings should remove settings from storage", async () => {
        await upsertSettings({ theme: "dark" })
        resetSettings()
        expect(localStorage.getItem("luma_settings_v1")).toBeNull()
        const settings = await fetchSettings()
        expect(settings).toEqual(DEFAULT_SETTINGS_V1)
    })
})
