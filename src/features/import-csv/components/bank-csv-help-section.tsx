"use client"

import { ExternalLink, Landmark, HelpCircle } from "lucide-react"
import { BANK_LINKS } from "../config/bank-links"
import { cn } from "@/lib/utils"
import { ExpandableCard } from "@/components/patterns/expandable-card"

export function BankCsvHelpSection() {
    return (
        <div className="w-full mt-2 animate-enter-up">
            <ExpandableCard
                icon={<HelpCircle className="h-5 w-5 text-primary" />}
                indicatorColor="bg-primary"
                title={
                    <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                        Come ottenere il file CSV
                    </h3>
                }
                description={
                    <p className="text-sm font-medium text-muted-foreground">
                        Link rapidi alle guide ufficiali della tua banca
                    </p>
                }
                className="w-full"
                contentClassName="mt-2"
                expandedContent={
                    <div className="space-y-4 pl-0 sm:pl-[64px]">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {BANK_LINKS.map((bank) => (
                                <a
                                    key={bank.id}
                                    href={bank.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(event) => event.stopPropagation()}
                                    className={cn(
                                        "group/card relative overflow-hidden rounded-lg border border-border/60 bg-background/60 p-3 transition-colors hover:border-primary/30 hover:bg-muted/40",
                                        "flex items-center gap-3 outline-none focus:ring-2 focus:ring-primary/20"
                                    )}
                                >
                                    <Landmark className="h-3 w-3 shrink-0 text-muted-foreground group-hover/card:text-primary" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="truncate text-sm font-medium">{bank.name}</span>
                                            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover/card:opacity-100" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">{bank.region}</p>
                                    </div>
                                </a>
                            ))}
                        </div>

                        <div className="rounded-lg border border-sky-200/60 bg-sky-50/80 p-3 text-sm text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-300">
                            <p className="leading-relaxed">
                                <strong>Nota:</strong> cerca <em>&quot;Esporta movimenti&quot;</em> o <em>&quot;Estratto conto&quot;</em> e scegli <strong>CSV</strong> o <strong>Excel</strong>.
                            </p>
                        </div>
                    </div>
                }
            />
        </div>
    )
}
