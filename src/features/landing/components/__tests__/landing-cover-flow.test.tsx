import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { LandingCoverFlow } from "../landing-cover-flow"

const useDeviceHardwareMock = vi.hoisted(() => vi.fn(() => ({
  safeToAnimate3D: true
})))

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react")
  type MockTag = "div" | "button" | "svg" | "rect" | "g"

  const createMotionElement = (tag: MockTag) => {
    const MotionElement = React.forwardRef<HTMLElement, Record<string, unknown> & { children?: React.ReactNode }>(
      ({ children, ...props }, ref) => {
        const elementProps = { ...props }
        const hasFilterAnimation =
          typeof elementProps.animate === "object" &&
          elementProps.animate !== null &&
          "filter" in elementProps.animate
        const filterAnimation =
          hasFilterAnimation &&
          typeof (elementProps.animate as { filter?: unknown }).filter === "string"
            ? (elementProps.animate as { filter: string }).filter
            : undefined
        delete elementProps.initial
        delete elementProps.animate
        delete elementProps.exit
        delete elementProps.transition
        delete elementProps.layout
        delete elementProps.layoutId
        delete elementProps.whileHover
        delete elementProps.whileInView
        delete elementProps.viewport

        return React.createElement(
          String(tag),
          {
            ref,
            ...elementProps,
            "data-has-filter-animation": hasFilterAnimation ? "true" : "false",
            "data-filter-animation": filterAnimation,
          },
          children as React.ReactNode
        )
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

vi.mock("@/hooks/use-device-hardware", () => ({
  useDeviceHardware: () => useDeviceHardwareMock()
}))

describe("LandingCoverFlow", () => {
  beforeEach(() => {
    useDeviceHardwareMock.mockReturnValue({
      safeToAnimate3D: true
    })
  })

  it("renders the five narrative rail states and starts from Quanto ti resta", () => {
    render(<LandingCoverFlow />)

    expect(screen.getByRole("button", { name: /^Importa: Importa il mese$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Capisci: Capisci le uscite$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Resta: Quanto ti resta$/i })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /^Quota: Quota sostenibile$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Costi: Costi fissi$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Quanto ti resta\. Il numero semplice per decidere con più calma/i })).toBeInTheDocument()
    expect(screen.getByText("1.245")).toBeInTheDocument()
    expect(screen.getByText("Entrate - uscite stimate = quanto resta")).toBeInTheDocument()
    expect(screen.getAllByText("+ € 2.300").length).toBeGreaterThan(0)
    expect(screen.getAllByText("- € 1.055").length).toBeGreaterThan(0)
    expect(screen.getAllByText("+ € 1.245").length).toBeGreaterThan(0)
    expect(screen.getByText("Scenario prudente")).toBeInTheDocument()
    expect(document.querySelector("[data-visual-state=\"center\"]")).toHaveAttribute("data-filter-animation", "blur(0px)")
  })

  it("switches the active card when a selector pill is clicked", () => {
    render(<LandingCoverFlow />)

    fireEvent.click(screen.getByRole("button", { name: /^Importa: Importa il mese$/i }))

    expect(screen.getByRole("button", { name: /^Importa: Importa il mese$/i })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /^Resta: Quanto ti resta$/i })).toHaveAttribute("aria-pressed", "false")
  })

  it("supports keyboard navigation on the preview cards", () => {
    render(<LandingCoverFlow />)

    fireEvent.keyDown(
      screen.getByRole("button", { name: /Quanto ti resta\. Il numero semplice per decidere con più calma/i }),
      { key: "ArrowRight" }
    )

    expect(screen.getByRole("button", { name: /^Quota: Quota sostenibile$/i })).toHaveAttribute("aria-pressed", "true")
  })

  it("does not animate blur when hardware visual effects are reduced", () => {
    useDeviceHardwareMock.mockReturnValue({
      safeToAnimate3D: false
    })

    render(<LandingCoverFlow />)

    const cards = screen.getAllByTestId("landing-cover-flow")[0].querySelectorAll("[data-visual-state]")

    expect(cards.length).toBeGreaterThan(0)
    cards.forEach((card) => {
      expect(card).toHaveAttribute("data-reduced-visual-effects", "true")
      expect(card).toHaveAttribute("data-has-filter-animation", "false")
    })
  })
})
