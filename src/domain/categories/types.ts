// =====================
// CATEGORY ID CONSTANTS
// =====================

export const CategoryIds = {
    // Expense: Essential
    CIBO: "cibo",
    AFFITTO_MUTUO: "affitto_mutuo",
    UTENZE: "utenze",
    TRASPORTI: "trasporti",
    AUTO_CARBURANTE: "auto_carburante",
    SALUTE_FARMACIA: "salute_farmacia",
    ISTRUZIONE: "istruzione",
    ASSICURAZIONI: "assicurazioni",
    TASSE: "tasse",
    FAMIGLIA: "famiglia",
    TELEFONIA_INTERNET: "telefonia_internet",
    MANUTENZIONE_CASA: "manutenzione_casa",
    SPESE_CONDOMINIALI: "spese_condominiali",
    RATE_PRESTITI: "rate_prestiti",
    ALTRO_ESSENZIALE: "altro_essenziale",

    // Expense: Comfort
    RISTORANTI: "ristoranti",
    BAR_CAFFE: "bar_caffe",
    ABBONAMENTI: "abbonamenti",
    SHOPPING: "shopping",
    VIAGGI: "viaggi",
    HOBBY_SPORT: "hobby_sport",
    BENESSERE: "benessere",
    ANIMALI: "animali",
    TECNOLOGIA: "tecnologia",
    REGALI: "regali",
    CASA_ARREDO: "casa_arredo",
    LIBRI_CULTURA: "libri_cultura",
    GIARDINAGGIO: "giardinaggio",
    AUTO_MANUTENZIONE: "auto_manutenzione",
    ALTRO_COMFORT: "altro_comfort",

    // Expense: Superfluous
    SVAGO_EXTRA: "svago_extra",
    MICRO_DIGITALI: "micro_digitali",
    LUSSO: "lusso",
    GIOCHI_SCOMMESSE: "giochi_scommesse",
    EXTRA_IMPULSIVI: "extra_impulsivi",
    TABACCO_VAPE: "tabacco_vape",
    LOTTERIE: "lotterie",
    ALCOOL_EXTRA: "alcool_extra",
    FAST_FOOD: "fast_food",
    ALTRO_SUPERFLUO: "altro_superfluo",

    // Income
    STIPENDIO: "stipendio",
    PENSIONE: "pensione",
    FREELANCE: "freelance",
    BONUS_PREMI: "bonus_premi",
    AFFITTI_PERCEPITI: "affitti_percepiti",
    INVESTIMENTI_PROFITTI: "investimenti_profitti",
    VENDITE_USATO: "vendite_usato",
    RIMBORSI: "rimborsi",
    REGALI_RICEVUTI: "regali_ricevuti",
    CASHBACK_PUNTI: "cashback_punti",
    ENTRATE_OCCASIONALI: "entrate_occasionali"
} as const;

export type ExpenseCategoryId = typeof CategoryIds[keyof Omit<typeof CategoryIds, "STIPENDIO" | "PENSIONE" | "FREELANCE" | "BONUS_PREMI" | "AFFITTI_PERCEPITI" | "INVESTIMENTI_PROFITTI" | "VENDITE_USATO" | "RIMBORSI" | "REGALI_RICEVUTI" | "CASHBACK_PUNTI" | "ENTRATE_OCCASIONALI">];

export type IncomeCategoryId = typeof CategoryIds[keyof Pick<typeof CategoryIds, "STIPENDIO" | "PENSIONE" | "FREELANCE" | "BONUS_PREMI" | "AFFITTI_PERCEPITI" | "INVESTIMENTI_PROFITTI" | "VENDITE_USATO" | "RIMBORSI" | "REGALI_RICEVUTI" | "CASHBACK_PUNTI" | "ENTRATE_OCCASIONALI">];

export type CategoryId = string

// =====================
// CATEGORY TYPES
// =====================

export type CategoryKind = "expense" | "income"

// Unified Category Group Key (Essential, Comfort, Superfluous, Income)
export type CategoryGroupKey =
    | "essential"
    | "comfort"
    | "superfluous"
    | "income"

// Spending Nature for expenses only
export type SpendingNature = Exclude<CategoryGroupKey, "income">

export interface Category {
    id: CategoryId
    label: string
    kind: CategoryKind
    color: string
    hexColor: string
    iconName: string
    spendingNature: SpendingNature
    archived?: boolean
    updatedAt?: string
}

export interface CategoryGroup {
    key: CategoryGroupKey
    label: string
    categories: Category[]
}
