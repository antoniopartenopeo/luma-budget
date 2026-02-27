import Link from "next/link";

export default function OfflinePage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Sei offline</h1>
      <p className="mt-3 text-muted-foreground">
        Non c&apos;è connessione al momento. Alcune schermate restano disponibili, ma i contenuti
        che richiedono rete potrebbero non aggiornarsi.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Riprova dalla dashboard
      </Link>
    </section>
  );
}
