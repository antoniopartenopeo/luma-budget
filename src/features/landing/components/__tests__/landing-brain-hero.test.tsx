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
    useTransform: (_value: unknown, _input: unknown, output: unknown[]) => output[0],
    useMotionTemplate: (strings: string[]) => strings.join("")
  }
})

describe("LandingBrainHero", () => {
  it("displays the cinematic Brain explainer with the predictive engine copy", () => {
    render(<LandingBrainHero />)

    expect(screen.getByRole("heading", { name: /Numa osserva le tue abitudini e ti aiuta a prevedere il mese\./i })).toBeInTheDocument()
    expect(screen.getByText(/ti mostra una stima realistica di quanto potrebbe restarti a fine mese\./i)).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /Ti aiuta a decidere, non a indovinare\./i })).toBeInTheDocument()
    expect(screen.getByText(/La stima serve a capire se una spesa nuova è sostenibile/i)).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /Numa te lo dice chiaramente, senza forzare la previsione\./i })).toBeInTheDocument()
    expect(screen.getByText(/Se il quadro è troppo incompleto per una stima affidabile/i)).toBeInTheDocument()
    expect(screen.queryByText(/SYNC_BANK_API/i)).not.toBeInTheDocument()
  })
})
