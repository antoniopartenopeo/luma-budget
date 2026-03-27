import type { Metadata } from "next"
import { LandingPage } from "@/features/landing/landing-page"

export const metadata: Metadata = {
  title: "Numa Budget | Capisci il mese prima che ti travolga",
  description:
    "Numa legge i tuoi movimenti, stima cosa potrebbe restarti e ti dice se una nuova spesa fissa e davvero sostenibile. Tutto in locale.",
  keywords: [
    "app finanza personale",
    "budget locale first",
    "expense tracker privacy",
    "gestione spese locale",
    "stima fine mese",
    "financial lab"
  ],
  alternates: {
    canonical: "/"
  },
  category: "finance",
  openGraph: {
    title: "Numa Budget | Capisci il mese prima che ti travolga",
    description:
      "Numa legge i tuoi movimenti, stima cosa potrebbe restarti e ti dice se una nuova spesa fissa e davvero sostenibile. Tutto in locale.",
    url: "/",
    siteName: "NUMA Budget",
    locale: "it_IT",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Numa Budget | Capisci il mese prima che ti travolga",
    description:
      "Numa legge i tuoi movimenti, stima cosa potrebbe restarti e ti dice se una nuova spesa fissa e davvero sostenibile. Tutto in locale."
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function HomePage() {
  return <LandingPage />
}
