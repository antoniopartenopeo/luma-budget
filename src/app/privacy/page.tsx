import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, HardDrive, ShieldCheck, WalletCards } from "lucide-react"
import { PublicPageFrame } from "@/components/layout/public-page-frame"
import { PublicSupportIntro, PublicSupportSurface } from "@/components/layout/public-support-surface"
import { Button } from "@/components/ui/button"

const PRIVACY_POINTS = [
  {
    icon: ShieldCheck,
    title: "Dati sul dispositivo",
    body:
      "Nel percorso principale i dati restano nel browser del dispositivo che stai usando."
  },
  {
    icon: WalletCards,
    title: "Nessun account per provare",
    body:
      "Puoi iniziare dalla demo o da un file esportato dalla banca, senza collegare un conto."
  },
  {
    icon: HardDrive,
    title: "Backup da proteggere",
    body:
      "Se vuoi spostare i dati, esporti un file. Quel file contiene dati finanziari e va custodito bene."
  }
] as const

export const metadata: Metadata = {
  title: "Privacy | Numa Budget",
  description: "Come Numa Budget gestisce oggi dati sul dispositivo, account, demo e backup."
}

export default function PrivacyPage() {
  return (
    <PublicPageFrame className="max-w-4xl">
      <div className="space-y-6">
        <PublicSupportIntro
          eyebrow="Privacy"
          title="I tuoi dati, spiegati semplice."
          description="Numa parte da una scelta chiara: puoi provarlo senza account, senza collegare la banca e con dati sul dispositivo."
        />

        <section className="grid gap-4 md:grid-cols-3">
          {PRIVACY_POINTS.map((point) => (
            <PublicSupportSurface
              key={point.title}
              className="rounded-[2rem] p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.34)]"
            >
              <point.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground">{point.title}</h2>
              <p className="mt-2 text-sm font-normal leading-relaxed text-muted-foreground">{point.body}</p>
            </PublicSupportSurface>
          ))}
        </section>

        <PublicSupportSurface>
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Cosa significa, in pratica</h2>
              <p className="max-w-[42rem] text-sm font-normal leading-relaxed text-muted-foreground sm:text-base">
                Questa non è una pagina legale lunga. È il riassunto pratico di come funziona Numa oggi.
              </p>
            </div>

            <div className="space-y-4 text-sm font-normal leading-relaxed text-muted-foreground sm:text-base">
              <p>
                Quando usi il percorso principale, i dati restano nel browser del dispositivo in uso.
              </p>
              <p>
                Se cancelli i dati del browser, cambi browser o cambi dispositivo, Numa non li sposta automaticamente.
              </p>
              <p>
                Per portarli con te puoi usare il backup. Il backup è un file JSON non cifrato: utile, ma sensibile.
              </p>
              <p>
                Per iniziare non serve un account e non serve collegare la banca. Puoi usare la demo o un file esportato da te.
              </p>
            </div>
          </div>
        </PublicSupportSurface>

        <PublicSupportSurface tone="warm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
                Nota importante
              </p>
              <p className="max-w-[38rem] text-sm font-normal leading-relaxed text-foreground/80 sm:text-base">
                Se vuoi provare senza dati personali, usa la demo integrata nel percorso di import.
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
