import { act, render, waitFor } from "@testing-library/react"
import { useQuery } from "@tanstack/react-query"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QueryProvider } from "../query-provider"

const txQueryFn = vi.fn(async () => "transactions")
const catQueryFn = vi.fn(async () => "categories")

function QueryHarness() {
    useQuery({ queryKey: ["transactions"], queryFn: txQueryFn })
    useQuery({ queryKey: ["categories"], queryFn: catQueryFn })
    return null
}

describe("QueryProvider storage sync", () => {
    beforeEach(() => {
        txQueryFn.mockClear()
        catQueryFn.mockClear()
    })

    it("refetches only query roots mapped to the changed storage key", async () => {
        render(
            <QueryProvider>
                <QueryHarness />
            </QueryProvider>
        )

        await waitFor(() => {
            expect(txQueryFn).toHaveBeenCalledTimes(1)
            expect(catQueryFn).toHaveBeenCalledTimes(1)
        })

        act(() => {
            window.dispatchEvent(new StorageEvent("storage", {
                key: "luma_transactions_v1",
                oldValue: "{}",
                newValue: '{"user-1":[]}',
                storageArea: window.localStorage,
            }))
        })

        await waitFor(() => {
            expect(txQueryFn).toHaveBeenCalledTimes(2)
            expect(catQueryFn).toHaveBeenCalledTimes(1)
        })

        act(() => {
            window.dispatchEvent(new StorageEvent("storage", {
                key: "luma_categories_v1",
                oldValue: "{}",
                newValue: '{"version":1,"categories":[]}',
                storageArea: window.localStorage,
            }))
        })

        await waitFor(() => {
            expect(catQueryFn).toHaveBeenCalledTimes(2)
            expect(txQueryFn).toHaveBeenCalledTimes(2)
        })
    })
})
