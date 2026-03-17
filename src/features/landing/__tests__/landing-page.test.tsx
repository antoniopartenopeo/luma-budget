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

    expect(screen.getAllByTestId("brand-logo").length).toBeGreaterThan(0)
    expect(screen.getByRole("heading", { name: /L'app che ti aiuta a capire il mese, non solo a registrare spese/i })).toBeInTheDocument()
    expect(screen.getByText(/Perche e diversa da molti tracker/i)).toBeInTheDocument()
    expect(screen.getByText(/Guardala in 4 momenti/i)).toBeInTheDocument()

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"))
    expect(hrefs.length).toBeGreaterThan(0)
    expect(hrefs.every((href) => href === "/dashboard" || href?.startsWith("#"))).toBe(true)
    expect(screen.queryByRole("link", { name: /Novita prodotto/i })).not.toBeInTheDocument()
  })
})
