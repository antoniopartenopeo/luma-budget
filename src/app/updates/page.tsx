import type { Metadata } from "next"
import { UpdatesPageContent } from "@/features/notifications/components/updates-page-content"

export const metadata: Metadata = {
  title: "Aggiornamenti | Numa Budget",
  description: "Cronologia pubblica delle novità di Numa Budget, con note di rilascio leggibili e aggiornamenti recenti."
}

export default function UpdatesPage() {
  return <UpdatesPageContent />
}
