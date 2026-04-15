"use client"

import { fetchSettings } from "@/features/settings/api/repository"
import { syncThemeSelection, useIsomorphicLayoutEffect } from "./theme-dom"

export function PublicThemeApplier() {
  useIsomorphicLayoutEffect(() => {
    let cleanupThemeSync: () => void = () => undefined

    const syncTheme = async () => {
      const settings = await fetchSettings()
      cleanupThemeSync()
      cleanupThemeSync = syncThemeSelection(settings.theme || "system")
    }

    void syncTheme()

    return () => {
      cleanupThemeSync()
    }
  }, [])

  return null
}
