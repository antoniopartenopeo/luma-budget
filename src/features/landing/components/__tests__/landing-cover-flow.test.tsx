import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingCoverFlow } from "../landing-cover-flow"

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react")
  type MockTag = "div" | "button" | "svg" | "rect" | "g"

  const createMotionElement = (tag: MockTag) => {
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

        return React.createElement(String(tag), { ref, ...elementProps }, children as React.ReactNode)
      }
    )

    MotionElement.displayName = `Motion${String(tag)}`
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
    useMotionTemplate: () => "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)",
    useMotionValue: (initial: number) => ({
      get: () => initial,
      set: () => undefined,
    }),
    useReducedMotion: () => false,
    useSpring: (value: unknown) => value,
    useTransform: (_value: unknown, _input: unknown, output: unknown[]) => output[0],
  }
})

describe("LandingCoverFlow", () => {
  it("renders the five benefit-led previews and starts from Quanto ti resta", () => {
    render(<LandingCoverFlow />)

    expect(screen.getByRole("button", { name: /^Importa il mese$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Capisci le uscite$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Quanto ti resta$/i })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /^Prova una spesa$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Costi fissi$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Quanto ti resta\. Il numero semplice per decidere con più calma/i })).toBeInTheDocument()
    expect(screen.getByText("1.245")).toBeInTheDocument()
    expect(screen.getByText("Entrate - spese previste = quanto ti resta")).toBeInTheDocument()
    expect(screen.getAllByText("+ € 2.300").length).toBeGreaterThan(0)
    expect(screen.getAllByText("- € 1.055").length).toBeGreaterThan(0)
    expect(screen.getAllByText("- € 42").length).toBeGreaterThan(0)
  })

  it("switches the active card when a selector pill is clicked", () => {
    render(<LandingCoverFlow />)

    fireEvent.click(screen.getByRole("button", { name: /^Importa il mese$/i }))

    expect(screen.getByRole("button", { name: /^Importa il mese$/i })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /^Quanto ti resta$/i })).toHaveAttribute("aria-pressed", "false")
  })

  it("supports keyboard navigation on the preview cards", () => {
    render(<LandingCoverFlow />)

    fireEvent.keyDown(
      screen.getByRole("button", { name: /Quanto ti resta\. Il numero semplice per decidere con più calma/i }),
      { key: "ArrowRight" }
    )

    expect(screen.getByRole("button", { name: /^Prova una spesa$/i })).toHaveAttribute("aria-pressed", "true")
  })
})
