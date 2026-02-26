import { act, fireEvent, render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it } from "vitest"
import { TopbarActionCluster } from "../topbar-action-cluster"

async function renderWithQueryClient() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    await act(async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <TopbarActionCluster />
            </QueryClientProvider>
        )
        await Promise.resolve()
    })
}

describe("TopbarActionCluster", () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    it("renderizza cluster unico con ordine flash -> privacy -> tema -> brain -> campanella", async () => {
        await renderWithQueryClient()

        const cluster = screen.getByTestId("topbar-action-cluster")
        const flashButton = screen.getByRole("button", { name: "Apri Numa Flash" })
        const privacyButton = screen.getByRole("button", { name: "Nascondi importi" })
        const themeButton = screen.getByTestId("topbar-theme-trigger")
        const brainButton = screen.getByTestId("topbar-brain-trigger")
        const notificationButton = screen.getByTestId("topbar-notifications-trigger")

        expect(cluster).toContainElement(flashButton)
        expect(cluster).toContainElement(privacyButton)
        expect(cluster).toContainElement(themeButton)
        expect(cluster).toContainElement(brainButton)
        expect(cluster).toContainElement(notificationButton)

        const orderedButtons = Array.from(cluster.querySelectorAll("button, a"))
        const flashIndex = orderedButtons.indexOf(flashButton)
        const privacyIndex = orderedButtons.indexOf(privacyButton)
        const themeIndex = orderedButtons.indexOf(themeButton)
        const brainIndex = orderedButtons.indexOf(brainButton)
        const notificationIndex = orderedButtons.indexOf(notificationButton)

        expect(flashIndex).toBeLessThan(privacyIndex)
        expect(privacyIndex).toBeLessThan(themeIndex)
        expect(themeIndex).toBeLessThan(brainIndex)
        expect(brainIndex).toBeLessThan(notificationIndex)
    })

    it("usa controlli icon-only con nome accessibile e target minimo h-10 w-10", async () => {
        await renderWithQueryClient()

        const flashButton = screen.getByRole("button", { name: "Apri Numa Flash" })
        const privacyButton = screen.getByRole("button", { name: /Mostra importi|Nascondi importi/ })
        const themeButton = screen.getByTestId("topbar-theme-trigger")
        const brainLink = screen.getByTestId("topbar-brain-trigger")
        const notificationsButton = screen.getByTestId("topbar-notifications-trigger")

        expect(flashButton).toHaveClass("h-10", "w-10")
        expect(privacyButton).toHaveClass("h-10", "w-10")
        expect(themeButton).toHaveClass("h-10", "w-10")
        expect(brainLink).toHaveClass("h-10", "w-10")
        expect(notificationsButton).toHaveClass("h-10", "w-10")
    })

    it("usa link semantico per navigare alla pagina brain", async () => {
        await renderWithQueryClient()

        const brainLink = screen.getByTestId("topbar-brain-trigger")
        expect(brainLink.tagName.toLowerCase()).toBe("a")
        expect(brainLink).toHaveAttribute("href", "/brain")
    })

    it("aggiorna aria-label del toggle privacy dopo click", async () => {
        await renderWithQueryClient()

        const initialButton = screen.getByRole("button", { name: /Mostra importi|Nascondi importi/ })
        const initialLabel = initialButton.getAttribute("aria-label")
        const expectedNextLabel = initialLabel === "Nascondi importi" ? "Mostra importi" : "Nascondi importi"

        fireEvent.click(initialButton)

        expect(screen.getByRole("button", { name: expectedNextLabel })).toBeInTheDocument()
    })

    it("espone menu tema con opzioni sistema, chiaro, scuro", async () => {
        await renderWithQueryClient()

        const themeButton = screen.getByRole("button", { name: "Tema: Sistema" })
        const panel = screen.getByTestId("topbar-theme-panel")
        expect(panel).toHaveAttribute("aria-hidden", "true")

        fireEvent.click(themeButton)
        expect(panel).toHaveAttribute("aria-hidden", "false")

        expect(screen.getByTestId("topbar-theme-option-system")).toBeInTheDocument()
        expect(screen.getByTestId("topbar-theme-option-light")).toBeInTheDocument()
        expect(screen.getByTestId("topbar-theme-option-dark")).toBeInTheDocument()
    })
})
