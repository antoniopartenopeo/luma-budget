import type { Metadata } from "next"
import { PublicPageFrame } from "@/components/layout/public-page-frame"
import { UpdatesPageContent } from "@/features/notifications/components/updates-page-content"

export const metadata: Metadata = {
  title: "Aggiornamenti | Numa Budget",
  description: "Cronologia pubblica degli aggiornamenti di Numa Budget, semplificata per capire cosa cambia davvero tra una release e l'altra."
}

export default function UpdatesPage() {
  return (
    <PublicPageFrame className="max-w-5xl">
      <UpdatesPageContent />
    </PublicPageFrame>
  )
}
