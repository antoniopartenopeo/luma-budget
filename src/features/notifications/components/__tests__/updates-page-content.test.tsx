import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"
import { UpdatesPageContent } from "../updates-page-content"

const FEED_FIXTURE = [
    {
        id: "release-0.3.0-20260204-feature",
        version: "0.3.0",
        kind: "feature",
        audience: "beta",
        title: "v0.3.0 · Nuove funzionalita",
        body: "Deterministic Narration Layer.",
        highlights: ["Deterministic Narration Layer."],
        publishedAt: "2026-02-04T09:00:00.000Z",
        link: "/updates#v-0-3-0",
    },
    {
        id: "release-0.2.5-20260201-improvement",
        version: "0.2.5",
        kind: "improvement",
        audience: "beta",
        title: "v0.2.5 · Miglioramenti",
        body: "Brand Consistency.",
        highlights: ["Brand Consistency."],
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

    it("renderizza lo storico release raggruppato per versione", async () => {
        renderWithQueryClient()

        await waitFor(() => {
            expect(screen.getByText("Storico Aggiornamenti")).toBeInTheDocument()
            expect(screen.getByText("Release 0.3.0")).toBeInTheDocument()
            expect(screen.getByText("Release 0.2.5")).toBeInTheDocument()
        })
    })
})
