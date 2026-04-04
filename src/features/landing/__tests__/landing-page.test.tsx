import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingPage } from "../landing-page"

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  const MotionDiv = React.forwardRef<HTMLDivElement, Record<string, unknown> & { children?: React.ReactNode }>(
    ({ children, ...props }, ref) => {
      const elementProps = { ...props }
      delete elementProps.initial
      delete elementProps.animate
      delete elementProps.exit
      delete elementProps.transition
      delete elementProps.viewport
      delete elementProps.whileInView

      return (
        <div ref={ref} {...elementProps}>
          {children as React.ReactNode}
        </div>
      )
    }
  )

  MotionDiv.displayName = "MotionDiv"

  return {
    motion: {
      div: MotionDiv
    },
    useReducedMotion: () => false,
    useScroll: () => ({
      scrollYProgress: 0
    }),
    useTransform: (_value: unknown, _input: unknown, output: unknown[]) => output[0]
  }
})

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
  CinematicScrollCard: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

describe("LandingPage", () => {
  it("renders the public acquisition story and keeps navigation constrained to the landing plus app entry", () => {
    render(<LandingPage />)

    expect(screen.getAllByTestId("brand-logo").length).toBeGreaterThan(0)
    expect(screen.getByTestId("landing-hero-editorial")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /Numa Budget/i })).toBeInTheDocument()
    expect(screen.getByText(/Tieni sotto controllo le tue spese\. Senza stress, senza condividere nulla\./i)).toBeInTheDocument()
    expect(screen.getByText(/Numa Budget ti aiuta a capire quanto puoi spendere oggi, a valutare una nuova spesa prima di farla e a tenere tutto sul tuo dispositivo\./i)).toBeInTheDocument()
    expect(screen.getByRole("region", { name: /Sai cosa hai speso\. Non sai quanto puoi ancora spendere\./i })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: /Quattro passaggi\. Nessuna complicazione\./i })).toBeInTheDocument()
    expect(screen.getByText(/Carichi i movimenti dalla banca, vedi il mese in un colpo d'occhio/i)).toBeInTheDocument()
    expect(screen.getByRole("region", { name: /Meno ansia, più chiarezza\./i })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: /Apri il mese\. Poi decidi\./i })).toBeInTheDocument()

    expect(screen.getByTestId("landing-brain-hero")).toBeInTheDocument()

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"))
    expect(hrefs.length).toBeGreaterThan(0)
    expect(
      hrefs.every(
        (href) =>
          href === "/dashboard" ||
          href === "/faq" ||
          href === "/privacy" ||
          href === "/updates" ||
          href?.startsWith("#")
      )
    ).toBe(true)
    expect(screen.getAllByRole("link", { name: /Prova Numa gratis/i }).length).toBeGreaterThan(0)
    expect(screen.queryByRole("link", { name: /Guarda una demo/i })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Aggiornamenti/i })).toBeInTheDocument()
    expect(screen.queryByText("Contatti")).not.toBeInTheDocument()
  })
})
