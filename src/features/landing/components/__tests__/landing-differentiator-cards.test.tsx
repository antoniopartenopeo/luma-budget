import { act, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingDifferentiatorCards } from "../landing-differentiator-cards"

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

    expect(screen.getByRole("heading", { name: /Nessun intermediario tra te e i tuoi dati/i })).toBeInTheDocument()
    expect(screen.getByText(/La differenza con Numa/i)).toBeInTheDocument()
    expect(screen.getByText(/dato nasce e resta sul tuo dispositivo/i)).toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()

    act(() => {
      scrollChangeHandler?.(0.42)
    })

    expect(screen.getByRole("heading", { name: /Nessun metodo da studiare prima/i })).toBeInTheDocument()
    expect(screen.getByText(/Importi i movimenti e Numa li organizza/i)).toBeInTheDocument()

    act(() => {
      scrollChangeHandler?.(0.9)
    })

    expect(screen.getByRole("heading", { name: /Numeri concreti, non promesse generiche/i })).toBeInTheDocument()
    expect(screen.getByText(/livello di affid/i)).toBeInTheDocument()
  })

  it("keeps the same hero composition when reduced motion is enabled", () => {
    mockReducedMotion = true
    render(<LandingDifferentiatorCards />)

    expect(screen.getByRole("heading", { name: /Nessun intermediario tra te e i tuoi dati/i })).toBeInTheDocument()
    expect(screen.getByText(/La differenza con Numa/i)).toBeInTheDocument()
    expect(screen.getByText(/dato nasce e resta sul tuo dispositivo/i)).toBeInTheDocument()
    expect(screen.queryByText(/Numa non ti chiede di inseguire il denaro/i)).not.toBeInTheDocument()
  })
})
