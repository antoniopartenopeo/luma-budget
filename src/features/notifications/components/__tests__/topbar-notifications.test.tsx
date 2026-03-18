import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"
import { TopbarNotifications } from "../topbar-notifications"
import { NOTIFICATIONS_STATE_STORAGE_KEY } from "../../api/repository"

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
            <TopbarNotifications />
        </QueryClientProvider>
    )
}

async function openNotificationsMenu() {
    const trigger = screen.getByTestId("topbar-notifications-trigger")
    fireEvent.click(trigger)
    await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "true")
    })
}

describe("TopbarNotifications", () => {
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

    it("mostra badge con conteggio non letti", async () => {
        renderWithQueryClient()

        await waitFor(() => {
            expect(screen.getByTestId("topbar-notifications-badge")).toHaveTextContent("1")
        })
    })

    it("apre il dropdown e mostra la lista notifiche", async () => {
        renderWithQueryClient()
        await openNotificationsMenu()

        await waitFor(() => {
            const panel = screen.getByTestId("topbar-notifications-panel")
            const currentNotification = screen.getByTestId("notification-item-release-0.3.0-20260204-feature")
            expect(panel).toHaveAttribute("aria-label", "Novità dell'app")
            expect(screen.getByText("Novità")).toBeInTheDocument()
            expect(screen.getByTestId("topbar-notifications-ticker")).toBeInTheDocument()
            expect(currentNotification).toHaveTextContent("v0.3.0 · Nuove funzionalita")
        })
    })

    it("chiude la preview inline cliccando fuori", async () => {
        renderWithQueryClient()
        await openNotificationsMenu()

        fireEvent.mouseDown(document.body)

        await waitFor(() => {
            expect(screen.queryByTestId("topbar-notifications-panel")).not.toBeInTheDocument()
            expect(screen.getByTestId("topbar-notifications-trigger")).toHaveAttribute("aria-expanded", "false")
        })
    })

    it("riapre la preview senza perdere il trigger campanella", async () => {
        renderWithQueryClient()

        const trigger = screen.getByTestId("topbar-notifications-trigger")

        fireEvent.click(trigger)
        await waitFor(() => {
            expect(trigger).toHaveAttribute("aria-expanded", "true")
            expect(screen.getByTestId("topbar-notifications-panel")).toBeInTheDocument()
        })

        fireEvent.click(trigger)
        await waitFor(() => {
            expect(trigger).toHaveAttribute("aria-expanded", "false")
            expect(screen.queryByTestId("topbar-notifications-panel")).not.toBeInTheDocument()
        })

        fireEvent.click(trigger)
        await waitFor(() => {
            expect(trigger).toHaveAttribute("aria-expanded", "true")
            expect(screen.getByTestId("topbar-notifications-panel")).toBeInTheDocument()
        })
    })

    it("con tutto letto rimuove evidenza unread e badge", async () => {
        localStorage.setItem(
            NOTIFICATIONS_STATE_STORAGE_KEY,
            JSON.stringify({
                version: 2,
                readIds: ["release-0.3.0-20260204-feature"],
                lastSeenVersion: "0.3.0",
                updatedAt: "2026-02-08T00:00:00.000Z",
            })
        )

        renderWithQueryClient()
        await openNotificationsMenu()

        await waitFor(() => {
            expect(screen.getByTestId("notification-item-release-0.3.0-20260204-feature")).toBeInTheDocument()
        })

        expect(screen.queryByLabelText("Non letta")).not.toBeInTheDocument()
        expect(screen.queryByTestId("topbar-notifications-badge")).not.toBeInTheDocument()
    })

    it("mostra CTA verso lo storico aggiornamenti", async () => {
        renderWithQueryClient()
        await openNotificationsMenu()

        await waitFor(() => {
            expect(screen.getByTestId("topbar-notifications-open-updates")).toBeInTheDocument()
            expect(screen.getByRole("link", { name: "Apri cronologia novità" })).toHaveAttribute("href", "/updates")
        })
    })

    it("usa una tipografia compatta e coerente nel ticker inline", async () => {
        renderWithQueryClient()
        await openNotificationsMenu()

        await waitFor(() => {
            const ticker = screen.getByTestId("topbar-notifications-ticker")
            expect(ticker).toHaveClass("text-[13px]", "font-medium", "leading-none")
        })
    })
})
