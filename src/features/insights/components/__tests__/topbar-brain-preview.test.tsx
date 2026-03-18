import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TopbarBrainPreview } from "../topbar-brain-preview"

const useBrainRuntimeStateMock = vi.fn()

vi.mock("@/features/insights/brain-runtime", () => ({
    useBrainRuntimeState: () => useBrainRuntimeStateMock(),
}))

function renderPreview() {
    return render(
        <div data-testid="topbar-action-cluster">
            <TopbarBrainPreview />
        </div>
    )
}

describe("TopbarBrainPreview", () => {
    beforeEach(() => {
        useBrainRuntimeStateMock.mockReset()
        useBrainRuntimeStateMock.mockReturnValue({
            brainReadinessPercent: 72,
            stage: {
                id: "adapting",
                label: "Attivo",
            },
            snapshot: {
                trainedSamples: 84,
            },
        })
    })

    it("mostra readiness, fase e storico nella preview inline", async () => {
        renderPreview()

        fireEvent.click(screen.getByTestId("topbar-brain-trigger"))

        await waitFor(() => {
            expect(screen.getByTestId("topbar-brain-panel")).toBeInTheDocument()
        })

        expect(screen.getByText("Brain")).toBeInTheDocument()
        expect(screen.getByTestId("topbar-brain-readiness")).toHaveTextContent("72%")
        expect(screen.getByTestId("topbar-brain-stage")).toHaveTextContent("Attivo")
        expect(screen.getByTestId("topbar-brain-history")).toHaveTextContent("84/120")
        expect(screen.getByTestId("topbar-brain-open-link")).toHaveAttribute("href", "/brain")
    })

    it("usa il badge percentuale solo a pannello chiuso", async () => {
        renderPreview()

        const trigger = screen.getByTestId("topbar-brain-trigger")
        expect(screen.getByTestId("topbar-brain-percent")).toHaveTextContent("72%")

        fireEvent.click(trigger)

        await waitFor(() => {
            expect(screen.getByTestId("topbar-brain-panel")).toBeInTheDocument()
        })

        expect(screen.queryByTestId("topbar-brain-percent")).not.toBeInTheDocument()
    })

    it("chiude la preview con Escape", async () => {
        renderPreview()

        const trigger = screen.getByTestId("topbar-brain-trigger")
        fireEvent.click(trigger)

        await waitFor(() => {
            expect(screen.getByTestId("topbar-brain-panel")).toBeInTheDocument()
        })

        fireEvent.keyDown(document, { key: "Escape" })

        await waitForElementToBeRemoved(() => screen.queryByTestId("topbar-brain-panel"))
        expect(trigger).toHaveAttribute("aria-expanded", "false")
    })
})
