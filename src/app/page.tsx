import type { Metadata } from "next"
import { LandingPage } from "@/features/landing/landing-page"

export const metadata: Metadata = {
  title: "Numa Budget | Sai cosa puoi fare prima di spendere",
  description:
    "Numa mette in ordine i tuoi movimenti e ti mostra cosa resta prima di aggiungere una nuova spesa.",
  keywords: [
    "app finanza personale",
    "budget personale",
    "expense tracker privacy",
    "gestione spese",
    "pianificazione spese",
    "budget mensile"
  ],
  alternates: {
    canonical: "/"
  },
  category: "finance",
  openGraph: {
    title: "Numa Budget | Sai cosa puoi fare prima di spendere",
    description:
      "Numa mette in ordine i tuoi movimenti e ti mostra cosa resta prima di aggiungere una nuova spesa.",
    url: "/",
    siteName: "NUMA Budget",
    locale: "it_IT",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Numa Budget | Sai cosa puoi fare prima di spendere",
    description:
      "Numa mette in ordine i tuoi movimenti e ti mostra cosa resta prima di aggiungere una nuova spesa."
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function HomePage() {
  return <LandingPage />
}
