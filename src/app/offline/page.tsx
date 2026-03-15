import Link from "next/link";
import { RotateCcw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-7xl items-center px-4 py-12">
      <div className="glass-panel relative w-full overflow-hidden rounded-[2.5rem] p-6 shadow-2xl sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-transparent dark:from-white/[0.08]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/10 text-primary ring-1 ring-white/40 dark:ring-white/10">
              <WifiOff className="h-8 w-8" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">Modalita offline</p>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">La connessione non e disponibile.</h1>
              <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
                Alcune aree restano accessibili in locale, ma le sezioni che dipendono dalla rete o dal refresh
                dei dati potrebbero mostrare informazioni non aggiornate finche la connessione non torna stabile.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full px-5 shadow-lg shadow-primary/15">
                <Link href="/dashboard">
                  <RotateCcw className="h-4 w-4" />
                  Torna alla dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/30 bg-white/55 px-5 dark:border-white/12 dark:bg-white/[0.06]">
                <Link href="/transactions">Apri transazioni locali</Link>
              </Button>
            </div>
          </div>

          <div className="surface-strong relative overflow-hidden p-5 sm:p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <div className="relative z-10 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Cosa puoi fare ora</p>
                <h2 className="text-lg font-black tracking-tight">Continuita locale protetta</h2>
              </div>
              <div className="grid gap-3">
                <div className="surface-subtle p-4">
                  <p className="text-sm font-bold text-foreground">Consultazione</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
                    Le schermate gia presenti sul dispositivo restano navigabili.
                  </p>
                </div>
                <div className="surface-subtle p-4">
                  <p className="text-sm font-bold text-foreground">Ripresa automatica</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
                    Appena la rete torna disponibile, la sincronizzazione riprende al prossimo refresh utile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
