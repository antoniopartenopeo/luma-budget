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

        expect(screen.getByText("Non disponibile")).toBeInTheDocument()
        expect(
            screen.getByText("Il collegamento banca e disattivato in questa build. Per ora puoi usare solo l'import CSV locale.")
        ).toBeInTheDocument()
        expect(
            screen.getByText("Nessun collegamento bancario remoto e attivo in questo ambiente.")
        ).toBeInTheDocument()
        expect(
            screen.queryByText(/Autorizzazione sicura direttamente dalla tua banca/i)
        ).not.toBeInTheDocument()
    })
})
