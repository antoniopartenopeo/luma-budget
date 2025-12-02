import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchRecentTransactions, createTransaction } from "./mock-data"
import { CreateTransactionDTO } from "./types"

export const useRecentTransactions = () => {
    return useQuery({
        queryKey: ["recent-transactions"],
        queryFn: fetchRecentTransactions,
    })
}

export const useCreateTransaction = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTransactionDTO) => createTransaction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recent-transactions"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
        },
    })
}

