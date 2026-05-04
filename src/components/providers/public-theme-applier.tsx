"use client"

import { fetchSettings } from "@/features/settings/api/repository"
import { syncThemeSelection, useIsomorphicLayoutEffect } from "./theme-dom"

export function PublicThemeApplier() {
  useIsomorphicLayoutEffect(() => {
    let isMounted = true
    let cleanupThemeSync = syncThemeSelection("system")

    const syncTheme = async () => {
      const settings = await fetchSettings()
      if (!isMounted) {
        return
      }
      cleanupThemeSync()
      cleanupThemeSync = syncThemeSelection(settings.theme || "system")
    }

    void syncTheme()

    return () => {
      isMounted = false
      cleanupThemeSync()
    }
  }, [])

  return null
}
