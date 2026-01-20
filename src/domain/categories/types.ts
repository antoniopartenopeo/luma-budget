
// =====================
// CATEGORY ID TYPES
// =====================

export type ExpenseCategoryId =
    | "cibo"
    | "trasporti"
    | "casa"
    | "svago"
    | "salute"
    | "shopping"
    | "viaggi"
    | "istruzione"
    | "investimenti"
    | "altro"
    | "utenze"
    | "auto"
    | "assicurazioni"
    | "tasse"
    | "famiglia"
    | "servizi-domestici"
    | "lavoro-essenziale"
    | "ristoranti"
    | "benessere"
    | "hobby-sport"
    | "abbonamenti"
    | "animali"
    | "tecnologia"
    | "regali"
    | "arredo"
    | "formazione-extra"
    | "micro-digitali"
    | "lusso"
    | "giochi-scommesse"
    | "extra-impulsivi"

export type IncomeCategoryId =
    | "stipendio"
    | "pensione"
    | "freelance"
    | "bonus"
    | "affitti"
    | "rendite"
    | "vendite"
    | "rimborsi"
    | "regali-ricevuti"
    | "cashback"
    | "entrate-occasionali"

export type CategoryId = string

// =====================
// CATEGORY TYPES
// =====================

export type CategoryKind = "expense" | "income"
export type SpendingNature = "essential" | "comfort" | "superfluous"

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

export type CategoryGroupKey =
    | "essential"
    | "comfort"
    | "superfluous"
    | "income"

export interface CategoryGroup {
    key: CategoryGroupKey
    label: string
    categories: Category[]
}
