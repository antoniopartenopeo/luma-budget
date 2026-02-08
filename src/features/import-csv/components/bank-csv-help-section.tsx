"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ExternalLink, Landmark, HelpCircle } from "lucide-react"
import { BANK_LINKS } from "../config/bank-links"
import { cn } from "@/lib/utils"

export function BankCsvHelpSection() {
    return (
        <div className="w-full mt-2 animate-enter-up">
            <Accordion type="single" collapsible className="w-full bg-muted/20 border rounded-xl overflow-hidden shadow-sm">
                <AccordionItem value="help" className="border-none px-1">
                    <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <HelpCircle className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                                    Come ottenere il file CSV
                                </span>
                                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                                    Link rapidi alle guide ufficiali della tua banca
                                </p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                        <div className="pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {BANK_LINKS.map(bank => (
                                    <a
                                        key={bank.id}
                                        href={bank.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all group/card",
                                            "outline-none focus:ring-2 focus:ring-primary/20",
                                            "relative overflow-hidden"
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center text-muted-foreground shrink-0 group-hover/card:text-primary transition-colors">
                                            <Landmark className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-medium truncate">{bank.name}</span>
                                                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                                                {bank.region}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 text-xs border border-blue-100 dark:border-blue-900/30">
                                <p className="leading-relaxed">
                                    <strong>Nota Bene:</strong> I link portano alle pagine di supporto ufficiali.
                                    Cerca sempre l&apos;opzione <em>&quot;Esporta movimenti&quot;</em> o <em>&quot;Estratto conto&quot;</em>
                                    e scegli il formato <strong>CSV</strong> o <strong>Excel</strong>.
                                </p>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
