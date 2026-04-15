import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingCoverFlow } from "../landing-cover-flow"

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  const createMotionElement = (tag: keyof JSX.IntrinsicElements) => {
    const MotionElement = React.forwardRef<HTMLElement, Record<string, unknown> & { children?: React.ReactNode }>(
      ({ children, ...props }, ref) => {
        const elementProps = { ...props }
        delete elementProps.initial
        delete elementProps.animate
        delete elementProps.exit
        delete elementProps.transition
        delete elementProps.layout
        delete elementProps.layoutId
        delete elementProps.whileHover
        delete elementProps.whileInView
        delete elementProps.viewport

        return React.createElement(tag, { ref, ...elementProps }, children as React.ReactNode)
      }
    )

    MotionElement.displayName = `Motion${tag}`
    return MotionElement
  }

  const motionProxy = new Proxy({}, {
    get: (_target, property) => {
      if (property === "button") return createMotionElement("button")
      if (property === "svg") return createMotionElement("svg")
      if (property === "rect") return createMotionElement("rect")
      if (property === "g") return createMotionElement("g")
      return createMotionElement("div")
    }
  })

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    m: motionProxy,
    motion: motionProxy,
  }
})

describe("LandingCoverFlow", () => {
  it("renders the five static previews and starts from Visione Chiara", () => {
    render(<LandingCoverFlow />)

    expect(screen.getByRole("button", { name: /^Sorgenti$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Movimenti$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Visione Chiara$/i })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /^Input Veloce$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Impatto Fisso$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Visione Chiara\. Vedi come Numa stima il margine del mese/i })).toHaveAttribute("aria-pressed", "true")
  })

  it("switches the active card when a selector pill is clicked", () => {
    render(<LandingCoverFlow />)

    fireEvent.click(screen.getByRole("button", { name: /^Sorgenti$/i }))

    expect(screen.getByRole("button", { name: /Sorgenti\. Organizzi quello che hai gia/i })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /Visione Chiara\. Vedi come Numa stima il margine del mese/i })).toHaveAttribute("aria-pressed", "false")
  })

  it("supports keyboard navigation on the preview cards", () => {
    render(<LandingCoverFlow />)

    fireEvent.keyDown(
      screen.getByRole("button", { name: /Visione Chiara\. Vedi come Numa stima il margine del mese/i }),
      { key: "ArrowRight" }
    )

    expect(screen.getByRole("button", { name: /Input Veloce\. Provi una nuova spesa/i })).toHaveAttribute("aria-pressed", "true")
  })
})
