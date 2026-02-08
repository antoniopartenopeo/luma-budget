import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it } from "vitest"
import { TopbarNotifications } from "../topbar-notifications"
import { NOTIFICATIONS_STATE_STORAGE_KEY } from "../../api/repository"

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

function openNotificationsMenu() {
    fireEvent.pointerDown(screen.getByTestId("topbar-notifications-trigger"), {
        button: 0,
        ctrlKey: false,
    })
}

describe("TopbarNotifications", () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it("mostra badge con conteggio non letti", async () => {
        renderWithQueryClient()

        await waitFor(() => {
            expect(screen.getByTestId("topbar-notifications-badge")).toHaveTextContent("1")
        })
    })

    it("apre il dropdown e mostra la lista notifiche", async () => {
        renderWithQueryClient()
        openNotificationsMenu()

        await waitFor(() => {
            expect(screen.getByText("Aggiornamenti Beta")).toBeInTheDocument()
            expect(screen.getByText("Benvenuto nel programma Beta NUMA")).toBeInTheDocument()
        })
    })

    it("segnando una notifica come letta decrementa il badge", async () => {
        renderWithQueryClient()
        openNotificationsMenu()

        await waitFor(() => {
            expect(screen.getByTestId("notification-read-welcome-beta-2026-02")).toBeInTheDocument()
        })

        fireEvent.click(screen.getByTestId("notification-read-welcome-beta-2026-02"))

        await waitFor(() => {
            expect(screen.queryByTestId("topbar-notifications-badge")).not.toBeInTheDocument()
        })
    })

    it("segnando tutto come letto azzera il badge", async () => {
        renderWithQueryClient()
        openNotificationsMenu()

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
                version: 1,
                readIds: ["welcome-beta-2026-02"],
                updatedAt: "2026-02-08T00:00:00.000Z",
            })
        )

        renderWithQueryClient()
        openNotificationsMenu()

        await waitFor(() => {
            expect(screen.getByTestId("notification-item-welcome-beta-2026-02")).toBeInTheDocument()
        })

        const item = screen.getByTestId("notification-item-welcome-beta-2026-02")
        expect(item.className).toContain("bg-background/40")
        expect(item.className).not.toContain("bg-primary/5")
        expect(screen.queryByTestId("topbar-notifications-badge")).not.toBeInTheDocument()
        expect(screen.queryByTestId("notification-read-welcome-beta-2026-02")).not.toBeInTheDocument()
    })
})
