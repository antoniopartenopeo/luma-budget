import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { MacroSection } from "@/components/patterns/macro-section"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StateMessage } from "@/components/ui/state-message"
import { useTransactions } from "@/features/transactions/api/use-transactions"
import { TransactionRowCard } from "@/features/transactions/components/transaction-row-card"
import { calculateDateRangeLocal, filterByRange } from "@/lib/date-ranges"
import { buildTransactionsHrefForDashboardFilter } from "../utils/dashboard-filter"
import { DashboardTimeFilter } from "../api/types"

interface RecentTransactionsProps {
    filter?: DashboardTimeFilter
}

const rowContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
}

const rowVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
    }
}

export function RecentTransactions({ filter }: RecentTransactionsProps) {
    const { data: transactions, isLoading, isError, refetch } = useTransactions()
    const prefersReducedMotion = useReducedMotion()
    const transactionsHref = filter ? buildTransactionsHrefForDashboardFilter(filter) : "/transactions"

    if (isLoading) {
        return (
            <MacroSection
                title="Movimenti recenti"
                description="Sto preparando l'anteprima del ledger nel periodo attivo..."
                className="col-span-3"
                background={<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,168,0.08),transparent_36%)]" />}
            >
                <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="glass-card flex items-center justify-between gap-4 rounded-[1.6rem] p-4">
                            <div className="flex min-w-0 items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-[1rem]" />
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-[120px]" />
                                    <Skeleton className="h-4 w-[180px]" />
                                </div>
                            </div>
                            <div className="space-y-2 text-right">
                                <Skeleton className="ml-auto h-5 w-[74px] rounded-full" />
                                <Skeleton className="ml-auto h-5 w-[86px]" />
                            </div>
                        </div>
                    ))}
                </div>
            </MacroSection>
        )
    }

    if (isError) {
        return (
            <MacroSection className="col-span-3">
                <StateMessage
                    variant="error"
                    title="Non riesco a caricare i movimenti"
                    description="Gli ultimi movimenti non sono disponibili in questo momento."
                    actionLabel="Riprova"
                    onActionClick={() => refetch()}
                />
            </MacroSection>
        )
    }

    let filteredTransactions = transactions || []

    if (filter) {
        const { startDate, endDate } = calculateDateRangeLocal(
            filter.period,
            filter.mode === "range" && filter.months ? filter.months : 1
        )

        filteredTransactions = filterByRange(filteredTransactions, startDate, endDate)
    }

    const displayedTransactions = filteredTransactions
        .toSorted((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)

    if (displayedTransactions.length === 0) {
        return (
            <MacroSection
                title="Movimenti recenti"
                description="Nel periodo attivo"
                className="col-span-3"
                background={<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,168,0.08),transparent_36%)]" />}
                headerActions={
                    <Button asChild variant="ghost" size="sm" className="gap-1 rounded-full text-primary transition-[background-color,color,box-shadow] duration-200">
                        <Link href={transactionsHref}>
                            Apri elenco completo
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                }
            >
                <StateMessage
                    variant="empty"
                    title="Nessun movimento"
                    description="Nel periodo attivo non ci sono ancora movimenti da consultare."
                />
            </MacroSection>
        )
    }

    return (
        <MacroSection
            title="Movimenti recenti"
            description="Anteprima dei 5 movimenti piu recenti nel periodo attivo"
            className="col-span-3"
            background={<div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,168,0.08),transparent_36%)]" />}
            headerActions={
                <Button asChild variant="ghost" size="sm" className="gap-1 rounded-full text-primary transition-[background-color,color,box-shadow] duration-200">
                    <Link href={transactionsHref}>
                        Apri elenco completo
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            }
        >
            <motion.ul
                variants={rowContainerVariants}
                initial={prefersReducedMotion ? false : "hidden"}
                animate={prefersReducedMotion ? undefined : "visible"}
                className="space-y-3"
            >
                {displayedTransactions.map((transaction, index) => (
                    <motion.li
                        key={transaction.id}
                        variants={rowVariants}
                        className="list-none"
                    >
                        <TransactionRowCard
                            transaction={transaction}
                            primaryAction={{
                                kind: "link",
                                href: transactionsHref,
                                ariaLabel: `Apri elenco movimenti del periodo attivo partendo da ${transaction.description}`
                            }}
                            highlight={index === 0}
                            showChevron
                        />
                    </motion.li>
                ))}
            </motion.ul>
        </MacroSection>
    )
}
