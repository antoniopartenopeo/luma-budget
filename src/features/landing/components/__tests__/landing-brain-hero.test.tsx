import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingBrainHero } from "../landing-brain-hero"
import { LANDING_BRAIN_CONTENT } from "../../content"

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  const createMotionElement = (tag: string) => {
    const MotionElement = React.forwardRef<HTMLElement, Record<string, unknown> & { children?: React.ReactNode }>(
      ({ children, ...props }, ref) => {
      const elementProps = { ...props }
      delete elementProps.initial
      delete elementProps.animate
      delete elementProps.transition
      delete elementProps.variants
      delete elementProps.viewport
      delete elementProps.whileInView

      return (
        React.createElement(tag, { ref, ...elementProps }, children as React.ReactNode)
      )
      }
    )
    MotionElement.displayName = `Motion${tag}`
    return MotionElement
  }

  const motionProxy = new Proxy({}, {
    get: (_target, property) => createMotionElement(String(property))
  })

  return {
    m: motionProxy,
    motion: motionProxy,
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

vi.mock("@/hooks/use-device-hardware", () => ({
  useDeviceHardware: () => ({
    safeToAnimate3D: false
  })
}))

describe("LandingBrainHero", () => {
  it("displays the cinematic Brain explainer with the predictive engine copy", () => {
    render(<LandingBrainHero />)

    LANDING_BRAIN_CONTENT.acts.forEach((act) => {
      expect(screen.getByText(act.kicker)).toBeInTheDocument()
      expect(screen.getByRole("heading", { name: act.titleLines.join(" ") })).toBeInTheDocument()
      expect(screen.getByText(act.description)).toBeInTheDocument()
    })
    expect(screen.getByTestId("landing-brain-estimate-graph")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /Curva Numa/i })).toBeInTheDocument()
    expect(screen.getAllByText("Dati caricati").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Niente magie")).toBeInTheDocument()
    expect(screen.queryByText(/SYNC_BANK_API/i)).not.toBeInTheDocument()
  })
})
