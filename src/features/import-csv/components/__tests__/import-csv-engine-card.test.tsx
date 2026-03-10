import { describe, expect, it } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { ImportCsvEngineCard } from "../import-csv-engine-card"

describe("ImportCsvEngineCard", () => {
    it("describes the active CSV flow without claiming remote bank sync", () => {
        render(<ImportCsvEngineCard />)

        expect(screen.getByText("Import CSV locale e revisione guidata")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Apri dettagli" }))
        expect(
            screen.getByText(/Nel flusso CSV attivo il file resta nel browser fino alla conferma finale\./i)
        ).toBeInTheDocument()
        expect(
            screen.queryByText(/nulla viene inviato fuori dal tuo dispositivo/i)
        ).not.toBeInTheDocument()
    })
})
