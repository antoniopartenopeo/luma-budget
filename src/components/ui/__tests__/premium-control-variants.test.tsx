import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select"
import { Tabs, TabsList, TabsTrigger } from "../tabs"

describe("premium control variants", () => {
    it("renders premium tabs with glass chrome and denser active triggers", () => {
        render(
            <Tabs defaultValue="preferences">
                <TabsList variant="premium">
                    <TabsTrigger value="preferences" variant="premium">
                        Preferenze
                    </TabsTrigger>
                    <TabsTrigger value="advanced" variant="premium">
                        Avanzate
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        )

        expect(screen.getByRole("tablist")).toHaveClass("glass-card")
        expect(screen.getByRole("tab", { name: "Preferenze" })).toHaveClass("rounded-[1rem]", "min-h-[2.75rem]")
    })

    it("renders premium select triggers without dropping compact density support", () => {
        render(
            <Select defaultValue="one">
                <SelectTrigger variant="premium" density="compact" aria-label="Categoria">
                    <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent variant="premium">
                    <SelectItem value="one">Prima</SelectItem>
                </SelectContent>
            </Select>
        )

        expect(screen.getByRole("combobox", { name: "Categoria" })).toHaveClass("backdrop-blur-md", "h-8")
    })
})
