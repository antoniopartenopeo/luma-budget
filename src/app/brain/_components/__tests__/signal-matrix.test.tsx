import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SignalMatrix } from "../signal-matrix"

const contributors = [
    {
        feature: "expense_income_ratio",
        value: 0.48,
        weight: -0.22,
        contribution: -0.1056,
    },
    {
        feature: "txn_density",
        value: 0.31,
        weight: 0.18,
        contribution: 0.0558,
    },
]

describe("SignalMatrix", () => {
    it("shows the full contributor list and updates the detail panel on selection", () => {
        render(<SignalMatrix contributors={contributors} />)

        expect(screen.getByRole("button", { name: /Rapporto tra spese ed entrate/i })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /Ritmo delle transazioni/i })).toBeInTheDocument()
        expect(screen.getByText("Fattore selezionato")).toBeInTheDocument()
        expect(screen.getAllByText("Rapporto tra spese ed entrate")).toHaveLength(2)

        fireEvent.click(screen.getByRole("button", { name: /Ritmo delle transazioni/i }))

        expect(screen.getByText("Ritmo delle transazioni")).toBeInTheDocument()
        expect(screen.getByText("Valore osservato")).toBeInTheDocument()
        expect(screen.getByText("Importanza interna")).toBeInTheDocument()
        expect(screen.getByText("Come interpretarlo")).toBeInTheDocument()
    })

    it("renders an honest empty state when no signals are available", () => {
        render(<SignalMatrix contributors={[]} />)

        expect(screen.getByText("Non ci sono ancora segnali da mostrare. Appena il Brain completa la prima analisi, li vedrai qui.")).toBeInTheDocument()
    })
})
