import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { type TopbarPanelId } from "../topbar-panel-id"
import { TopbarQuickTransaction } from "../topbar-quick-transaction"

vi.mock("@/features/transactions/components/quick-expense-input", () => ({
    QuickExpenseInput: ({
        descriptionInputRef,
        onExpenseCreated,
        variant,
    }: {
        descriptionInputRef?: { current: HTMLInputElement | null }
        onExpenseCreated?: () => void
        variant?: string
    }) => (
        <div
            data-testid="quick-expense-input-mock"
            data-has-ref={String(!!descriptionInputRef)}
            data-variant={variant}
        >
            <button type="button" onClick={() => onExpenseCreated?.()}>
                conferma
            </button>
        </div>
    ),
}))

describe("TopbarQuickTransaction", () => {
    it("parte compatto e apre il pannello inline al click", () => {
        render(<TopbarQuickTransaction />)

        expect(screen.queryByTestId("topbar-quick-transaction-panel")).not.toBeInTheDocument()
        expect(screen.getByText("Transazione")).toBeInTheDocument()
        expect(screen.getByText("Nuova")).toBeInTheDocument()

        fireEvent.click(screen.getByTestId("topbar-quick-transaction-trigger"))

        expect(screen.getByTestId("topbar-quick-transaction-panel")).toBeInTheDocument()
        expect(screen.getByTestId("quick-expense-input-mock")).toHaveAttribute("data-variant", "embedded")
        expect(screen.getByTestId("quick-expense-input-mock")).toHaveAttribute("data-has-ref", "true")
        expect(screen.getByText("Transazione")).toBeInTheDocument()
        expect(screen.getByText("Nuova")).toBeInTheDocument()
    })

    it("si chiude con Escape", () => {
        render(<TopbarQuickTransaction />)

        fireEvent.click(screen.getByTestId("topbar-quick-transaction-trigger"))
        expect(screen.getByTestId("topbar-quick-transaction-panel")).toBeInTheDocument()

        fireEvent.keyDown(document, { key: "Escape" })

        return waitForElementToBeRemoved(() => screen.queryByTestId("topbar-quick-transaction-panel"))
    })

    it("si richiude dopo la creazione della transazione", () => {
        render(<TopbarQuickTransaction />)

        fireEvent.click(screen.getByTestId("topbar-quick-transaction-trigger"))
        fireEvent.click(screen.getByRole("button", { name: "conferma" }))

        return waitFor(() => {
            expect(screen.queryByTestId("topbar-quick-transaction-panel")).not.toBeInTheDocument()
            expect(screen.getByTestId("topbar-quick-transaction-trigger")).toHaveAttribute("aria-expanded", "false")
        })
    })

    it("rispetta il controllo del pannello padre", async () => {
        function ControlledHarness() {
            const [activePanel, setActivePanel] = useState<TopbarPanelId | null>(null)

            return (
                <>
                    <TopbarQuickTransaction
                        activePanel={activePanel}
                        onActivePanelChange={setActivePanel}
                    />
                    <button type="button" onClick={() => setActivePanel("flash")}>
                        apri flash
                    </button>
                </>
            )
        }

        render(<ControlledHarness />)

        fireEvent.click(screen.getByTestId("topbar-quick-transaction-trigger"))
        expect(screen.getByTestId("topbar-quick-transaction-panel")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "apri flash" }))

        await waitFor(() => {
            expect(screen.queryByTestId("topbar-quick-transaction-panel")).not.toBeInTheDocument()
            expect(screen.getByTestId("topbar-quick-transaction-trigger")).toHaveAttribute("aria-expanded", "false")
        })
    })
})
