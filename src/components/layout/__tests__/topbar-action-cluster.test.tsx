import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it } from "vitest"
import { TopbarActionCluster } from "../topbar-action-cluster"
import type React from "react"

async function renderWithQueryClient(props: React.ComponentProps<typeof TopbarActionCluster> = {}) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    await act(async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <TopbarActionCluster {...props} />
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
        const privacyButton = screen.getByRole("button", { name: /Mostra importi|Nascondi importi/ })
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

    it("integra la preview brain dentro la capsula madre e mantiene CTA verso /brain", async () => {
        await renderWithQueryClient()

        const cluster = screen.getByTestId("topbar-action-cluster")
        const trigger = screen.getByTestId("topbar-brain-trigger")

        fireEvent.click(trigger)

        const panel = screen.getByTestId("topbar-brain-panel")
        const link = screen.getByTestId("topbar-brain-open-link")

        expect(cluster).toContainElement(panel)
        expect(trigger.tagName.toLowerCase()).toBe("button")
        expect(link.tagName.toLowerCase()).toBe("a")
        expect(link).toHaveAttribute("href", "/brain")
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

        const cluster = screen.getByTestId("topbar-action-cluster")
        const themeButton = screen.getByRole("button", { name: "Tema: Sistema" })
        
        expect(screen.queryByTestId("topbar-theme-panel")).not.toBeInTheDocument()

        fireEvent.click(themeButton)

        const openedPanel = screen.getByTestId("topbar-theme-panel")
        expect(openedPanel).toBeInTheDocument()
        expect(cluster).toContainElement(openedPanel)

        expect(screen.getByTestId("topbar-theme-option-system")).toBeInTheDocument()
        expect(screen.getByTestId("topbar-theme-option-light")).toBeInTheDocument()
        expect(screen.getByTestId("topbar-theme-option-dark")).toBeInTheDocument()
    })

    it("integra la preview notifiche dentro la capsula madre del cluster", async () => {
        await renderWithQueryClient()

        const cluster = screen.getByTestId("topbar-action-cluster")
        const trigger = screen.getByTestId("topbar-notifications-trigger")

        fireEvent.click(trigger)

        const panel = screen.getByTestId("topbar-notifications-panel")
        expect(cluster).toContainElement(panel)
        expect(screen.queryByTestId("topbar-notifications-capsule")).not.toBeInTheDocument()
    })

    it("integra la preview flash dentro la capsula madre del cluster", async () => {
        await renderWithQueryClient()

        const cluster = screen.getByTestId("topbar-action-cluster")
        const trigger = screen.getByTestId("topbar-flash-trigger")

        fireEvent.click(trigger)

        const panel = screen.getByTestId("topbar-flash-panel")
        expect(cluster).toContainElement(panel)
        expect(trigger).toHaveAttribute("aria-expanded", "true")
        expect(panel.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it("in controlled mode renderizza solo il trigger desktop utility aperto", async () => {
        await renderWithQueryClient({ activePanel: "flash", onActivePanelChange: () => undefined })

        expect(screen.getByTestId("topbar-flash-panel")).toBeInTheDocument()
        expect(screen.queryByTestId("topbar-theme-trigger")).not.toBeInTheDocument()
        expect(screen.queryByTestId("topbar-brain-trigger")).not.toBeInTheDocument()
        expect(screen.queryByTestId("topbar-notifications-trigger")).not.toBeInTheDocument()
    })

    it("mantiene il trigger tema come rail destro rendendo il pannello prima del trigger", async () => {
        await renderWithQueryClient()

        const trigger = screen.getByTestId("topbar-theme-trigger")

        fireEvent.click(trigger)

        const panel = screen.getByTestId("topbar-theme-panel")
        expect(panel.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it("mantiene il trigger brain come rail destro rendendo il pannello prima del trigger", async () => {
        await renderWithQueryClient()

        const trigger = screen.getByTestId("topbar-brain-trigger")

        fireEvent.click(trigger)

        const panel = screen.getByTestId("topbar-brain-panel")
        expect(panel.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it("mantiene un solo pannello aperto alla volta nel cluster", async () => {
        await renderWithQueryClient()

        fireEvent.click(screen.getByTestId("topbar-theme-trigger"))
        expect(screen.getByTestId("topbar-theme-panel")).toBeInTheDocument()

        fireEvent.click(screen.getByTestId("topbar-flash-trigger"))

        await waitFor(() => {
            expect(screen.getByTestId("topbar-flash-panel")).toBeInTheDocument()
            expect(screen.getByTestId("topbar-theme-panel")).toHaveStyle({ opacity: "0" })
        })
    })



    it("su mobile espande la capsula verso il basso senza usare pannelli inline desktop", async () => {
        await renderWithQueryClient({ surface: "mobile" })

        expect(screen.queryByTestId("topbar-mobile-panel")).not.toBeInTheDocument()

        fireEvent.click(screen.getByTestId("topbar-mobile-trigger-flash"))

        const mobilePanel = screen.getByTestId("topbar-mobile-panel")
        expect(mobilePanel).toBeInTheDocument()
        expect(screen.getByText("Flash")).toBeInTheDocument()
        expect(screen.queryByTestId("topbar-flash-panel")).not.toBeInTheDocument()

        fireEvent.click(screen.getByTestId("topbar-mobile-trigger-theme"))

        await waitFor(() => {
            expect(screen.getByTestId("topbar-mobile-panel")).toBeInTheDocument()
            expect(screen.getByText("Tema")).toBeInTheDocument()
            expect(screen.queryByText("Flash")).not.toBeInTheDocument()
        })

        fireEvent.click(screen.getByTestId("topbar-mobile-trigger-quick"))

        await waitFor(() => {
            expect(screen.getAllByTestId("topbar-mobile-panel").length).toBeGreaterThan(0)
            expect(screen.getByText("Transazione")).toBeInTheDocument()
            expect(screen.getByLabelText("Registra come Uscita")).toBeInTheDocument()
        })
    })

    it("non aggiunge separatori di bordo extra nei pannelli inline", async () => {
        await renderWithQueryClient()

        fireEvent.click(screen.getByTestId("topbar-flash-trigger"))
        const flashPanel = screen.getByTestId("topbar-flash-panel")
        expect(flashPanel.querySelector(".h-6.w-px")).toBeNull()

        fireEvent.click(screen.getByTestId("topbar-flash-trigger"))

        fireEvent.click(screen.getByTestId("topbar-theme-trigger"))
        const themePanel = screen.getByTestId("topbar-theme-panel")
        expect(themePanel.querySelector(".h-6.w-px")).toBeNull()

        fireEvent.click(screen.getByTestId("topbar-theme-trigger"))

        fireEvent.click(screen.getByTestId("topbar-brain-trigger"))
        const brainPanel = screen.getByTestId("topbar-brain-panel")
        expect(brainPanel.querySelector(".h-6.w-px")).toBeNull()

        fireEvent.click(screen.getByTestId("topbar-brain-trigger"))

        fireEvent.click(screen.getByTestId("topbar-notifications-trigger"))
        const notificationsPanel = screen.getByTestId("topbar-notifications-panel")
        expect(notificationsPanel.querySelector(".h-6.w-px")).toBeNull()
    })
})
