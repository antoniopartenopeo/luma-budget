import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingBrainHero } from "../landing-brain-hero"

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  const MotionDiv = React.forwardRef<HTMLDivElement, Record<string, unknown> & { children?: React.ReactNode }>(
    ({ children, ...props }, ref) => {
      const elementProps = { ...props }
      delete elementProps.initial
      delete elementProps.animate
      delete elementProps.transition
      delete elementProps.variants
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
    useReducedMotion: () => true,
    useScroll: () => ({
      scrollYProgress: {
        on: () => () => undefined
      }
    }),
    useSpring: (value: unknown) => value,
    useTransform: (_value: unknown, _input: unknown, output: unknown[]) => output[0]
  }
})

describe("LandingBrainHero", () => {
  it("keeps the public Brain explainer calm, local-first, and readiness-aware", () => {
    render(<LandingBrainHero />)

    expect(screen.getByRole("heading", { name: /Quando il Brain e pronto, ti mostra il possibile dopo/i })).toBeInTheDocument()
    expect(screen.getByText(/La previsione resta prudente/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Affidabilita 78%/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Numa dichiara il fallback e usa la base storica/i)).toBeInTheDocument()
    expect(screen.queryByText(/SYNC_BANK_API/i)).not.toBeInTheDocument()
  })
})
