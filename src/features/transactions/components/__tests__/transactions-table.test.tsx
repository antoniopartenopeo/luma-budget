import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { Transaction } from "@/features/transactions/api/types"
import { TransactionsTable } from "../transactions-table"

vi.mock("@/features/settings/api/use-currency", () => ({
    useCurrency: () => ({ currency: "EUR", locale: "it-IT" })
}))

vi.mock("@/features/privacy/privacy.store", () => ({
    usePrivacyStore: () => ({ isPrivacyMode: false })
}))

vi.mock("@/features/categories/components/category-icon", () => ({
    CategoryIcon: ({ categoryName, className }: { categoryName: string; className?: string }) => (
        <div data-testid={`category-icon-${categoryName}`} className={className}>{categoryName}</div>
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

describe("TransactionsTable", () => {
    it("renders stable row columns, income badge semantics, and the superfluous ring on the icon shell", () => {
        render(
            <TransactionsTable
                transactions={[
                    buildTransaction({
                        id: "tx-1",
                        description: "Cena Team",
                        category: "Ristoranti",
                        categoryId: "ristoranti",
                        type: "expense",
                        isSuperfluous: true,
                        amountCents: 4850,
                        date: "2026-03-06T19:30:00.000Z"
                    }),
                    buildTransaction({
                        id: "tx-2",
                        description: "Stipendio",
                        category: "Entrate",
                        categoryId: "entrate",
                        type: "income",
                        amountCents: 250000,
                        date: "2026-03-04T08:00:00.000Z"
                    })
                ]}
                onEditTransaction={vi.fn()}
                onDeleteTransaction={vi.fn()}
                onRowClick={vi.fn()}
                sortField="date"
                sortOrder="desc"
                onSortChange={vi.fn()}
                currentPage={1}
                totalPages={1}
                onPageChange={vi.fn()}
            />
        )

        expect(screen.getAllByText("06/03/2026")).toHaveLength(2)
        expect(screen.getByText("Tipo")).toBeInTheDocument()
        expect(screen.getAllByText("Ristoranti")).toHaveLength(3)
        expect(screen.getByText("Cena Team")).toBeInTheDocument()
        expect(screen.getByText("Uscita")).toBeInTheDocument()
        expect(screen.queryByText("Superflua")).not.toBeInTheDocument()
        expect(screen.getByText((content) => content.includes("48,50"))).toBeInTheDocument()

        expect(screen.getByText("Entrata")).toHaveClass("rounded-full")
        expect(screen.getByTestId("transaction-row-body-tx-1")).toHaveClass("md:grid-cols-[5.6rem_minmax(0,1fr)_7.25rem_5.35rem_7.15rem]")
        expect(screen.getByTestId("transaction-icon-shell-tx-1")).not.toHaveClass("ring-1")
        expect(screen.getByTestId("category-icon-Ristoranti")).toHaveClass("ring-1", "ring-amber-400/40", "border-amber-400/55")
    })

    it("opens the transaction detail when the row surface is clicked", () => {
        const handleRowClick = vi.fn()
        const transaction = buildTransaction({
            id: "tx-2",
            description: "Stipendio",
            category: "Entrate",
            categoryId: "entrate",
            type: "income",
            amountCents: 250000,
            date: "2026-03-04T08:00:00.000Z"
        })

        render(
            <TransactionsTable
                transactions={[transaction]}
                onEditTransaction={vi.fn()}
                onDeleteTransaction={vi.fn()}
                onRowClick={handleRowClick}
                sortField="date"
                sortOrder="desc"
                onSortChange={vi.fn()}
                currentPage={1}
                totalPages={1}
                onPageChange={vi.fn()}
            />
        )

        fireEvent.click(screen.getByRole("button", { name: "Apri dettaglio transazione Stipendio" }))

        expect(handleRowClick).toHaveBeenCalledOnce()
        expect(handleRowClick).toHaveBeenCalledWith(transaction)
    })
})
