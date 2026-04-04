import { act, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingDifferentiatorCards } from "../landing-differentiator-cards"
import { LANDING_DIFFERENTIATORS } from "../../content"

let scrollChangeHandler: ((value: number) => void) | null = null
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

      return (
        <div ref={ref} {...elementProps}>
          {children as React.ReactNode}
        </div>
      )
    }
  )

  MotionDiv.displayName = "MotionDiv"

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: MotionDiv
    },
    useReducedMotion: () => mockReducedMotion,
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

describe("LandingDifferentiatorCards", () => {
  it("renders the editorial Numa scene and swaps the active differentiator while scrolling", () => {
    mockReducedMotion = false
    render(<LandingDifferentiatorCards />)

    expect(screen.getByRole("heading", { name: /I tuoi soldi,\s*senza passare da altri server\./i })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: LANDING_DIFFERENTIATORS[0].title })).toBeInTheDocument()
    expect(screen.getByText(LANDING_DIFFERENTIATORS[0].numaLabel)).toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()

    act(() => {
      scrollChangeHandler?.(0.42)
    })

    expect(screen.getByRole("heading", { name: LANDING_DIFFERENTIATORS[1].title })).toBeInTheDocument()
    expect(screen.getByText(LANDING_DIFFERENTIATORS[1].numaLabel)).toBeInTheDocument()

    act(() => {
      scrollChangeHandler?.(0.9)
    })

    expect(screen.getByRole("heading", { name: LANDING_DIFFERENTIATORS[2].title })).toBeInTheDocument()
    expect(screen.getByText(LANDING_DIFFERENTIATORS[2].numaLabel)).toBeInTheDocument()
  })

  it("keeps the same hero composition when reduced motion is enabled", () => {
    mockReducedMotion = true
    render(<LandingDifferentiatorCards />)

    expect(screen.getByRole("heading", { name: LANDING_DIFFERENTIATORS[0].title })).toBeInTheDocument()
    expect(screen.getByText(LANDING_DIFFERENTIATORS[0].numaLabel)).toBeInTheDocument()
    expect(screen.queryByText(LANDING_DIFFERENTIATORS[1].numaLabel)).not.toBeInTheDocument()
  })
})
