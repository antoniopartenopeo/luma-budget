import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AppRuntimeGate } from "../app-runtime-gate"

const usePathnameMock = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock()
}))

vi.mock("next/dynamic", () => ({
  default: () => {
    const MockFullAppRuntime = ({ children }: { children: React.ReactNode }) => (
      <div data-testid="full-app-runtime">{children}</div>
    )

    MockFullAppRuntime.displayName = "MockFullAppRuntime"
    return MockFullAppRuntime
  }
}))

vi.mock("@/components/providers/theme-applier", () => ({
  ThemeApplier: () => <div data-testid="theme-applier" />
}))

vi.mock("@/components/providers/public-theme-applier", () => ({
  PublicThemeApplier: () => <div data-testid="public-theme-applier" />
}))

vi.mock("@/components/providers/app-runtime-scaffold", () => ({
  AppRuntimeScaffold: ({
    children,
    themeLayer,
    wrapInRouteShell = true
  }: {
    children: React.ReactNode
    themeLayer: React.ReactNode
    wrapInRouteShell?: boolean
  }) => (
    <div data-testid={wrapInRouteShell ? "route-scaffold" : "public-scaffold"}>
      {themeLayer}
      <div data-testid="pwa-register" />
      <a href="#main-content">Vai al contenuto</a>
      {wrapInRouteShell ? <div data-testid="route-shell">{children}</div> : children}
    </div>
  )
}))

describe("AppRuntimeGate", () => {
  it.each(["/"])(
    "keeps %s on the minimal public runtime",
    (pathname) => {
      usePathnameMock.mockReturnValue(pathname)

      render(
        <AppRuntimeGate>
          <div>Contenuto pubblico</div>
        </AppRuntimeGate>
      )

      expect(screen.getByTestId("public-theme-applier")).toBeInTheDocument()
      expect(screen.getByTestId("pwa-register")).toBeInTheDocument()
      expect(screen.getByTestId("public-scaffold")).toBeInTheDocument()
      expect(screen.queryByTestId("route-shell")).not.toBeInTheDocument()
      expect(screen.queryByTestId("full-app-runtime")).not.toBeInTheDocument()
      expect(screen.getByRole("link", { name: /vai al contenuto/i })).toHaveAttribute("href", "#main-content")
    }
  )

  it.each(["/faq", "/privacy", "/offline", "/updates", "/dashboard", "/transactions/import", null])(
    "wraps %s in the full runtime when needed",
    (pathname) => {
      usePathnameMock.mockReturnValue(pathname)

      render(
        <AppRuntimeGate>
          <div>Contenuto con runtime completo</div>
        </AppRuntimeGate>
      )

      expect(screen.getByTestId("full-app-runtime")).toBeInTheDocument()
      expect(screen.getByTestId("theme-applier")).toBeInTheDocument()
      expect(screen.getByTestId("route-scaffold")).toBeInTheDocument()
      expect(screen.getByTestId("route-shell")).toBeInTheDocument()
      expect(screen.getByText("Contenuto con runtime completo")).toBeInTheDocument()
    }
  )
})
