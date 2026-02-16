import { useEffect } from "react"
import { render, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useCreateTransaction } from "../use-transactions"
import type { CreateTransactionDTO } from "../types"
import { CategoryIds } from "@/domain/categories"

const createTransactionMock = vi.fn(async (_data: CreateTransactionDTO) => ({
    id: "tx-1",
    amountCents: 1000,
    date: new Date().toISOString(),
    description: "Test",
    category: "Cibo",
    categoryId: CategoryIds.CIBO,
    type: "expense" as const,
    timestamp: Date.now(),
}))

vi.mock("../repository", () => ({
    fetchTransactions: vi.fn(async () => []),
    createTransaction: (data: CreateTransactionDTO) => createTransactionMock(data),
    updateTransaction: vi.fn(),
    createBatchTransactions: vi.fn(),
}))

function CreateTransactionHarness() {
    const mutation = useCreateTransaction()

    useEffect(() => {
        void mutation.mutateAsync({
            description: "Test",
            amountCents: 1000,
            category: "Cibo",
            categoryId: CategoryIds.CIBO,
            type: "expense",
        })
        // run once on mount for deterministic mutation flow in test
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return null
}

describe("useCreateTransaction invalidation", () => {
    beforeEach(() => {
        createTransactionMock.mockClear()
    })

    it("invalidates all query roots required by Financial Lab refresh", async () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })

        const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")

        render(
            <QueryClientProvider client={queryClient}>
                <CreateTransactionHarness />
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(createTransactionMock).toHaveBeenCalledTimes(1)
        })

        expect(invalidateSpy).toHaveBeenCalledTimes(1)

        const args = invalidateSpy.mock.calls[0]?.[0] as {
            predicate?: (query: { queryKey: unknown[] }) => boolean
        }

        expect(args.predicate).toBeTypeOf("function")

        const predicate = args.predicate!
        expect(predicate({ queryKey: ["transactions"] })).toBe(true)
        expect(predicate({ queryKey: ["recent-transactions"] })).toBe(true)
        expect(predicate({ queryKey: ["dashboard-summary", "month"] })).toBe(true)
        expect(predicate({ queryKey: ["budgets"] })).toBe(false)
    })
})
