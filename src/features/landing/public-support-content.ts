export interface PublicFaqItem {
  question: string
  answer: string
}

export const PUBLIC_FAQ_ITEMS: PublicFaqItem[] = [
  {
    question: "Quali file sono supportati?",
    answer:
      "Numa legge file CSV o TXT esportati dalla banca e ti accompagna con una review guidata prima del salvataggio."
  },
  {
    question: "Posso provarlo senza usare i miei dati?",
    answer:
      "Si. Nel percorso di import puoi caricare il dataset demo integrato e vedere il sistema senza usare il tuo estratto conto."
  },
  {
    question: "Dove restano i dati?",
    answer:
      "Nel percorso principale i dati restano nel browser sul dispositivo in uso, senza account obbligatorio per iniziare."
  },
  {
    question: "Cosa succede se cambio browser o dispositivo?",
    answer:
      "I dati non si spostano automaticamente. Oggi il passaggio corretto è backup JSON locale e ripristino."
  }
] as const
