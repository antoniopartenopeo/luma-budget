"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { AppRuntimeScaffold } from "@/components/providers/app-runtime-scaffold"
import { PublicThemeApplier } from "@/components/providers/public-theme-applier"
import { ThemeApplier } from "@/components/providers/theme-applier"

const MINIMAL_PUBLIC_ROUTES = new Set([
  "/",
])

const FullAppRuntime = dynamic(
  () => import("./full-app-runtime").then((module) => module.FullAppRuntime)
)

export function AppRuntimeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const useMinimalRuntime = pathname ? MINIMAL_PUBLIC_ROUTES.has(pathname) : false

  if (useMinimalRuntime) {
    return (
      <AppRuntimeScaffold themeLayer={<PublicThemeApplier />} wrapInRouteShell={false}>
        {children}
      </AppRuntimeScaffold>
    )
  }

  return (
    <FullAppRuntime>
      <AppRuntimeScaffold themeLayer={<ThemeApplier />}>
        {children}
      </AppRuntimeScaffold>
    </FullAppRuntime>
  )
}
