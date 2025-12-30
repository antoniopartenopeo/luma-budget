import { storage } from "@/lib/storage-utils"
import { AppSettingsV1, DEFAULT_SETTINGS_V1, ThemePreference, CurrencyCode } from "./types"

const SETTINGS_KEY = "luma_settings_v1"

function validateSettings(data: unknown): AppSettingsV1 {
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

    return {
        version: 1,
        theme,
        currency,
    }
}

export async function fetchSettings(): Promise<AppSettingsV1> {
    const raw = storage.get<unknown>(SETTINGS_KEY, null)
    return validateSettings(raw)
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
