import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingProductDemo } from "../landing-product-demo"

let scrollChangeHandler: ((value: number) => void) | null = null

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  const MotionDiv = React.forwardRef<HTMLDivElement, Record<string, any>>(
    ({ children, ...props }, ref) => {
      const elementProps = { ...props }
      delete elementProps.initial
      delete elementProps.animate
      delete elementProps.transition
      delete elementProps.variants
      delete elementProps.viewport

      return (
        <div ref={ref} {...elementProps}>
          {children}
        </div>
      )
    }
  )

  MotionDiv.displayName = "MotionDiv"

  return {
    motion: {
      div: MotionDiv
    },
    useScroll: () => ({
      scrollYProgress: {
        on: (event: string, callback: (value: number) => void) => {
          if (event === "change") {
            scrollChangeHandler = callback
          }

          return () => {
            if (scrollChangeHandler === callback) {
              scrollChangeHandler = null
            }
          }
        }
      }
    })
  }
})

vi.mock("../landing-previews", () => ({
  LandingStepPreview: ({
    step,
    isActive
  }: {
    step: { id: string }
    isActive: boolean
  }) => (
    <div data-testid={`preview-${step.id}`}>{isActive ? "active" : "inactive"}</div>
  )
}))

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)

describe("LandingProductDemo", () => {
  it("starts from the first step, keeps the experience inside the landing, and updates the active step on focus or scroll", () => {
    render(<LandingProductDemo />)

    expect(screen.getByText(/Step attivo: Importi lo storico senza caos/i)).toBeInTheDocument()
    expect(screen.getByTestId("preview-import")).toHaveTextContent("active")
    expect(screen.queryByRole("link")).not.toBeInTheDocument()

    fireEvent.focus(screen.getByTestId("landing-demo-step-overview"))

    expect(screen.getByText(/Step attivo: Capisci il mese da una sola schermata/i)).toBeInTheDocument()
    expect(screen.getByTestId("preview-overview")).toHaveTextContent("active")

    act(() => {
      scrollChangeHandler?.(0.95)
    })

    expect(screen.getByText(/Step attivo: Scopri se una nuova spesa ci sta davvero/i)).toBeInTheDocument()
    expect(screen.getByTestId("preview-scenarios")).toHaveTextContent("active")
  })
})
