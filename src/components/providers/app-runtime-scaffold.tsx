"use client"

import { PwaRegister } from "@/components/providers/pwa-register"
import { RouteShell } from "@/components/layout/route-shell"

interface AppRuntimeScaffoldProps {
  children: React.ReactNode
  themeLayer: React.ReactNode
  wrapInRouteShell?: boolean
}

export function AppRuntimeScaffold({
  children,
  themeLayer,
  wrapInRouteShell = true,
}: AppRuntimeScaffoldProps) {
  return (
    <>
      {themeLayer}
      <PwaRegister />
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[100] rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        Vai al contenuto
      </a>
      {wrapInRouteShell ? <RouteShell>{children}</RouteShell> : children}
    </>
  )
}
