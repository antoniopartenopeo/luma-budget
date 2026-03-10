import { render, screen } from "@testing-library/react"
import { describe, expect, it, beforeEach, vi } from "vitest"
import type { Transaction } from "@/features/transactions/api/types"
import { RecentTransactions } from "../recent-transactions"

const useTransactionsMock = vi.fn()

vi.mock("@/features/transactions/api/use-transactions", () => ({
    useTransactions: () => useTransactionsMock()
}))

vi.mock("@/features/settings/api/use-currency", () => ({
    useCurrency: () => ({ currency: "EUR", locale: "it-IT" })
}))

vi.mock("@/features/privacy/privacy.store", () => ({
    usePrivacyStore: () => ({ isPrivacyMode: false })
}))

vi.mock("@/features/categories/components/category-icon", () => ({
    CategoryIcon: ({ categoryName }: { categoryName: string }) => (
        <div data-testid={`category-icon-${categoryName}`}>{categoryName}</div>
    )
}))

function buildTransaction(partial: Partial<Transaction>): Transaction {
    return {
        id: partial.id || `tx-${Math.random().toString(36).slice(2, 10)}`,
        description: partial.description || "Transazione",
        amountCents: partial.amountCents ?? 1000,
        type: partial.type || "expense",
        category: partial.category || "Altro",
        categoryId: partial.categoryId || "altro",
        date: partial.date || "2026-03-01T10:00:00.000Z",
        timestamp: partial.timestamp ?? new Date(partial.date || "2026-03-01T10:00:00.000Z").getTime(),
        isSuperfluous: partial.isSuperfluous ?? false,
        classificationSource: partial.classificationSource || "manual"
    }
}

describe("RecentTransactions", () => {
    beforeEach(() => {
        useTransactionsMock.mockReset()
        useTransactionsMock.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            refetch: vi.fn()
        })
    })

    it("filters on the full transaction history before slicing the top 5 for the selected period", () => {
        const transactions = [
            buildTransaction({
                id: "jan-1",
                description: "Affitto Gennaio",
                category: "Casa",
                categoryId: "casa",
                date: "2026-01-05T10:00:00.000Z"
            }),
            buildTransaction({
                id: "feb-1",
                description: "Spesa Febbraio 1",
                category: "Cibo",
                categoryId: "cibo",
                date: "2026-02-15T10:00:00.000Z"
            }),
            buildTransaction({
                id: "feb-2",
                description: "Spesa Febbraio 2",
                category: "Cibo",
                categoryId: "cibo",
                date: "2026-02-16T10:00:00.000Z"
            }),
            buildTransaction({
                id: "feb-3",
                description: "Spesa Febbraio 3",
                category: "Cibo",
                categoryId: "cibo",
                date: "2026-02-17T10:00:00.000Z"
            }),
            buildTransaction({
                id: "feb-4",
                description: "Spesa Febbraio 4",
                category: "Cibo",
                categoryId: "cibo",
                date: "2026-02-18T10:00:00.000Z"
            }),
            buildTransaction({
                id: "feb-5",
                description: "Spesa Febbraio 5",
                category: "Cibo",
                categoryId: "cibo",
                date: "2026-02-19T10:00:00.000Z"
            })
        ]

        useTransactionsMock.mockReturnValue({
            data: transactions,
            isLoading: false,
            isError: false,
            refetch: vi.fn()
        })

        render(
            <RecentTransactions
                filter={{ mode: "month", period: "2026-01" }}
            />
        )

        expect(screen.getByText("Affitto Gennaio")).toBeInTheDocument()
        expect(screen.queryByText("Spesa Febbraio 5")).not.toBeInTheDocument()
    })

    it("formats transaction dates canonically and links to the matching ledger range", () => {
        useTransactionsMock.mockReturnValue({
            data: [
                buildTransaction({
                    id: "mar-1",
                    description: "Pranzo Team",
                    category: "Ristoranti",
                    categoryId: "ristoranti",
                    date: "2026-03-06T12:00:00.000Z"
                })
            ],
            isLoading: false,
            isError: false,
            refetch: vi.fn()
        })

        render(
            <RecentTransactions
                filter={{ mode: "month", period: "2026-03" }}
            />
        )

        expect(screen.getByText("06/03/2026")).toBeInTheDocument()

        const links = screen.getAllByRole("link", { name: /Apri elenco movimenti del periodo attivo/i })
        expect(links[0]).toHaveAttribute("href", "/transactions?period=custom&from=2026-03-01&to=2026-03-31")
    })
})
