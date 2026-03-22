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

vi.mock("../components/landing-brain-hero", () => ({
  LandingBrainHero: () => <div data-testid="landing-brain-hero" />
}))

vi.mock("../components/motion-primitives", () => ({
  CinematicTextReveal: ({ text }: { text: string }) => <>{text}</>
}))

describe("LandingPage", () => {
  it("renders the public acquisition story and keeps navigation constrained to the landing plus app entry", () => {
    render(<LandingPage />)

    expect(screen.getAllByTestId("brand-logo").length).toBeGreaterThan(0)
    expect(screen.getByRole("heading", { name: /L'app che ti aiuta a capire il mese, non solo a registrare spese/i })).toBeInTheDocument()
    expect(screen.getByText(/App di finanza personale locale-first/i)).toBeInTheDocument()
    expect(screen.getByText(/La differenza con Numa/i)).toBeInTheDocument()
    expect(screen.getByText(/Come inizi/i)).toBeInTheDocument()
    expect(screen.getByText(/Cosa cambia davvero/i)).toBeInTheDocument()
    expect(screen.getByTestId("landing-product-demo")).toBeInTheDocument()
    expect(screen.getByTestId("landing-brain-hero")).toBeInTheDocument()

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"))
    expect(hrefs.length).toBeGreaterThan(0)
    expect(hrefs.every((href) => href === "/dashboard" || href?.startsWith("#"))).toBe(true)
    expect(screen.getAllByRole("link", { name: /Apri l'app/i }).length).toBeGreaterThan(0)
    expect(screen.queryByRole("link", { name: /Novita prodotto/i })).not.toBeInTheDocument()
  })
})
