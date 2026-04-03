import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, HardDrive, ShieldCheck, WalletCards } from "lucide-react"
import { PublicPageFrame } from "@/components/layout/public-page-frame"
import { Button } from "@/components/ui/button"

const PRIVACY_POINTS = [
  {
    icon: ShieldCheck,
    title: "Dati nel browser",
    body:
      "Nel percorso principale i tuoi dati restano nel browser sul dispositivo che stai usando, senza cloud obbligatorio per iniziare."
  },
  {
    icon: WalletCards,
    title: "Nessun account obbligatorio",
    body:
      "Per iniziare non devi creare un account e non devi collegare una banca. Puoi partire dal file esportato o dal dataset demo."
  },
  {
    icon: HardDrive,
    title: "Backup locale",
    body:
      "Se cambi browser o dispositivo, i dati non si sincronizzano in automatico. Oggi il passaggio corretto è export locale e ripristino del backup."
  }
] as const

export const metadata: Metadata = {
  title: "Privacy | Numa Budget",
  description: "Come funziona oggi la privacy in Numa Budget: dati nel browser, nessun account obbligatorio e backup locale."
}

export default function PrivacyPage() {
  return (
    <PublicPageFrame className="max-w-4xl">
      <div className="space-y-6">
        <section className="glass-panel rounded-[2.5rem] border-none p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.34)] sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Privacy</p>
          <h1 className="mt-4 max-w-[14ch] text-4xl font-black leading-[0.96] tracking-tight text-foreground sm:text-5xl">
            Come funziona la privacy in Numa, oggi.
          </h1>
          <p className="mt-4 max-w-[44rem] text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
            Questa pagina riassume in modo semplice come si comporta il prodotto nel percorso principale: dati nel browser, nessun account obbligatorio per iniziare e continuità tramite backup locale.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {PRIVACY_POINTS.map((point) => (
            <article
              key={point.title}
              className="glass-panel rounded-[2rem] border-none p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.34)]"
            >
              <point.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground">{point.title}</h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{point.body}</p>
            </article>
          ))}
        </section>

        <section className="glass-panel rounded-[2.5rem] border-none p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.34)] sm:p-8">
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Cosa significa oggi, in pratica</h2>
              <p className="max-w-[42rem] text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
                Questa non è una pagina legale estesa. È la sintesi operativa di come si comporta il prodotto oggi nel suo percorso principale.
              </p>
            </div>

            <div className="space-y-4 text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
              <p>
                I dati restano nel browser sul dispositivo in uso. Non esiste una sincronizzazione cloud obbligatoria nella user journey principale.
              </p>
              <p>
                L&apos;eventuale perdita di cache o il cambio browser/dispositivo non trasferiscono i dati in automatico. Per continuità oggi esiste il backup locale in formato JSON con relativo ripristino.
              </p>
              <p>
                Il backup esportato è un file JSON non cifrato: è utile per portare i dati con te, ma va trattato come un file finanziario sensibile.
              </p>
              <p>
                Il percorso principale che stai provando qui non dipende da un account o da una sincronizzazione cloud obbligatoria.
              </p>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[2.5rem] border border-amber-500/18 bg-amber-500/7 p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.28)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
                Nota importante
              </p>
              <p className="max-w-[38rem] text-sm font-medium leading-relaxed text-foreground/80 sm:text-base">
                Se vuoi evitare qualsiasi uso di dati personali nella prima prova, usa il dataset demo integrato nel percorso di import.
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
