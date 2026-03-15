import type { ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, beforeEach, vi } from "vitest"
import { RouteShell } from "../route-shell"

const usePathnameMock = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock()
}))

vi.mock("../app-shell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  )
}))

describe("RouteShell", () => {
  beforeEach(() => {
    usePathnameMock.mockReset()
  })

  it("renders public routes without the app shell", () => {
    usePathnameMock.mockReturnValue("/")

    render(
      <RouteShell>
        <div>Landing</div>
      </RouteShell>
    )

    expect(screen.getByText("Landing")).toBeInTheDocument()
    expect(screen.queryByTestId("app-shell")).not.toBeInTheDocument()
  })

  it("wraps internal routes with the app shell", () => {
    usePathnameMock.mockReturnValue("/dashboard")

    render(
      <RouteShell>
        <div>Dashboard</div>
      </RouteShell>
    )

    expect(screen.getByTestId("app-shell")).toBeInTheDocument()
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
  })
})
