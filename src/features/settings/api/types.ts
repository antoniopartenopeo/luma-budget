export type ThemePreference = "light" | "dark" | "system"
export type CurrencyCode = "EUR" | "USD" | "GBP"

export type AppSettingsV1 = {
    version: 1
    theme: ThemePreference
    currency: CurrencyCode
    superfluousTargetPercent: number
}

export const DEFAULT_SETTINGS_V1: AppSettingsV1 = {
    version: 1,
    theme: "system",
    currency: "EUR",
    superfluousTargetPercent: 10,
}
