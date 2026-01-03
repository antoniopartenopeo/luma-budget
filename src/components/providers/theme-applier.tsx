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

            // Initial application
            applyTheme(mediaQuery.matches)

            // Listener for system changes
            const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)

            // Safely add listener
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener("change", handler)
            } else {
                // Backward compatibility just in case
                mediaQuery.addListener(handler)
            }

            return () => {
                if (mediaQuery.removeEventListener) {
                    mediaQuery.removeEventListener("change", handler)
                } else {
                    mediaQuery.removeListener(handler)
                }
            }
        } else {
            // Manual overrides
            applyTheme(theme === "dark")
            // No cleanup needed for manual mode logic itself, but we return undefined
        }
    }, [theme])

    return null
}
