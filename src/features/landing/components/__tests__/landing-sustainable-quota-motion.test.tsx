import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LANDING_COMPARISON_QA_SECTION } from "../../content"
import { LandingSustainableQuotaMotion } from "../landing-sustainable-quota-motion"

let mockReducedMotion = false

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  const createMotionElement = (tagName: string) => {
    const MotionElement = React.forwardRef<HTMLElement, Record<string, unknown> & { children?: React.ReactNode }>(
      ({ children, ...props }, ref) => {
        const elementProps = { ...props }
        const initial = elementProps.initial

        delete elementProps.initial
        delete elementProps.animate
        delete elementProps.exit
        delete elementProps.transition
        delete elementProps.viewport
        delete elementProps.whileInView

        return React.createElement(
          tagName,
          {
            ref,
            "data-motion-initial": initial === false ? "false" : initial ? "animated" : "none",
            ...elementProps
          },
          children as React.ReactNode
        )
      }
    )

    MotionElement.displayName = `Motion${tagName}`
    return MotionElement
  }

  const motionProxy = new Proxy({}, {
    get: (_target, property) => createMotionElement(String(property))
  })

  return {
    m: motionProxy,
    motion: motionProxy,
    useReducedMotion: () => mockReducedMotion
  }
})

vi.mock("@/components/ui/brand-logo", () => ({
  BrandLogo: ({ preset, variant }: { preset?: string; variant?: string }) => (
    <div data-testid="brand-logo" data-preset={preset} data-variant={variant}>
      NUMA
    </div>
  )
}))

describe("LandingSustainableQuotaMotion", () => {
  it("renders the quota section as a named region using the shared header logo preset", () => {
    mockReducedMotion = false

    render(<LandingSustainableQuotaMotion />)

    const region = screen.getByRole("region", { name: LANDING_COMPARISON_QA_SECTION.eyebrow })

    expect(within(region).getByRole("heading", { name: LANDING_COMPARISON_QA_SECTION.eyebrow })).toBeInTheDocument()
    expect(screen.getByText("380")).toBeInTheDocument()
    expect(screen.getByText("/mese")).toBeInTheDocument()
    expect(screen.getByText(LANDING_COMPARISON_QA_SECTION.description)).toBeInTheDocument()
    expect(screen.getByText("L'IA legge il mese")).toBeInTheDocument()
    expect(screen.getByText("Niente importo da provare")).toBeInTheDocument()
    expect(screen.getByText("Protegge il buffer")).toBeInTheDocument()
    expect(screen.getByText("Nuova spesa massima")).toBeInTheDocument()
    expect(screen.getByText(LANDING_COMPARISON_QA_SECTION.summary)).toHaveClass("sr-only")
    expect(screen.getByTestId("brand-logo")).toHaveAttribute("data-variant", "full")
    expect(screen.getByTestId("brand-logo")).toHaveAttribute("data-preset", "header")
  })

  it("keeps the same content surface when reduced motion is enabled", () => {
    mockReducedMotion = true

    render(<LandingSustainableQuotaMotion />)

    expect(screen.getByRole("region", { name: LANDING_COMPARISON_QA_SECTION.eyebrow })).toBeInTheDocument()
    expect(screen.getByText("Entrate nette")).toBeInTheDocument()
    expect(screen.getByText("Costi fissi")).toBeInTheDocument()
    expect(screen.getByText("Campo manuale")).toBeInTheDocument()
    expect(screen.getAllByText(LANDING_COMPARISON_QA_SECTION.summaryTitle).length).toBeGreaterThan(0)
  })
})
