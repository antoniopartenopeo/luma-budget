import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, FileSpreadsheet, HardDriveDownload, ShieldCheck } from "lucide-react"
import { PublicPageFrame } from "@/components/layout/public-page-frame"
import { PublicSupportIntro, PublicSupportSurface } from "@/components/layout/public-support-surface"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { PUBLIC_FAQ_ITEMS } from "@/features/landing/public-support-content"

export const metadata: Metadata = {
  title: "FAQ | Numa Budget",
  description: "Risposte semplici su demo, import, dati sul dispositivo e backup in Numa Budget."
}

export default function FaqPage() {
  return (
    <PublicPageFrame className="max-w-4xl">
      <div className="space-y-6">
        <PublicSupportIntro
          eyebrow="FAQ"
          title="Prima di iniziare, le cose importanti."
          description="Qui trovi risposte brevi su demo, import, dati locali e backup. Solo quello che Numa fa davvero oggi."
        />

        <PublicSupportSurface className="p-4 sm:p-6">
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
                <AccordionContent className="max-w-[60ch] text-sm font-normal leading-relaxed text-muted-foreground sm:text-[15px]">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </PublicSupportSurface>

        <section className="grid gap-4 md:grid-cols-3">
          <PublicSupportSurface className="rounded-[2rem] p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.34)]">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground">Provi senza rischi</h2>
            <p className="mt-2 text-sm font-normal leading-relaxed text-muted-foreground">
              Puoi usare la demo prima di caricare movimenti reali.
            </p>
          </PublicSupportSurface>

          <PublicSupportSurface className="rounded-[2rem] p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.34)]">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground">Dati sul dispositivo</h2>
            <p className="mt-2 text-sm font-normal leading-relaxed text-muted-foreground">
              Il percorso principale non richiede account o collegamenti bancari.
            </p>
          </PublicSupportSurface>

          <PublicSupportSurface className="rounded-[2rem] p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.34)]">
            <HardDriveDownload className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground">Backup chiaro</h2>
            <p className="mt-2 text-sm font-normal leading-relaxed text-muted-foreground">
              Se cambi dispositivo, esporti un file e lo ripristini dove ti serve.
            </p>
          </PublicSupportSurface>
        </section>

        <PublicSupportSurface tone="accent">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Prima prova</p>
              <p className="max-w-[36rem] text-sm font-normal leading-relaxed text-muted-foreground sm:text-base">
                Se vuoi capire Numa senza usare i tuoi dati, entra nel percorso di import e scegli la demo.
              </p>
            </div>

            <Button asChild className="rounded-full px-6 shadow-[0_18px_40px_-24px_rgba(14,165,168,0.55)]">
              <Link href="/transactions/import">
                Apri la demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </PublicSupportSurface>
      </div>
    </PublicPageFrame>
  )
}
