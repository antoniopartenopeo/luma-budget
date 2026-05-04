import { render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PublicThemeApplier } from "../public-theme-applier"

const fetchSettingsMock = vi.hoisted(() => vi.fn())
const syncThemeSelectionMock = vi.hoisted(() => vi.fn())
const cleanupThemeSyncMock = vi.hoisted(() => vi.fn())

vi.mock("@/features/settings/api/repository", () => ({
  fetchSettings: () => fetchSettingsMock()
}))

vi.mock("../theme-dom", async () => {
  const React = await vi.importActual<typeof import("react")>("react")

  return {
    syncThemeSelection: (theme: string) => syncThemeSelectionMock(theme),
    useIsomorphicLayoutEffect: React.useLayoutEffect,
  }
})

describe("PublicThemeApplier", () => {
  beforeEach(() => {
    fetchSettingsMock.mockReset()
    syncThemeSelectionMock.mockReset()
    cleanupThemeSyncMock.mockReset()
    syncThemeSelectionMock.mockReturnValue(cleanupThemeSyncMock)
  })

  it("syncs the system theme immediately before applying persisted settings", async () => {
    fetchSettingsMock.mockResolvedValue({ theme: "light" })

    render(<PublicThemeApplier />)

    expect(syncThemeSelectionMock).toHaveBeenCalledWith("system")

    await waitFor(() => {
      expect(syncThemeSelectionMock).toHaveBeenCalledWith("light")
    })
    expect(cleanupThemeSyncMock).toHaveBeenCalledTimes(1)
  })
})
