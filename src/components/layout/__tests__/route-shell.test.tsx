import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { RouteShell } from "../route-shell"

const usePathnameMock = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock()
}))

vi.mock("../app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div data-testid="app-shell">{children}</div>
}))

describe("RouteShell", () => {
  it.each(["/", "/faq", "/privacy", "/offline"])(
    "keeps %s outside the operational app shell",
    (pathname) => {
      usePathnameMock.mockReturnValue(pathname)

      render(
        <RouteShell>
          <div>Contenuto pubblico</div>
        </RouteShell>
      )

      expect(screen.getByText("Contenuto pubblico")).toBeInTheDocument()
      expect(screen.queryByTestId("app-shell")).not.toBeInTheDocument()
    }
  )

  it.each(["/dashboard", "/updates", "/transactions/import"])(
    "wraps %s in the operational app shell",
    (pathname) => {
      usePathnameMock.mockReturnValue(pathname)

      render(
        <RouteShell>
          <div>Contenuto operativo</div>
        </RouteShell>
      )

      expect(screen.getByTestId("app-shell")).toBeInTheDocument()
      expect(screen.getByText("Contenuto operativo")).toBeInTheDocument()
    }
  )
})
