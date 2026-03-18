import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import { QuickExpenseInput } from "../quick-expense-input"

vi.mock("@/features/transactions/api/use-transactions", () => ({
    useCreateTransaction: () => ({
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: false,
    }),
}))

vi.mock("@/features/categories/api/use-categories", () => ({
    useCategories: () => ({
        data: [
            {
                id: "spesa-essenziale",
                label: "Spesa essenziale",
                kind: "expense",
                color: "text-slate-900 bg-slate-100",
                hexColor: "#0f172a",
                iconName: "wallet",
                spendingNature: "essential",
                archived: false,
            },
            {
                id: "stipendio",
                label: "Stipendio",
                kind: "income",
                color: "text-emerald-900 bg-emerald-100",
                hexColor: "#047857",
                iconName: "banknote",
                spendingNature: "comfort",
                archived: false,
            },
        ],
    }),
}))

vi.mock("@/features/categories/components/category-icon", () => ({
    CategoryIcon: () => <span data-testid="category-icon-mock" />,
}))

vi.mock("@/components/ui/date-picker", () => ({
    DatePicker: ({
        triggerAriaLabel,
        triggerTestId,
        className,
    }: {
        triggerAriaLabel?: string
        triggerTestId?: string
        className?: string
    }) => (
        <button
            type="button"
            aria-label={triggerAriaLabel}
            data-testid={triggerTestId}
            className={className}
        >
            data
        </button>
    ),
}))

vi.mock("@/components/ui/select", () => ({
    Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SelectTrigger: ({ children, className }: { children: ReactNode; className?: string }) => (
        <button type="button" className={className}>
            {children}
        </button>
    ),
    SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
    SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SelectGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SelectLabel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

describe("QuickExpenseInput", () => {
    it("in embedded mode places date, expense nature icon and submit in the trailing actions rail", () => {
        render(<QuickExpenseInput variant="embedded" />)

        const actions = screen.getByTestId("quick-expense-trailing-actions")
        const dateTrigger = screen.getByTestId("quick-expense-date-trigger")
        const superfluousTrigger = screen.getByTestId("quick-expense-superfluous-trigger")
        const submitButton = screen.getByRole("button", { name: "Aggiungi" })

        expect(actions).toContainElement(dateTrigger)
        expect(actions).toContainElement(superfluousTrigger)
        expect(actions).toContainElement(submitButton)
        expect(dateTrigger.compareDocumentPosition(superfluousTrigger) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(superfluousTrigger.compareDocumentPosition(submitButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it("toggles the embedded expense nature icon state", () => {
        render(<QuickExpenseInput variant="embedded" />)

        const superfluousTrigger = screen.getByTestId("quick-expense-superfluous-trigger")

        expect(superfluousTrigger).toHaveAttribute("aria-pressed", "false")
        expect(superfluousTrigger).toHaveAttribute("aria-label", "Spesa necessaria")

        fireEvent.click(superfluousTrigger)

        expect(superfluousTrigger).toHaveAttribute("aria-pressed", "true")
        expect(superfluousTrigger).toHaveAttribute("aria-label", "Spesa superflua")
    })

    it("hides the expense nature icon when switching to income", () => {
        render(<QuickExpenseInput variant="embedded" />)

        fireEvent.click(screen.getByRole("button", { name: "Registra come Entrata" }))

        expect(screen.queryByTestId("quick-expense-superfluous-trigger")).not.toBeInTheDocument()
        expect(screen.getByTestId("quick-expense-date-trigger")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Aggiungi" })).toBeInTheDocument()
    })

    it("normalizza la tipografia embedded tra descrizione, importo, categoria e CTA", () => {
        render(<QuickExpenseInput variant="embedded" />)

        const descriptionInput = screen.getByPlaceholderText("Cosa hai comprato?")
        const amountInput = screen.getByPlaceholderText("0,00")
        const categoryTrigger = screen.getByRole("button", { name: "Categoria" })
        const submitButton = screen.getByRole("button", { name: "Aggiungi" })

        expect(descriptionInput).toHaveClass("text-[15px]", "font-medium")
        expect(amountInput).toHaveClass("text-[15px]", "font-medium")
        expect(categoryTrigger).toHaveClass("text-[13px]", "font-medium")
        expect(submitButton.querySelector("span")).toHaveClass("text-[13px]", "font-medium")
    })
})
