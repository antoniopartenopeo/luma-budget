import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingProductDemo } from "../landing-product-demo"

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
  it("starts from the first step, keeps the experience inside the landing, and updates the active step on focus", () => {
    render(<LandingProductDemo />)

    expect(screen.getByText(/Step attivo: Importi lo storico senza caos/i)).toBeInTheDocument()
    expect(screen.getByTestId("preview-import")).toHaveTextContent("active")
    expect(screen.queryByRole("link")).not.toBeInTheDocument()

    fireEvent.focus(screen.getByTestId("landing-demo-step-overview"))

    expect(screen.getByText(/Step attivo: Capisci il mese da una sola schermata/i)).toBeInTheDocument()
    expect(screen.getByTestId("preview-overview")).toHaveTextContent("active")
  })
})
