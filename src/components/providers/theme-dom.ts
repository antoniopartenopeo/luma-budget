"use client"

import { useEffect, useLayoutEffect } from "react"
import type { ThemePreference } from "@/features/settings/api/types"

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

function applyThemeToRoot(isDark: boolean) {
  const root = document.documentElement

  if (isDark) {
    root.classList.add("dark")
    root.style.colorScheme = "dark"
  } else {
    root.classList.remove("dark")
    root.style.colorScheme = "light"
  }
}

function registerSystemThemeListener(onChange: (isDark: boolean) => void) {
  if (typeof window.matchMedia !== "function") {
    onChange(false)
    return () => undefined
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  const handleSystemThemeChange = (event: MediaQueryListEvent | MediaQueryList) => {
    onChange(event.matches)
  }

  onChange(mediaQuery.matches)

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handleSystemThemeChange)
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange)
    }
  }

  mediaQuery.addListener(handleSystemThemeChange)
  return () => {
    mediaQuery.removeListener(handleSystemThemeChange)
  }
}

export function syncThemeSelection(theme: ThemePreference) {
  if (theme === "system") {
    return registerSystemThemeListener(applyThemeToRoot)
  }

  applyThemeToRoot(theme === "dark")
  return () => undefined
}
