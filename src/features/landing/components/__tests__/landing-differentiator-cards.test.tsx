import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingDifferentiatorCards } from "../landing-differentiator-cards"
import { LANDING_DIFFERENCE_SECTION, LANDING_DIFFERENTIATORS } from "../../content"
let mockReducedMotion = false

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  const MotionDiv = React.forwardRef<HTMLDivElement, Record<string, unknown> & { children?: React.ReactNode }>(
    ({ children, ...props }, ref) => {
      const elementProps = { ...props }
      delete elementProps.initial
      delete elementProps.animate
      delete elementProps.exit
      delete elementProps.transition
      delete elementProps.variants
      delete elementProps.whileHover
      delete elementProps.whileInView
      delete elementProps.viewport

      return (
        <div ref={ref} {...elementProps}>
          {children as React.ReactNode}
        </div>
      )
    }
  )

  MotionDiv.displayName = "MotionDiv"
  const motionProxy = new Proxy({}, { get: () => MotionDiv })

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    m: motionProxy,
    motion: motionProxy,
    useInView: () => true,
    useReducedMotion: () => mockReducedMotion,
    useScroll: () => ({ scrollYProgress: 0 })
  }
})

vi.mock("@/hooks/use-hardware-parallax", () => ({
  useHardwareParallax: () => ({
    rotateX: 0,
    rotateY: 0,
    backgroundPosition: "50% 50%",
    handleMouseMove: () => undefined,
    handleMouseLeave: () => undefined
  })
}))

describe("LandingDifferentiatorCards", () => {
  it("renders the editorial Numa scene and the three differentiators", () => {
    mockReducedMotion = false
    render(<LandingDifferentiatorCards />)

    expect(screen.getByRole("heading", { name: LANDING_DIFFERENCE_SECTION.title })).toBeInTheDocument()
    LANDING_DIFFERENTIATORS.forEach((item) => {
      expect(screen.getByRole("heading", { name: item.title })).toBeInTheDocument()
      expect(screen.getAllByText(item.numaLabel).length).toBeGreaterThan(0)
    })
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it("keeps the same hero composition when reduced motion is enabled", () => {
    mockReducedMotion = true
    render(<LandingDifferentiatorCards />)

    expect(screen.getByRole("heading", { name: LANDING_DIFFERENTIATORS[0].title })).toBeInTheDocument()
    expect(screen.getAllByText(LANDING_DIFFERENTIATORS[0].numaLabel).length).toBeGreaterThan(0)
    expect(screen.getByRole("heading", { name: LANDING_DIFFERENTIATORS[1].title })).toBeInTheDocument()
  })
})
