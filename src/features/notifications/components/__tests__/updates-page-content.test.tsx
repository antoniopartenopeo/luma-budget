import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"
import { UpdatesPageContent } from "../updates-page-content"

const FEED_FIXTURE = [
    {
        id: "release-0.3.0-20260204-feature",
        version: "0.3.0",
        kind: "feature",
        audience: "public",
        title: "Novità",
        body: "TopBar azioni/notifiche resa più robusta, con comportamento più stabile su trigger, badge e stato aggiornamenti.",
        highlights: ["Deterministic Narration Layer."],
        publishedAt: "2026-02-04T09:00:00.000Z",
        link: "/updates#v-0-3-0",
    },
    {
        id: "release-0.2.5-20260201-improvement",
        version: "0.2.5",
        kind: "improvement",
        audience: "public",
        title: "Miglioramenti",
        body: "Landing pubblica resa più credibile e prudente: trust signal visibili vicino alle CTA.",
        highlights: ["Nuove superfici pubbliche FAQ e Privacy per chiarire file supportati e modello local-first."],
        publishedAt: "2026-02-01T09:00:00.000Z",
        link: "/updates#v-0-2-5",
    },
]

function renderWithQueryClient() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    return render(
        <QueryClientProvider client={queryClient}>
            <UpdatesPageContent />
        </QueryClientProvider>
    )
}

describe("UpdatesPageContent", () => {
    beforeEach(() => {
        localStorage.clear()
        vi.stubGlobal("fetch", vi.fn(async () => ({
            ok: true,
            json: async () => FEED_FIXTURE,
        })))
    })

    afterAll(() => {
        vi.unstubAllGlobals()
    })

    it("renderizza la cronologia pubblica per release senza affordance da centro notifiche interno", async () => {
        renderWithQueryClient()

        await waitFor(() => {
            expect(screen.getByText("Aggiornamenti")).toBeInTheDocument()
            expect(screen.getByText("Le novità recenti di Numa.")).toBeInTheDocument()
            expect(screen.getByText("Versione 0.3.0")).toBeInTheDocument()
            expect(screen.getByText("Versione 0.2.5")).toBeInTheDocument()
        })

        expect(screen.queryByRole("button", { name: /Segna tutto come letto/i })).not.toBeInTheDocument()
        expect(screen.getByText("Nuove funzioni")).toBeInTheDocument()
        expect(screen.getByText("Miglioramenti")).toBeInTheDocument()
        expect(screen.getByText("Include nuove funzioni.")).toBeInTheDocument()
        expect(screen.getByText("Abbiamo introdotto nuove funzioni in punti chiave dell'app.")).toBeInTheDocument()
        expect(screen.getByText("Include miglioramenti all'esperienza.")).toBeInTheDocument()
        expect(screen.getByText("Abbiamo reso alcuni flussi più chiari e più semplici da usare.")).toBeInTheDocument()
    })
})
