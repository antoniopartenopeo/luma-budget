"use client"

import { useSettings } from "./use-settings"
import { CurrencyCode, DEFAULT_SETTINGS_V1 } from "./types"

export function useCurrency(): { currency: CurrencyCode; locale: string } {
    const { data: settings } = useSettings()

    const locale = "it-IT"

    const currency = settings?.currency ?? DEFAULT_SETTINGS_V1.currency

    return { currency, locale }
}
