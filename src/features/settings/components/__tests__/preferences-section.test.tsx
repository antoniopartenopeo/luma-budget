"use client"

import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PreferencesSection } from "../preferences-section"
import { DEFAULT_SETTINGS_V1 } from "@/features/settings/api/types"

const useSettingsMock = vi.fn()
const useUpsertSettingsMock = vi.fn()

vi.mock("@/features/settings/api/use-settings", () => ({
    useSettings: () => useSettingsMock(),
    useUpsertSettings: () => useUpsertSettingsMock(),
}))

describe("PreferencesSection", () => {
    beforeEach(() => {
        useUpsertSettingsMock.mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
        })
    })

    it("keeps the final section structure visible while loading", () => {
        useSettingsMock.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })

        render(<PreferencesSection />)

        expect(screen.getByText("Identità e Interfaccia")).toBeInTheDocument()
        expect(screen.getByText("Analisi e Obiettivi")).toBeInTheDocument()
        expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
    })

    it("renders premium controls once settings are available", () => {
        useSettingsMock.mockReturnValue({
            data: DEFAULT_SETTINGS_V1,
            isLoading: false,
            isError: false,
        })

        render(<PreferencesSection />)

        expect(screen.getByRole("textbox", { name: "Nome" })).toHaveClass("backdrop-blur-md")
        expect(screen.getByRole("combobox", { name: "Tema" })).toHaveClass("backdrop-blur-md")
        expect(screen.getByRole("combobox", { name: "Valuta" })).toHaveClass("backdrop-blur-md")
    })
})
