export type ThemePreference = "light" | "dark" | "system"
export type CurrencyCode = "EUR" | "USD" | "GBP"
export type InsightsSensitivity = "low" | "medium" | "high"

export type AppSettingsV1 = {
    version: 1
    theme: ThemePreference
    currency: CurrencyCode
    superfluousTargetPercent: number
    insightsSensitivity: InsightsSensitivity
    profile?: {
        displayName?: string
    }
}

export const DEFAULT_SETTINGS_V1: AppSettingsV1 = {
    version: 1,
    theme: "system",
    currency: "EUR",
    superfluousTargetPercent: 10,
    insightsSensitivity: "medium",
    profile: {
        displayName: ""
    }
}
