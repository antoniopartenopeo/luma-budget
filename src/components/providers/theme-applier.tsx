"use client"

import { useEffect, useLayoutEffect } from "react"
import { useSettings } from "@/features/settings/api/use-settings"

// Helper ensuring SSR safety for useLayoutEffect
const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect

export function ThemeApplier() {
    const { data: settings } = useSettings()
    const theme = settings?.theme || "system"

    useIsomorphicLayoutEffect(() => {
        const root = document.documentElement

        const applyTheme = (isDark: boolean) => {
            if (isDark) {
                root.classList.add("dark")
            } else {
                root.classList.remove("dark")
            }
        }

        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

            // Apply current system state
            applyTheme(mediaQuery.matches)

            // Dynamic listener for theme switches while app is open
            const handler = (e: MediaQueryListEvent | MediaQueryList) => applyTheme(e.matches)

            // Support both old and new API
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener("change", handler as any)
            } else {
                mediaQuery.addListener(handler as any)
            }

            return () => {
                if (mediaQuery.removeEventListener) {
                    mediaQuery.removeEventListener("change", handler as any)
                } else {
                    mediaQuery.removeListener(handler as any)
                }
            }
        } else {
            // Manual overrides
            applyTheme(theme === "dark")
        }
    }, [theme])

    return null
}
