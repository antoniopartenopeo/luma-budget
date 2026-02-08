export interface BankLink {
    id: string
    name: string
    url: string
    region: "IT/EU" | "UK/US"
}

export const BANK_LINKS: BankLink[] = [
    // IT / EU
    {
        id: "n26",
        name: "N26",
        url: "https://support.n26.com/en-eu/account-and-personal-details/bank-statements-and-confirmations/how-to-get-bank-statement-n26",
        region: "IT/EU"
    },
    {
        id: "revolut",
        name: "Revolut",
        url: "https://help.revolut.com/en-IT/business/help/managing-my-business/viewing-my-account-statements/finding-my-account-statement/",
        region: "IT/EU"
    },
    {
        id: "intesa",
        name: "Intesa Sanpaolo",
        url: "https://www.intesasanpaolo.com/content/internetbanking/it/faq/common/faqHome/archivio.privati.html",
        region: "IT/EU"
    },
    {
        id: "unicredit",
        name: "UniCredit",
        url: "https://www.unicredit.it/it/privati/servizi-digitali/tutti-i-servizi/banca-online/app-mobile-banking.html",
        region: "IT/EU"
    },
    {
        id: "fineco",
        name: "Fineco",
        url: "https://help.finecobank.com/it/il-conto-fineco/Documenti-contratti-ed-estratto-conto.html",
        region: "IT/EU"
    },
    {
        id: "poste",
        name: "BancoPosta / Poste",
        url: "https://www.poste.it/conti-correnti-bancoposta/estratto-conto-online",
        region: "IT/EU"
    },
    {
        id: "ing",
        name: "ING",
        url: "https://www.ing.it/faq/altre-informazioni/estratto-conto-e-giacenza-media.html",
        region: "IT/EU"
    },
    {
        id: "bunq",
        name: "bunq",
        url: "https://help.bunq.com/articles/how-do-i-export-a-bank-statement",
        region: "IT/EU"
    },
    {
        id: "wise",
        name: "Wise",
        url: "https://www.profee.com/help/bank-statement",
        region: "IT/EU"
    },
    // UK / US
    {
        id: "monzo",
        name: "Monzo",
        url: "https://monzo.com/help/budgeting-and-saving/export-your-transactions",
        region: "UK/US"
    },
    {
        id: "chase",
        name: "Chase",
        url: "https://www.chase.com/digital/customer-service/helpful-tips/business-banking/account-activity-download",
        region: "UK/US"
    }
]
