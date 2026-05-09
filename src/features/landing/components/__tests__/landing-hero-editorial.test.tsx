import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingHeroEditorial } from "../landing-hero-editorial"
import { LANDING_HERO_EDITORIAL } from "../../content"

let mockReducedMotion = false

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  const MotionElement = React.forwardRef<HTMLDivElement, Record<string, unknown> & { children?: React.ReactNode }>(
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

  MotionElement.displayName = "MotionElement"
  const motionProxy = new Proxy({}, { get: () => MotionElement })

  return {
    m: motionProxy,
    motion: motionProxy,
    useReducedMotion: () => mockReducedMotion,
    useScroll: () => ({
      scrollYProgress: 0
    }),
    useTransform: (_value: unknown, _input: unknown, output: unknown[]) => output[0]
  }
})

vi.mock("@/components/ui/brand-logo", () => ({
  BrandLogo: () => <div data-testid="brand-logo">NUMA</div>
}))

describe("LandingHeroEditorial", () => {
  it("renders the editorial hero content without duplicating the primary action", () => {
    mockReducedMotion = false
    render(<LandingHeroEditorial />)

    expect(screen.getByRole("heading", { name: LANDING_HERO_EDITORIAL.srTitle })).toBeInTheDocument()
    expect(screen.queryByTestId("brand-logo")).not.toBeInTheDocument()
    expect(screen.getAllByText(/Pianifica i tuoi soldi/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/una risposta chiara/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(LANDING_HERO_EDITORIAL.supportingCopy)).toBeInTheDocument()
    expect(screen.getByTestId("landing-hero-object")).toBeInTheDocument()
    expect(screen.getByText("A fine mese")).toBeInTheDocument()
    expect(screen.getByText("Puoi aggiungere")).toBeInTheDocument()
    expect(screen.getByText("Scarica l'app")).toBeInTheDocument()
    expect(screen.queryByText("Guarda come funziona")).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: new RegExp(LANDING_HERO_EDITORIAL.primaryCtaLabel, "i") })).not.toBeInTheDocument()
    expect(screen.queryByText(/In tre mosse/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Apri una demo sicura/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Nessun account obbligatorio\. I dati restano sul tuo dispositivo\./i)).not.toBeInTheDocument()

    const hero = screen.getByTestId("landing-hero-editorial")
    expect(hero).not.toHaveClass("dark")
    expect(hero).not.toHaveTextContent(/\blocal-first\b/i)
    expect(hero).not.toHaveTextContent(/\bCSV\b/i)
    expect(hero).not.toHaveTextContent(/estratto conto/i)
    expect(hero).not.toHaveTextContent(/Financial Lab/i)
  })

  it("keeps the same hero composition when reduced motion is enabled", () => {
    mockReducedMotion = true
    render(<LandingHeroEditorial />)

    expect(screen.getByRole("heading", { name: LANDING_HERO_EDITORIAL.srTitle })).toBeInTheDocument()
    expect(screen.getByTestId("landing-hero-object")).toBeInTheDocument()
    expect(screen.getAllByText(/Pianifica i tuoi soldi/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(LANDING_HERO_EDITORIAL.supportingCopy)).toBeInTheDocument()
    expect(screen.getByText(LANDING_HERO_EDITORIAL.trustItems.join(" · "))).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: new RegExp(LANDING_HERO_EDITORIAL.primaryCtaLabel, "i") })).not.toBeInTheDocument()
    expect(screen.queryByText(/Apri una demo sicura/i)).not.toBeInTheDocument()
  })
})
