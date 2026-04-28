import { storage } from "@/lib/storage-utils"
import { STORAGE_KEY_SETTINGS } from "@/lib/storage-keys"
import { AppSettingsV1, DEFAULT_SETTINGS_V1, ThemePreference, CurrencyCode, InsightsSensitivity } from "./types"
import { normalizeSettingsProfile } from "../profile-utils"

const SETTINGS_KEY = STORAGE_KEY_SETTINGS

let cachedSettingsRaw: string | null | undefined
let cachedSettingsSnapshot: AppSettingsV1 = DEFAULT_SETTINGS_V1

function normalizeSettings(data: unknown): AppSettingsV1 {
    if (!data || typeof data !== "object") {
        return DEFAULT_SETTINGS_V1
    }

    // Cast to Partial<AppSettingsV1> for check but don't trust it yet
    const candidate = data as Partial<AppSettingsV1>

    if (candidate.version !== 1) {
        return DEFAULT_SETTINGS_V1
    }

    // Validate theme
    let theme: ThemePreference = DEFAULT_SETTINGS_V1.theme
    if (
        candidate.theme === "light" ||
        candidate.theme === "dark" ||
        candidate.theme === "system"
    ) {
        theme = candidate.theme
    }

    // Validate currency
    let currency: CurrencyCode = DEFAULT_SETTINGS_V1.currency
    if (
        candidate.currency === "EUR" ||
        candidate.currency === "USD" ||
        candidate.currency === "GBP"
    ) {
        currency = candidate.currency
    }

    // Validate superfluous target (0-100)
    let superfluousTargetPercent = DEFAULT_SETTINGS_V1.superfluousTargetPercent
    if (typeof candidate.superfluousTargetPercent === "number") {
        // Clamp between 0 and 100
        superfluousTargetPercent = Math.max(0, Math.min(100, candidate.superfluousTargetPercent))
    }

    // Validate insights sensitivity
    let insightsSensitivity: InsightsSensitivity = DEFAULT_SETTINGS_V1.insightsSensitivity
    if (
        candidate.insightsSensitivity === "low" ||
        candidate.insightsSensitivity === "medium" ||
        candidate.insightsSensitivity === "high"
    ) {
        insightsSensitivity = candidate.insightsSensitivity
    }

    return {
        version: 1,
        theme,
        currency,
        superfluousTargetPercent,
        insightsSensitivity,
        profile: normalizeSettingsProfile(candidate.profile),
    }
}

function readSettingsSnapshot(): AppSettingsV1 {
    if (typeof window === "undefined" || !window.localStorage) {
        return DEFAULT_SETTINGS_V1
    }

    try {
        const raw = window.localStorage.getItem(SETTINGS_KEY)

        if (raw === cachedSettingsRaw) {
            return cachedSettingsSnapshot
        }

        const parsed = raw === null ? null : JSON.parse(raw)

        cachedSettingsRaw = raw
        cachedSettingsSnapshot = normalizeSettings(parsed)

        return cachedSettingsSnapshot
    } catch (error) {
        console.error(`Error reading key "${SETTINGS_KEY}" from localStorage`, error)
        cachedSettingsRaw = null
        cachedSettingsSnapshot = DEFAULT_SETTINGS_V1
        return cachedSettingsSnapshot
    }
}

export async function fetchSettings(): Promise<AppSettingsV1> {
    return readSettingsSnapshot()
}

export async function upsertSettings(patch: Partial<Omit<AppSettingsV1, "version">>): Promise<AppSettingsV1> {
    const current = await fetchSettings()
    const next: AppSettingsV1 = {
        ...current,
        ...patch,
        version: 1,
    }

    storage.set(SETTINGS_KEY, next)
    return next
}

export function resetSettings(): void {
    storage.remove(SETTINGS_KEY)
}
