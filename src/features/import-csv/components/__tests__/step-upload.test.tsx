import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ImportStepUpload } from "../step-upload"

vi.mock("@/features/transactions/api/use-transactions", () => ({
    useTransactions: () => ({ data: [] }),
}))

function renderUploadStep() {
    const queryClient = new QueryClient()

    return render(
        <QueryClientProvider client={queryClient}>
            <ImportStepUpload onContinue={vi.fn()} onClose={vi.fn()} />
        </QueryClientProvider>
    )
}

describe("ImportStepUpload", () => {
    it("marks bank sync as unavailable in the current build", () => {
        renderUploadStep()

        expect(screen.getByText("Prossimamente")).toBeInTheDocument()
        expect(
            screen.getByText(/In futuro potrai collegare il tuo conto bancario per sincronizzare le transazioni in automatico/i)
        ).toBeInTheDocument()
        expect(
            screen.queryByText(/Autorizzazione sicura direttamente/i)
        ).not.toBeInTheDocument()
    })
})
