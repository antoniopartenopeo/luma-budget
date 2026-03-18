import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { TopBar } from "../topbar"

const usePathnameMock = vi.fn()

vi.mock("next/navigation", () => ({
    usePathname: () => usePathnameMock(),
}))

vi.mock("../topbar-action-cluster", () => ({
    TopbarActionCluster: ({ surface }: { surface?: string }) => (
        <div data-testid={`topbar-action-cluster-${surface ?? "standalone"}`} />
    ),
}))

vi.mock("../topbar-quick-transaction", () => ({
    TopbarQuickTransaction: ({ surface }: { surface?: string }) => (
        <div data-testid={`topbar-quick-transaction-${surface ?? "standalone"}`} />
    ),
}))

vi.mock("../sidebar", () => ({
    Sidebar: () => <div data-testid="sidebar-mock" />,
}))

vi.mock("@/features/transactions/components/quick-expense-input", () => ({
    QuickExpenseInput: () => <div data-testid="quick-expense-mobile-mock" />,
}))

describe("TopBar", () => {
    beforeEach(() => {
        usePathnameMock.mockReturnValue("/dashboard")
    })

    it("usa una sola capsula desktop che contiene quick transaction e cluster embedded", () => {
        render(<TopBar />)

        const capsule = screen.getByTestId("topbar-desktop-capsule")
        expect(capsule).toHaveClass("h-12")
        expect(capsule).toContainElement(screen.getByTestId("topbar-quick-transaction-embedded"))
        expect(capsule).toContainElement(screen.getByTestId("topbar-action-cluster-embedded"))
    })

    it("su settings mantiene la capsula desktop ma senza quick transaction", () => {
        usePathnameMock.mockReturnValue("/settings")

        render(<TopBar />)

        const capsule = screen.getByTestId("topbar-desktop-capsule")
        expect(screen.queryByTestId("topbar-quick-transaction-embedded")).not.toBeInTheDocument()
        expect(capsule).toContainElement(screen.getByTestId("topbar-action-cluster-embedded"))
    })
})
