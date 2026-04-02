import type { Metadata } from "next"
import { TransactionsImportPageContent } from "./transactions-import-page-content"

export const metadata: Metadata = {
  title: "Importa CSV | Numa Budget",
  description: "Prova Numa con il tuo file esportato o con il dataset demo integrato, senza account obbligatorio."
}

export default function TransactionsImportPage() {
  return <TransactionsImportPageContent />
}
