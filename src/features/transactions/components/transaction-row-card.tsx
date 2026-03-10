"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CategoryIcon } from "@/features/categories/components/category-icon"
import { usePrivacyStore } from "@/features/privacy/privacy.store"
import { getPrivacyClass } from "@/features/privacy/privacy-utils"
import { useCurrency } from "@/features/settings/api/use-currency"
import { formatSignedCents } from "@/domain/money/currency"
import { getSignedCents } from "@/domain/transactions"
import type { Transaction } from "../api/types"
import { formatTransactionDate } from "../utils/format-date"
import { cn } from "@/lib/utils"

type TransactionRowPrimaryAction =
    | {
        kind: "button"
        ariaLabel: string
        onClick: () => void
    }
    | {
        kind: "link"
        ariaLabel: string
        href: string
    }

interface TransactionRowCardProps {
    transaction: Transaction
    primaryAction?: TransactionRowPrimaryAction
    endSlot?: React.ReactNode
    className?: string
    highlight?: boolean
    showChevron?: boolean
    layout?: "compact" | "table"
}

export const TRANSACTION_TABLE_COLUMNS_CLASS_NAME = "md:grid-cols-[5.6rem_minmax(0,1fr)_7.25rem_5.35rem_7.15rem]"
export const TRANSACTION_TABLE_HEADER_COLUMNS_CLASS_NAME = "md:grid-cols-[5.6rem_minmax(0,1fr)_7.25rem_5.35rem_7.15rem_2.5rem]"
export const TRANSACTION_TABLE_DESCRIPTION_HEADER_OFFSET_CLASS_NAME = "md:pl-10"

const SURFACE_CLASS_NAME = "group/transaction glass-card relative overflow-hidden rounded-[1.6rem] border [content-visibility:auto] [contain-intrinsic-size:88px] transition-[border-color,box-shadow,background-color] duration-200 hover:border-white/55 hover:shadow-[0_20px_38px_-28px_rgba(15,23,42,0.36)]"
const PRIMARY_ACTION_CLASS_NAME = "group/transaction-surface flex min-w-0 flex-1 items-center rounded-[calc(1.6rem-1px)] px-3.5 py-3 text-left transition-[background-color,color,box-shadow] duration-200 hover:bg-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 dark:hover:bg-white/[0.08]"

function resolveIconShellClassName(transaction: Transaction, layout: "compact" | "table") {
    return cn(
        "rounded-[1rem] border border-white/22 bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-white/10 dark:bg-white/[0.06]",
        layout === "table" ? "p-1.5" : "p-2"
    )
}

function resolveCategoryIconClassName(transaction: Transaction) {
    return cn(
        "border border-border/50",
        transaction.isSuperfluous && "border-amber-400/55 ring-1 ring-amber-400/40"
    )
}

function TransactionRowBody({
    transaction,
    showChevron,
    layout,
}: {
    transaction: Transaction
    showChevron: boolean
    layout: "compact" | "table"
}) {
    const { currency, locale } = useCurrency()
    const { isPrivacyMode } = usePrivacyStore()
    const signedCents = getSignedCents(transaction)
    const isTableLayout = layout === "table"

    return (
        <div
            data-testid={`transaction-row-body-${transaction.id}`}
            className={cn(
                "grid min-w-0 flex-1 gap-3 md:items-center md:gap-4",
                isTableLayout
                    ? TRANSACTION_TABLE_COLUMNS_CLASS_NAME
                    : "md:grid-cols-[minmax(0,1fr)_6.75rem_9.5rem]"
            )}
        >
            {isTableLayout ? (
                <div className="hidden md:flex">
                    <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground/76">
                        {formatTransactionDate(transaction)}
                    </span>
                </div>
            ) : null}

            <div className={cn("flex min-w-0 w-full items-center", isTableLayout ? "gap-3" : "gap-4")}>
                <div
                    data-testid={`transaction-icon-shell-${transaction.id}`}
                    className={resolveIconShellClassName(transaction, layout)}
                >
                    <CategoryIcon
                        categoryName={transaction.category}
                        categoryId={transaction.categoryId}
                        size={isTableLayout ? 16 : 18}
                        showBackground
                        className={resolveCategoryIconClassName(transaction)}
                    />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                    <div className={cn(
                        "flex min-w-0 flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground/78",
                        isTableLayout && "md:hidden"
                    )}>
                        <span className="rounded-full border border-white/34 bg-white/44 px-2 py-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:border-white/10 dark:bg-white/[0.05]">
                            {formatTransactionDate(transaction)}
                        </span>
                        <span className="truncate">{transaction.category}</span>
                    </div>

                    <p className="max-w-full truncate text-[0.925rem] font-semibold leading-tight text-foreground transition-colors group-hover/transaction-surface:text-primary">
                        {transaction.description}
                    </p>
                </div>
            </div>

            {isTableLayout ? (
                <div className="hidden min-w-0 md:block">
                    <p className="truncate whitespace-nowrap text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground/78">
                        {transaction.category}
                    </p>
                </div>
            ) : null}

            <div className="flex items-center md:justify-center">
                {transaction.type === "income" ? (
                    <Badge
                        variant="secondary"
                        className="rounded-full border border-emerald-500/16 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300"
                    >
                        Entrata
                    </Badge>
                ) : (
                    <span className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground/72">
                        Uscita
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between gap-2 md:min-w-[7.15rem] md:justify-end">
                <div
                    className={cn(
                        "shrink-0 text-[0.95rem] font-black tabular-nums tracking-tight",
                        transaction.type === "income" ? "text-emerald-600 dark:text-emerald-300" : "text-foreground",
                        getPrivacyClass(isPrivacyMode)
                    )}
                >
                    {formatSignedCents(signedCents, currency, locale)}
                </div>

                {showChevron ? (
                    <ChevronRight className="h-4 w-4 text-foreground/38 transition-transform duration-200 group-hover/transaction-surface:translate-x-0.5 group-hover/transaction-surface:text-foreground/68" />
                ) : null}
            </div>
        </div>
    )
}

function renderPrimaryAction(
    primaryAction: TransactionRowPrimaryAction | undefined,
    transaction: Transaction,
    showChevron: boolean,
    layout: "compact" | "table"
) {
    const content = (
        <TransactionRowBody
            transaction={transaction}
            showChevron={showChevron}
            layout={layout}
        />
    )

    if (!primaryAction) {
        return <div className={PRIMARY_ACTION_CLASS_NAME}>{content}</div>
    }

    if (primaryAction.kind === "link") {
        return (
            <Link
                href={primaryAction.href}
                aria-label={primaryAction.ariaLabel}
                className={PRIMARY_ACTION_CLASS_NAME}
            >
                {content}
            </Link>
        )
    }

    return (
        <button
            type="button"
            aria-label={primaryAction.ariaLabel}
            onClick={primaryAction.onClick}
            className={PRIMARY_ACTION_CLASS_NAME}
        >
            {content}
        </button>
    )
}

export function TransactionRowCard({
    transaction,
    primaryAction,
    endSlot,
    className,
    highlight = false,
    showChevron = false,
    layout = "compact",
}: TransactionRowCardProps) {
    return (
        <article
            className={cn(
                SURFACE_CLASS_NAME,
                highlight && "border-primary/18",
                className
            )}
        >
            <div className="pointer-events-none absolute inset-[1px] rounded-[calc(1.6rem-1px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_34%,transparent_62%)] opacity-80" />

            <div className="relative z-10 flex items-stretch gap-2">
                {renderPrimaryAction(primaryAction, transaction, showChevron, layout)}

                {endSlot ? (
                    <div className="flex shrink-0 items-center pr-3">
                        {endSlot}
                    </div>
                ) : null}
            </div>
        </article>
    )
}
