import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query"
import { fetchTransactions, createTransaction, updateTransaction, createBatchTransactions } from "./repository"
import { queryKeys } from "@/lib/query-keys"
import { CreateTransactionDTO } from "./types"

const TRANSACTION_INVALIDATION_ROOTS = new Set<string>([
    queryKeys.transactions.recent[0],
    queryKeys.dashboard.all[0],
    queryKeys.transactions.all[0],
])

function invalidateTransactionQueries(queryClient: QueryClient) {
    return queryClient.invalidateQueries({
        predicate: query => {
            const root = query.queryKey[0]
            return typeof root === "string" && TRANSACTION_INVALIDATION_ROOTS.has(root)
        },
    })
}

export function useRecentTransactions() {
    return useQuery({
        queryKey: queryKeys.transactions.recent,
        queryFn: async () => {
            const all = await fetchTransactions()
            return all.slice(0, 5)
        },
    })
}

export function useTransactions() {
    return useQuery({
        queryKey: queryKeys.transactions.all,
        queryFn: fetchTransactions,
    })
}

export function useCreateTransaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            void invalidateTransactionQueries(queryClient)
        },
    })
}

export function useCreateBatchTransactions() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createBatchTransactions,
        onSuccess: () => {
            void invalidateTransactionQueries(queryClient)
        },
    })
}

export function useUpdateTransaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransactionDTO> }) => updateTransaction(id, data),
        onSuccess: () => {
            void invalidateTransactionQueries(queryClient)
        },
    })
}

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) =>
            import("./repository").then(mod => mod.deleteTransaction(id)),
        onSuccess: () => {
            void invalidateTransactionQueries(queryClient)
        },
    })
}
