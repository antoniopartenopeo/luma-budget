import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchTransactions, createTransaction, updateTransaction } from "./repository"
import { queryKeys } from "@/lib/query-keys"
import { CreateTransactionDTO } from "./types"

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
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.recent })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
        },
    })
}

export function useUpdateTransaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransactionDTO> }) => updateTransaction(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.recent })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
        },
    })
}

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) =>
            import("./repository").then(mod => mod.deleteTransaction(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.recent })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
        },
    })
}

