import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingPage } from "../landing-page"
import {
  LANDING_CLOSING,
  LANDING_COMPARISON_QA_SECTION,
  LANDING_FLOW_STEPS,
  LANDING_HERO_EDITORIAL,
  LANDING_HOW_IT_WORKS_SECTION,
  LANDING_NAV_ITEMS,
  LANDING_OUTCOMES_SECTION,
  LANDING_PROBLEM_SECTION
} from "../content"

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)

vi.mock("framer-motion", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  const MotionElement = React.forwardRef<HTMLDivElement, Record<string, unknown> & { children?: React.ReactNode }>(
    ({ children, ...props }, ref) => {
      const elementProps = { ...props }
      delete elementProps.initial
      delete elementProps.animate
      delete elementProps.exit
      delete elementProps.transition
      delete elementProps.viewport
      delete elementProps.whileInView

      return (
        <div ref={ref} {...elementProps}>
          {children as React.ReactNode}
        </div>
      )
    }
  )

  MotionElement.displayName = "MotionElement"
  const motionProxy = new Proxy({}, { get: () => MotionElement })

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    LazyMotion: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    domAnimation: {},
    m: motionProxy,
    motion: motionProxy,
    useMotionTemplate: () => "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)",
    useMotionValue: (initial: number) => ({
      get: () => initial,
      set: () => undefined,
    }),
    useInView: () => true,
    useReducedMotion: () => false,
    useSpring: (value: unknown) => value,
    useScroll: () => ({
      scrollYProgress: 0
    }),
    useTransform: (_value: unknown, _input: unknown, output: unknown[]) => output[0]
  }
})

vi.mock("@/components/ui/brand-logo", () => ({
  BrandLogo: () => <div data-testid="brand-logo">NUMA</div>
}))

vi.mock("../components/landing-hero-editorial", async () => {
  const content = await vi.importActual<typeof import("../content")>("../content")

  return {
    LandingHeroEditorial: () => (
      <section
        aria-labelledby="landing-hero-title"
        data-testid="landing-hero-editorial"
      >
        <h1 id="landing-hero-title">{content.LANDING_HERO_EDITORIAL.srTitle}</h1>
        <p>{content.LANDING_HERO_EDITORIAL.headline}</p>
        <p>{content.LANDING_HERO_EDITORIAL.supportingCopy}</p>
      </section>
    )
  }
})

describe("LandingPage", () => {
  it("renders the public acquisition story and keeps navigation constrained to the landing plus app entry", () => {
    render(<LandingPage />)

    const header = screen.getByRole("banner").firstElementChild
    expect(header).toHaveClass("max-w-[92rem]")
    expect(header).toHaveClass("text-slate-950")
    expect(header).not.toHaveClass("text-white")

    expect(screen.getAllByTestId("brand-logo").length).toBeGreaterThan(0)
    expect(screen.getByTestId("landing-hero-editorial")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: LANDING_HERO_EDITORIAL.srTitle })).toBeInTheDocument()
    expect(screen.getByText(LANDING_HERO_EDITORIAL.headline)).toBeInTheDocument()
    expect(screen.getByText(LANDING_HERO_EDITORIAL.supportingCopy)).toBeInTheDocument()
    expect(screen.getByRole("region", { name: LANDING_PROBLEM_SECTION.title })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: LANDING_HOW_IT_WORKS_SECTION.title })).toBeInTheDocument()
    LANDING_FLOW_STEPS.forEach((step) => {
      expect(screen.getByText(step.title)).toBeInTheDocument()
    })
    expect(screen.getByRole("region", { name: LANDING_OUTCOMES_SECTION.title })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: LANDING_COMPARISON_QA_SECTION.eyebrow })).toBeInTheDocument()
    expect(screen.getByText("380")).toBeInTheDocument()
    expect(screen.getByText("/mese")).toBeInTheDocument()
    expect(screen.getAllByText("Entrate").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Costi ricorrenti").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Saldo a fine mese").length).toBeGreaterThan(0)
    expect(screen.getByText(LANDING_COMPARISON_QA_SECTION.summaryTitle)).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: LANDING_CLOSING.title })).toBeInTheDocument()

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"))
    expect(hrefs.length).toBeGreaterThan(0)
    expect(
      hrefs.every(
        (href) =>
          href === "/" ||
          href === "/dashboard" ||
          href === "/faq" ||
          href === "/privacy" ||
          href === "/updates" ||
          href?.startsWith("#")
      )
    ).toBe(true)
    expect(screen.getAllByRole("link", { name: new RegExp(LANDING_HERO_EDITORIAL.primaryCtaLabel, "i") }).length).toBeGreaterThan(0)
    expect(screen.queryByRole("link", { name: /Apri una demo sicura/i })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /release log/i })).toBeInTheDocument()
    expect(hrefs).not.toContain("#differenza")
    LANDING_NAV_ITEMS.forEach((item) => {
      const navLink = screen.getByRole("link", { name: item.label })
      expect(navLink).toHaveAttribute("href", item.href)
      expect(navLink).toHaveClass("font-black")
      expect(navLink).toHaveClass("text-slate-950")
    })
    expect(screen.queryByText("Contatti")).not.toBeInTheDocument()
  })
})
