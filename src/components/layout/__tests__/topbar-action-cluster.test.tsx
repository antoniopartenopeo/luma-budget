import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it } from "vitest"
import { TopbarActionCluster } from "../topbar-action-cluster"

function renderWithQueryClient() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    return render(
        <QueryClientProvider client={queryClient}>
            <TopbarActionCluster />
        </QueryClientProvider>
    )
}

describe("TopbarActionCluster", () => {
    it("renderizza cluster unico con ordine flash -> privacy -> campanella", () => {
        renderWithQueryClient()

        const cluster = screen.getByTestId("topbar-action-cluster")
        const flashButton = screen.getByRole("button", { name: "Apri Numa Flash" })
        const privacyButton = screen.getByRole("button", { name: "Nascondi importi" })
        const notificationButton = screen.getByTestId("topbar-notifications-trigger")

        expect(cluster).toContainElement(flashButton)
        expect(cluster).toContainElement(privacyButton)
        expect(cluster).toContainElement(notificationButton)

        const orderedButtons = Array.from(cluster.querySelectorAll("button"))
        const flashIndex = orderedButtons.indexOf(flashButton)
        const privacyIndex = orderedButtons.indexOf(privacyButton)
        const notificationIndex = orderedButtons.indexOf(notificationButton)

        expect(flashIndex).toBeLessThan(privacyIndex)
        expect(privacyIndex).toBeLessThan(notificationIndex)
    })
})
