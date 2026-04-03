import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingHeroEditorial } from "../landing-hero-editorial"
import { LANDING_HERO_EDITORIAL } from "../../data"

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
  AppleFluidBackground: () => <div data-testid="apple-fluid-background" />,
  CinematicTextReveal: ({ text }: { text: string }) => <>{text}</>
}))

describe("LandingHeroEditorial", () => {
  it("renders the editorial hero content, prism panels, and primary actions", () => {
    mockReducedMotion = false
    render(<LandingHeroEditorial />)

    expect(screen.getByRole("heading", { name: LANDING_HERO_EDITORIAL.srTitle })).toBeInTheDocument()
    expect(screen.getAllByTestId("brand-logo")).toHaveLength(1)
    expect(screen.getByText(LANDING_HERO_EDITORIAL.trustPhrase)).toBeInTheDocument()
    expect(screen.getAllByTestId("landing-hero-prism-panel")).toHaveLength(3)
    expect(screen.getByText("Locale")).toBeInTheDocument()
    expect(screen.getByText("Margine")).toBeInTheDocument()
    expect(screen.getByText("Stima")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Apri Numa/i })).toHaveAttribute("href", "/dashboard")
    expect(screen.getByRole("link", { name: /Prova app demo/i })).toHaveAttribute("href", "/transactions/import")
  })

  it("keeps the same hero composition when reduced motion is enabled", () => {
    mockReducedMotion = true
    render(<LandingHeroEditorial />)

    expect(screen.getByRole("heading", { name: LANDING_HERO_EDITORIAL.srTitle })).toBeInTheDocument()
    expect(screen.getAllByTestId("landing-hero-prism-panel")).toHaveLength(3)
    expect(screen.getByText(LANDING_HERO_EDITORIAL.trustPhrase)).toBeInTheDocument()
    expect(screen.getByText("I dati restano qui")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Apri Numa/i })).toBeInTheDocument()
  })
})
