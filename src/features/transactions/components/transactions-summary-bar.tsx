"use client";

import { Card } from "@/components/ui/card";
import { TransactionSummary } from "../utils/transactions-logic";
import { formatCents } from "@/domain/money";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, Hash } from "lucide-react";
import { usePrivacyStore } from "@/features/privacy/privacy.store";
import { getPrivacyClass } from "@/features/privacy/privacy-utils";

interface TransactionsSummaryBarProps {
    summary: TransactionSummary;
    isLoading?: boolean;
}

export function TransactionsSummaryBar({ summary, isLoading }: TransactionsSummaryBarProps) {
    const { isPrivacyMode } = usePrivacyStore();

    const items = [
        {
            label: "Operazioni",
            value: summary.totalCount.toString(), // Counts are not usually sensitive, keeping visible or blur? User said "amounts". Counts are arguably sensitive. Let's blur money only for now based on strict request, or all? "Importo" usually means money. Let's blur money.
            icon: Hash,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-100",
            isMoney: false
        },
        {
            label: "Entrate",
            value: formatCents(summary.totalIncome),
            icon: TrendingUp,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-100",
            isMoney: true
        },
        {
            label: "Uscite",
            value: formatCents(summary.totalExpense),
            icon: TrendingDown,
            color: "text-rose-600",
            bgColor: "bg-rose-50",
            borderColor: "border-rose-100",
            isMoney: true
        },
        {
            label: "Bilancio",
            value: formatCents(summary.netBalance),
            icon: Wallet,
            color: summary.netBalance >= 0 ? "text-emerald-700" : "text-rose-700",
            bgColor: summary.netBalance >= 0 ? "bg-emerald-100/50" : "bg-rose-100/50",
            borderColor: summary.netBalance >= 0 ? "border-emerald-200" : "border-rose-200",
            isMoney: true
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {items.map((item) => (
                <Card
                    key={item.label}
                    className={cn(
                        "p-3 md:p-4 rounded-xl flex flex-col gap-1 transition-all glass-card",
                        isLoading ? "opacity-50 animate-pulse" : ""
                    )}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {item.label}
                        </span>
                        <div className={cn("p-1.5 rounded-lg border", item.bgColor, item.borderColor)}>
                            <item.icon className={cn("h-3 w-3 md:h-3.5 md:h-3.5", item.color)} />
                        </div>
                    </div>
                    <div className={cn("text-base md:text-xl font-black tabular-nums tracking-tight mt-1", item.color, item.isMoney && getPrivacyClass(isPrivacyMode))}>
                        {item.value}
                    </div>
                </Card>
            ))}
        </div>
    );
}
