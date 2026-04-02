import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, FileSpreadsheet, HardDriveDownload, ShieldCheck } from "lucide-react"
import { PublicPageFrame } from "@/components/layout/public-page-frame"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { PUBLIC_FAQ_ITEMS } from "@/features/landing/public-support-content"

export const metadata: Metadata = {
  title: "FAQ | Numa Budget",
  description: "Risposte essenziali su prova demo, file supportati, dati locali e backup in Numa Budget."
}

export default function FaqPage() {
  return (
    <PublicPageFrame className="max-w-4xl">
      <div className="space-y-6">
        <section className="glass-panel rounded-[2.5rem] border-none p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.34)] sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">FAQ</p>
          <h1 className="mt-4 max-w-[14ch] text-4xl font-black leading-[0.96] tracking-tight text-foreground sm:text-5xl">
            Le domande che contano prima di iniziare.
          </h1>
          <p className="mt-4 max-w-[44rem] text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
            Questa pagina raccoglie le obiezioni più comuni su prova sicura, dati locali e continuità d&apos;uso, senza promesse oltre ciò che il prodotto fa davvero oggi.
          </p>
        </section>

        <section className="glass-panel rounded-[2.5rem] border-none p-4 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.34)] sm:p-6">
          <Accordion type="single" collapsible className="w-full">
            {PUBLIC_FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="border-b border-black/6 px-2 last:border-b-0 dark:border-white/8"
              >
                <AccordionTrigger className="text-left text-base font-semibold tracking-tight text-foreground hover:no-underline sm:text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="max-w-[60ch] text-sm font-medium leading-relaxed text-muted-foreground sm:text-[15px]">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="glass-panel rounded-[2rem] border-none p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.34)]">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground">Prova guidata</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
              Il percorso consigliato parte da import e dataset demo, non da un setup complicato.
            </p>
          </article>

          <article className="glass-panel rounded-[2rem] border-none p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.34)]">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground">Dati locali</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
              Il flusso principale non richiede cloud, sync remoto o collegamenti bancari obbligatori.
            </p>
          </article>

          <article className="glass-panel rounded-[2rem] border-none p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.34)]">
            <HardDriveDownload className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground">Continuità</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
              Se vuoi cambiare browser o dispositivo, il passaggio corretto oggi è backup JSON locale e ripristino.
            </p>
          </article>
        </section>

        <section className="glass-panel rounded-[2.5rem] border-none p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.34)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Prima prova consigliata</p>
              <p className="max-w-[36rem] text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
                Se vuoi capire il prodotto senza usare i tuoi dati, entra nel percorso di import e usa il dataset demo già disponibile.
              </p>
            </div>

            <Button asChild className="rounded-full px-6 shadow-[0_18px_40px_-24px_rgba(14,165,168,0.55)]">
              <Link href="/transactions/import">
                Prova import demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </PublicPageFrame>
  )
}
