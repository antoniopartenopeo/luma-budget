import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingHeroEditorial } from "../landing-hero-editorial"
import { LANDING_HERO_EDITORIAL } from "../../content"

let mockReducedMotion = false

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

vi.mock("../motion-primitives", () => ({
  AppleFluidBackground: () => <div data-testid="apple-fluid-background" />
}))

describe("LandingHeroEditorial", () => {
  it("renders the editorial hero content, prism panels, and primary actions", () => {
    mockReducedMotion = false
    render(<LandingHeroEditorial />)

    expect(screen.getByRole("heading", { name: LANDING_HERO_EDITORIAL.srTitle })).toBeInTheDocument()
    expect(screen.getAllByTestId("brand-logo")).toHaveLength(1)
    expect(screen.getByText(LANDING_HERO_EDITORIAL.headline)).toBeInTheDocument()
    expect(screen.getByText(LANDING_HERO_EDITORIAL.supportingCopy)).toBeInTheDocument()
    expect(screen.getByText(LANDING_HERO_EDITORIAL.microcopy)).toBeInTheDocument()
    expect(screen.getAllByTestId("landing-hero-prism-panel")).toHaveLength(3)
    expect(screen.getByText("Privacy")).toBeInTheDocument()
    expect(screen.getByText("Budget")).toBeInTheDocument()
    expect(screen.getByText("Previsione")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Prova Numa gratis/i })).toHaveAttribute("href", "/dashboard")
    expect(screen.getByRole("link", { name: /Guarda una demo/i })).toHaveAttribute("href", "/transactions/import")

    const hero = screen.getByTestId("landing-hero-editorial")
    expect(hero).not.toHaveTextContent(/\blocal-first\b/i)
    expect(hero).not.toHaveTextContent(/\bmargine\b/i)
    expect(hero).not.toHaveTextContent(/\bCSV\b/i)
    expect(hero).not.toHaveTextContent(/estratto conto/i)
    expect(hero).not.toHaveTextContent(/\bBrain\b/i)
    expect(hero).not.toHaveTextContent(/Financial Lab/i)
  })

  it("keeps the same hero composition when reduced motion is enabled", () => {
    mockReducedMotion = true
    render(<LandingHeroEditorial />)

    expect(screen.getByRole("heading", { name: LANDING_HERO_EDITORIAL.srTitle })).toBeInTheDocument()
    expect(screen.getAllByTestId("landing-hero-prism-panel")).toHaveLength(3)
    expect(screen.getByText(LANDING_HERO_EDITORIAL.headline)).toBeInTheDocument()
    expect(screen.getByText(LANDING_HERO_EDITORIAL.supportingCopy)).toBeInTheDocument()
    expect(screen.getByText(LANDING_HERO_EDITORIAL.microcopy)).toBeInTheDocument()
    expect(screen.getByText("I tuoi dati restano sul dispositivo")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Prova Numa gratis/i })).toBeInTheDocument()
  })
})
