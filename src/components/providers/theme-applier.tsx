"use client"

import { useSettings } from "@/features/settings/api/use-settings"
import { syncThemeSelection, useIsomorphicLayoutEffect } from "./theme-dom"

export function ThemeApplier() {
    const { data: settings } = useSettings()
    const theme = settings?.theme || "system"

    useIsomorphicLayoutEffect(() => {
        return syncThemeSelection(theme)
    }, [theme])

    return null
}
