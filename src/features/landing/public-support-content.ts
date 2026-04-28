export interface PublicFaqItem {
  question: string
  answer: string
}

export const PUBLIC_FAQ_ITEMS: PublicFaqItem[] = [
  {
    question: "Da dove parto?",
    answer:
      "Puoi iniziare con il dataset demo oppure con un file esportato dalla banca. Prima di salvare, Numa ti fa controllare cosa ha letto."
  },
  {
    question: "Devo usare subito i miei dati?",
    answer:
      "No. Puoi usare il dataset demo e capire come funziona senza caricare movimenti reali."
  },
  {
    question: "Dove finiscono i miei dati?",
    answer:
      "Nel percorso principale restano nel browser del dispositivo che stai usando. Non serve creare un account per iniziare."
  },
  {
    question: "Se cambio dispositivo, li ritrovo?",
    answer:
      "No, non si spostano da soli. Per portarli con te devi esportare un backup e poi ripristinarlo."
  },
  {
    question: "Il backup è sicuro?",
    answer:
      "Il backup è un file JSON non cifrato. È comodo per spostare i dati, ma va trattato come un documento finanziario sensibile."
  },
  {
    question: "Devo collegare la banca?",
    answer:
      "No. Il flusso principale parte da un file esportato o dalla demo. Nessun collegamento bancario è obbligatorio per provare Numa."
  }
] as const
