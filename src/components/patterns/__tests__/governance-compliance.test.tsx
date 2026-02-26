import { fireEvent, render, screen } from "@testing-library/react"
import { Calculator } from "lucide-react"
import { describe, expect, it, vi } from "vitest"
import { KpiCard } from "../kpi-card"
import { MacroSection } from "../macro-section"
import { SubSectionCard } from "../sub-section-card"

// UI governance regression tests.
// References:
// - /.agent/rules/ui-regression-checklist.md
// - /docs/governance/governance-ui-execution-standards.md

describe("UI Governance Compliance (Premium 3D)", () => {
    describe("MacroSection", () => {
        it("applies macro geometry and material contract", () => {
            render(<MacroSection title="Macro">Body</MacroSection>)

            const card = screen.getByTestId("macro-card")
            expect(card).toHaveClass("rounded-[2.5rem]", "glass-panel", "overflow-hidden", "shadow-xl")
        })

        it("adds semantic visual cues for warning and critical states", () => {
            const { rerender } = render(
                <MacroSection title="Health" status="warning">
                    Body
                </MacroSection>
            )

            const card = screen.getByTestId("macro-card")
            expect(card).toHaveClass("ring-amber-500/20")

            rerender(
                <MacroSection title="Health" status="critical">
                    Body
                </MacroSection>
            )
            expect(screen.getByTestId("macro-card")).toHaveClass("ring-rose-500/20")
        })
    })

    describe("KpiCard", () => {
        it("keeps glass-card structure and tabular numbers", () => {
            render(<KpiCard title="Saldo" value="€100" icon={Calculator} comparisonLabel="vs mese scorso" />)

            const title = screen.getByText("Saldo")
            const card = title.closest('[data-slot="card"]')
            expect(card).toBeInTheDocument()
            expect(card).toHaveClass("glass-card", "rounded-xl")

            const value = screen.getByText("€100")
            const valueRow = value.closest("div")
            expect(valueRow).toBeInTheDocument()
            expect(valueRow).toHaveClass("tabular-nums", "break-words")
        })

        it("adds interactive affordance only when clickable", () => {
            const onClick = vi.fn()
            const { rerender } = render(<KpiCard title="Spesa" value="€42" icon={Calculator} onClick={onClick} />)

            const clickableCard = screen.getByText("Spesa").closest('[data-slot="card"]')
            expect(clickableCard).toBeInTheDocument()
            expect(clickableCard).toHaveClass("cursor-pointer", "active:scale-[0.98]")

            fireEvent.click(clickableCard as Element)
            expect(onClick).toHaveBeenCalledTimes(1)

            rerender(<KpiCard title="Spesa" value="€42" icon={Calculator} />)
            const staticCard = screen.getByText("Spesa").closest('[data-slot="card"]')
            expect(staticCard).toBeInTheDocument()
            expect(staticCard).not.toHaveClass("cursor-pointer")
        })
    })

    describe("SubSectionCard", () => {
        it("uses default inner-depth material", () => {
            const { container } = render(<SubSectionCard label="Inner">Content</SubSectionCard>)
            const card = container.firstElementChild
            expect(card).toBeInTheDocument()
            expect(card).toHaveClass("glass-card", "rounded-xl")
        })

        it("supports accent variant tokens", () => {
            const { container } = render(
                <SubSectionCard label="Accent" variant="accent" extra={<span>Meta</span>}>
                    Content
                </SubSectionCard>
            )

            const card = container.firstElementChild
            expect(card).toBeInTheDocument()
            expect(card).toHaveClass("from-primary/10", "to-cyan-500/5", "border-primary/20")
            expect(screen.getByText("Meta")).toBeInTheDocument()
        })
    })
})
