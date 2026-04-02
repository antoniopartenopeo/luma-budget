import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingPage } from "../landing-page"

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)

vi.mock("next/dynamic", () => {
  return {
    default: (loader: () => Promise<unknown>) => {
      const loaderSource = String(loader)

      if (loaderSource.includes("landing-differentiator-cards")) {
        const MockDifferentiatorCards = () => <div data-testid="landing-differentiator-cards">Tre scelte di design</div>
        MockDifferentiatorCards.displayName = "MockDifferentiatorCards"
        return MockDifferentiatorCards
      }

      if (loaderSource.includes("landing-brain-hero")) {
        const MockBrainHero = () => <div data-testid="landing-brain-hero" />
        MockBrainHero.displayName = "MockBrainHero"
        return MockBrainHero
      }

      const MockDynamicComponent = () => <div data-testid="dynamic-component" />
      MockDynamicComponent.displayName = "MockDynamicComponent"
      return MockDynamicComponent
    }
  }
})

vi.mock("@/components/layout/ambient-backdrop", () => ({
  AmbientBackdrop: () => <div data-testid="ambient-backdrop" />
}))

vi.mock("@/components/ui/brand-logo", () => ({
  BrandLogo: () => <div data-testid="brand-logo">NUMA</div>
}))

vi.mock("../components/landing-previews", () => ({
  LandingHeroConsole: () => <div data-testid="landing-hero-console" />
}))

vi.mock("../components/landing-brain-hero", () => ({
  LandingBrainHero: () => <div data-testid="landing-brain-hero" />
}))

vi.mock("../components/landing-differentiator-cards", () => ({
  LandingDifferentiatorCards: () => <div data-testid="landing-differentiator-cards">Tre scelte di design</div>
}))

vi.mock("../components/motion-primitives", () => ({
  AppleFluidBackground: () => <div data-testid="apple-fluid-background" />,
  CinematicTextReveal: ({ text }: { text: string }) => <>{text}</>,
  CinematicScrollCard: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

describe("LandingPage", () => {
  it("renders the public acquisition story and keeps navigation constrained to the landing plus app entry", () => {
    render(<LandingPage />)

    expect(screen.getAllByTestId("brand-logo").length).toBeGreaterThan(0)
    expect(screen.getByRole("heading", { name: /Capisci il mese prima di prendere una decisione\./i })).toBeInTheDocument()
    expect(screen.getByText(/stima il margine del mese e ti aiuta a valutare una nuova spesa fissa/i)).toBeInTheDocument()
    expect(screen.getByText("Elaborazione in locale")).toBeInTheDocument()
    expect(screen.getByText("Nessun collegamento bancario obbligatorio")).toBeInTheDocument()
    expect(screen.getAllByText("Prova con dati demo").length).toBeGreaterThan(0)
    expect(screen.getByRole("region", { name: /Il saldo non basta\./i })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: /Quattro passaggi, nessun rito\./i })).toBeInTheDocument()
    expect(screen.getByText(/Importi un CSV, leggi il mese/i)).toBeInTheDocument()
    expect(screen.getByRole("region", { name: /Meno attrito\./i })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: /Le risposte che servono prima di fidarti\./i })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: /Apri Numa\. Parti da/i })).toBeInTheDocument()

    expect(screen.getByTestId("landing-differentiator-cards")).toBeInTheDocument()
    expect(screen.getByTestId("landing-brain-hero")).toBeInTheDocument()

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"))
    expect(hrefs.length).toBeGreaterThan(0)
    expect(
      hrefs.every(
        (href) =>
          href === "/dashboard" ||
          href === "/transactions/import" ||
          href === "/faq" ||
          href === "/privacy" ||
          href === "/updates" ||
          href?.startsWith("#")
      )
    ).toBe(true)
    expect(screen.getAllByRole("link", { name: /Apri Numa/i }).length).toBeGreaterThan(0)
    expect(screen.getByRole("link", { name: /Aggiornamenti/i })).toBeInTheDocument()
    expect(screen.queryByText("Contatti")).not.toBeInTheDocument()
  })
})
