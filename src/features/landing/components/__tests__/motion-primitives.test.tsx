import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AppleFluidMesh } from "../motion-primitives"

const useDeviceHardwareMock = vi.fn(() => ({
  safeToAnimate3D: true
}))

vi.mock("@/hooks/use-device-hardware", () => ({
  useDeviceHardware: () => useDeviceHardwareMock()
}))

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react")
  type MockTag = "div" | "svg" | "rect" | "g"

  const createMotionElement = (tag: MockTag, testIdPrefix: string) => {
    const MotionElement = React.forwardRef<HTMLElement, Record<string, unknown> & { children?: React.ReactNode }>(
      ({ children, animate, ...props }, ref) => {
        const elementProps = { ...props }
        delete elementProps.initial
        delete elementProps.exit
        delete elementProps.transition
        delete elementProps.whileInView
        delete elementProps.viewport

        return React.createElement(
          String(tag),
          {
            ref,
            "data-testid": `${testIdPrefix}-${String(tag)}`,
            "data-has-animate": animate ? "true" : "false",
            ...elementProps
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
      if (property === "svg") return createMotionElement("svg", "motion")
      if (property === "rect") return createMotionElement("rect", "motion")
      if (property === "g") return createMotionElement("g", "motion")
      return createMotionElement("div", "motion")
    }
  })

  return {
    m: motionProxy,
    motion: motionProxy,
    useInView: () => true,
    useReducedMotion: () => false,
    useScroll: () => ({
      scrollYProgress: 0
    }),
    useTransform: (_value: unknown, _input: unknown, output: unknown[]) => output[0]
  }
})

describe("AppleFluidMesh", () => {
  it("keeps the fluid layers animated when hardware can sustain the effect", () => {
    useDeviceHardwareMock.mockReturnValue({ safeToAnimate3D: true })

    render(<AppleFluidMesh />)

    expect(screen.getByTestId("motion-rect")).toHaveAttribute("data-has-animate", "true")
    expect(screen.getAllByTestId("motion-g").every((node) => node.getAttribute("data-has-animate") === "true")).toBe(true)
  })

  it("disables the animation loops when the hardware fallback is active", () => {
    useDeviceHardwareMock.mockReturnValue({ safeToAnimate3D: false })

    render(<AppleFluidMesh />)

    expect(screen.getByTestId("motion-rect")).toHaveAttribute("data-has-animate", "false")
    expect(screen.getAllByTestId("motion-g").every((node) => node.getAttribute("data-has-animate") === "false")).toBe(true)
  })
})
