"use client"

import { usePathname } from "next/navigation"
import { AppShell } from "./app-shell"

interface RouteShellProps {
  children: React.ReactNode
}

const PUBLIC_ROUTES = new Set(["/", "/offline"])

export function RouteShell({ children }: RouteShellProps) {
  const pathname = usePathname()

  if (pathname && PUBLIC_ROUTES.has(pathname)) {
    return <>{children}</>
  }

  return <AppShell>{children}</AppShell>
}
