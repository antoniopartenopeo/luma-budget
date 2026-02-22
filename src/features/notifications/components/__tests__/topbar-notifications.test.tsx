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
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    await waitFor(() => {
        expect(trigger).toHaveAttribute("data-state", "open")
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
            expect(screen.getByText("Aggiornamenti App")).toBeInTheDocument()
            expect(screen.getByText("v0.3.0 · Nuove funzionalita")).toBeInTheDocument()
        })
    })

    it("segnando una notifica come letta decrementa il badge", async () => {
        renderWithQueryClient()
        await openNotificationsMenu()

        await waitFor(() => {
            expect(screen.getByTestId("notification-read-release-0.3.0-20260204-feature")).toBeInTheDocument()
        })

        fireEvent.click(screen.getByTestId("notification-read-release-0.3.0-20260204-feature"))

        await waitFor(() => {
            expect(screen.queryByTestId("topbar-notifications-badge")).not.toBeInTheDocument()
        })
    })

    it("segnando tutto come letto azzera il badge", async () => {
        renderWithQueryClient()
        await openNotificationsMenu()

        await waitFor(() => {
            expect(screen.getByTestId("topbar-notifications-mark-all")).toBeEnabled()
        })

        fireEvent.click(screen.getByTestId("topbar-notifications-mark-all"))

        await waitFor(() => {
            expect(screen.queryByTestId("topbar-notifications-badge")).not.toBeInTheDocument()
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

        const item = screen.getByTestId("notification-item-release-0.3.0-20260204-feature")
        expect(item.className).toContain("bg-background/40")
        expect(item.className).not.toContain("bg-primary/5")
        expect(screen.queryByTestId("topbar-notifications-badge")).not.toBeInTheDocument()
        expect(screen.queryByTestId("notification-read-release-0.3.0-20260204-feature")).not.toBeInTheDocument()
    })

    it("mostra CTA verso lo storico aggiornamenti", async () => {
        renderWithQueryClient()
        await openNotificationsMenu()

        await waitFor(() => {
            expect(screen.getByTestId("topbar-notifications-open-updates")).toBeInTheDocument()
            expect(screen.getByRole("link", { name: "Apri storico aggiornamenti" })).toHaveAttribute("href", "/updates")
        })
    })
})
