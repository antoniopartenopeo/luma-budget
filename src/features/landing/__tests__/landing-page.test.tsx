import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingPage } from "../landing-page"

vi.mock("@/components/layout/ambient-backdrop", () => ({
  AmbientBackdrop: () => <div data-testid="ambient-backdrop" />
}))

vi.mock("@/components/ui/brand-logo", () => ({
  BrandLogo: () => <div data-testid="brand-logo">NUMA</div>
}))

vi.mock("../components/landing-previews", () => ({
  LandingHeroConsole: () => <div data-testid="landing-hero-console" />
}))

vi.mock("../components/landing-product-demo", () => ({
  LandingProductDemo: () => <div data-testid="landing-product-demo" />
}))

describe("LandingPage", () => {
  it("renders the revised public value proposition and keeps navigation constrained to the landing plus app entry", () => {
    render(<LandingPage />)

    expect(screen.getByRole("heading", { name: /Capisci il tuo mese prima che ti sfugga/i })).toBeInTheDocument()
    expect(screen.getByText(/Perche Numa convince piu di un tracker classico/i)).toBeInTheDocument()
    expect(screen.getByText(/Scorrendo capisci il prodotto, non una presentazione/i)).toBeInTheDocument()

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"))
    expect(hrefs.length).toBeGreaterThan(0)
    expect(hrefs.every((href) => href === "/dashboard" || href?.startsWith("#"))).toBe(true)
    expect(screen.queryByRole("link", { name: /Novita prodotto/i })).not.toBeInTheDocument()
  })
})
