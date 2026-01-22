import { Category, CategoryGroupKey, CategoryIds } from "./types"

// =====================
// CATEGORIES DATA (DEFAULTS)
// =====================

export const CATEGORIES: Category[] = [
    // ==========================================
    // SPESE ESSENZIALI (Essential)
    // ==========================================
    {
        id: CategoryIds.CIBO,
        label: "Spesa Alimentare",
        kind: "expense",
        color: "text-orange-600 bg-orange-100",
        hexColor: "#ea580c",
        iconName: "utensils",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.AFFITTO_MUTUO,
        label: "Affitto o Mutuo",
        kind: "expense",
        color: "text-indigo-600 bg-indigo-100",
        hexColor: "#4f46e5",
        iconName: "home",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.UTENZE,
        label: "Bollette (Gas/Luce/Acqua)",
        kind: "expense",
        color: "text-amber-600 bg-amber-100",
        hexColor: "#d97706",
        iconName: "zap",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.TRASPORTI,
        label: "Mezzi Pubblici",
        kind: "expense",
        color: "text-blue-600 bg-blue-100",
        hexColor: "#2563eb",
        iconName: "bus",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.AUTO_CARBURANTE,
        label: "Carburante & Ricariche",
        kind: "expense",
        color: "text-slate-600 bg-slate-100",
        hexColor: "#475569",
        iconName: "car",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.SALUTE_FARMACIA,
        label: "Salute & Farmacia",
        kind: "expense",
        color: "text-teal-600 bg-teal-100",
        hexColor: "#0d9488",
        iconName: "heartPulse",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.ISTRUZIONE,
        label: "Scuola & Corsi",
        kind: "expense",
        color: "text-yellow-600 bg-yellow-100",
        hexColor: "#ca8a04",
        iconName: "graduationCap",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.ASSICURAZIONI,
        label: "Assicurazioni (Auto/Vita)",
        kind: "expense",
        color: "text-cyan-600 bg-cyan-100",
        hexColor: "#0891b2",
        iconName: "shield",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.TASSE,
        label: "Tasse & Tributi",
        kind: "expense",
        color: "text-red-600 bg-red-100",
        hexColor: "#dc2626",
        iconName: "fileText",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.FAMIGLIA,
        label: "Famiglia & Figli",
        kind: "expense",
        color: "text-rose-600 bg-rose-100",
        hexColor: "#e11d48",
        iconName: "users",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.TELEFONIA_INTERNET,
        label: "Telefonia & Internet",
        kind: "expense",
        color: "text-blue-500 bg-blue-50",
        hexColor: "#3b82f6",
        iconName: "phone",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.MANUTENZIONE_CASA,
        label: "Manutenzione Casa",
        kind: "expense",
        color: "text-violet-600 bg-violet-100",
        hexColor: "#7c3aed",
        iconName: "wrench",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.SPESE_CONDOMINIALI,
        label: "Spese Condominiali",
        kind: "expense",
        color: "text-indigo-500 bg-indigo-50",
        hexColor: "#6366f1",
        iconName: "building2",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.RATE_PRESTITI,
        label: "Rate & Prestiti",
        kind: "expense",
        color: "text-red-500 bg-red-50",
        hexColor: "#ef4444",
        iconName: "creditCard",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.ALTRO_ESSENZIALE,
        label: "Altro Essenziale",
        kind: "expense",
        color: "text-gray-600 bg-gray-100",
        hexColor: "#4b5563",
        iconName: "helpCircle",
        spendingNature: "essential",
        archived: false
    },

    // ==========================================
    // SPESE PER IL BENESSERE (Comfort)
    // ==========================================
    {
        id: CategoryIds.RISTORANTI,
        label: "Ristoranti & Take-away",
        kind: "expense",
        color: "text-orange-500 bg-orange-50",
        hexColor: "#f97316",
        iconName: "utensilsCrossed",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.BAR_CAFFE,
        label: "Bar & Caffetteria",
        kind: "expense",
        color: "text-amber-500 bg-amber-50",
        hexColor: "#f59e0b",
        iconName: "coffee",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.ABBONAMENTI,
        label: "Streaming & Media",
        kind: "expense",
        color: "text-blue-500 bg-blue-50",
        hexColor: "#3b82f6",
        iconName: "tv",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.SHOPPING,
        label: "Abbigliamento & Accessori",
        kind: "expense",
        color: "text-purple-600 bg-purple-100",
        hexColor: "#9333ea",
        iconName: "shirt",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.VIAGGI,
        label: "Viaggi & Hotel",
        kind: "expense",
        color: "text-sky-600 bg-sky-100",
        hexColor: "#0284c7",
        iconName: "plane",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.HOBBY_SPORT,
        label: "Sport & Palestra",
        kind: "expense",
        color: "text-lime-600 bg-lime-100",
        hexColor: "#65a30d",
        iconName: "dumbbell",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.BENESSERE,
        label: "Cura Personale & Spa",
        kind: "expense",
        color: "text-fuchsia-600 bg-fuchsia-100",
        hexColor: "#c026d3",
        iconName: "sparkle",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.ANIMALI,
        label: "Animali Domestici",
        kind: "expense",
        color: "text-amber-500 bg-amber-50",
        hexColor: "#f59e0b",
        iconName: "pawPrint",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.TECNOLOGIA,
        label: "Tecnologia & Gadget",
        kind: "expense",
        color: "text-indigo-500 bg-indigo-50",
        hexColor: "#6366f1",
        iconName: "laptop",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.REGALI,
        label: "Regali & Feste",
        kind: "expense",
        color: "text-pink-500 bg-pink-50",
        hexColor: "#ec4899",
        iconName: "gift",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.CASA_ARREDO,
        label: "Arredo & Design",
        kind: "expense",
        color: "text-teal-500 bg-teal-50",
        hexColor: "#14b8a6",
        iconName: "armchair",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.LIBRI_CULTURA,
        label: "Libri & Cultura",
        kind: "expense",
        color: "text-yellow-500 bg-yellow-50",
        hexColor: "#ca8a04",
        iconName: "bookOpen",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.GIARDINAGGIO,
        label: "Piante & Giardino",
        kind: "expense",
        color: "text-emerald-500 bg-emerald-50",
        hexColor: "#10b981",
        iconName: "flower",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.AUTO_MANUTENZIONE,
        label: "Manutenzione Auto/Moto",
        kind: "expense",
        color: "text-stone-600 bg-stone-100",
        hexColor: "#57534e",
        iconName: "wrench",
        spendingNature: "comfort",
        archived: false
    },
    {
        id: CategoryIds.ALTRO_COMFORT,
        label: "Altro Benessere",
        kind: "expense",
        color: "text-slate-500 bg-slate-50",
        hexColor: "#64748b",
        iconName: "helpCircle",
        spendingNature: "comfort",
        archived: false
    },

    // ==========================================
    // SPESE SUPERFLUE (Superfluous)
    // ==========================================
    {
        id: CategoryIds.SVAGO_EXTRA,
        label: "Divertimento & Movida",
        kind: "expense",
        color: "text-pink-600 bg-pink-100",
        hexColor: "#db2777",
        iconName: "gamepad2",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: CategoryIds.MICRO_DIGITALI,
        label: "Acquisti In-App & Digitale",
        kind: "expense",
        color: "text-sky-500 bg-sky-50",
        hexColor: "#0ea5e9",
        iconName: "smartphone",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: CategoryIds.LUSSO,
        label: "Lusso & Status",
        kind: "expense",
        color: "text-purple-500 bg-purple-50",
        hexColor: "#a855f7",
        iconName: "gem",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: CategoryIds.GIOCHI_SCOMMESSE,
        label: "Giochi & Scommesse",
        kind: "expense",
        color: "text-red-500 bg-red-50",
        hexColor: "#ef4444",
        iconName: "dice5",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: CategoryIds.EXTRA_IMPULSIVI,
        label: "Acquisti Impulsivi",
        kind: "expense",
        color: "text-orange-600 bg-orange-50",
        hexColor: "#ea580c",
        iconName: "zap",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: CategoryIds.TABACCO_VAPE,
        label: "Tabacco & Svapo",
        kind: "expense",
        color: "text-slate-600 bg-slate-100",
        hexColor: "#64748b",
        iconName: "cloud",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: CategoryIds.LOTTERIE,
        label: "Gratta e Vinci / Lotto",
        kind: "expense",
        color: "text-red-600 bg-red-100",
        hexColor: "#dc2626",
        iconName: "ticket",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: CategoryIds.ALCOOL_EXTRA,
        label: "Alcolici (Extra)",
        kind: "expense",
        color: "text-rose-800 bg-rose-100",
        hexColor: "#9f1239",
        iconName: "wine",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: CategoryIds.FAST_FOOD,
        label: "Fast Food",
        kind: "expense",
        color: "text-orange-700 bg-orange-100",
        hexColor: "#c2410c",
        iconName: "pizza",
        spendingNature: "superfluous",
        archived: false
    },
    {
        id: CategoryIds.ALTRO_SUPERFLUO,
        label: "Altro Superfluo",
        kind: "expense",
        color: "text-gray-500 bg-gray-50",
        hexColor: "#6b7280",
        iconName: "helpCircle",
        spendingNature: "superfluous",
        archived: false
    },

    // ==========================================
    // ENTRATE (Income)
    // ==========================================
    {
        id: CategoryIds.STIPENDIO,
        label: "Stipendio",
        kind: "income",
        color: "text-emerald-600 bg-emerald-100",
        hexColor: "#059669",
        iconName: "briefcase",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.PENSIONE,
        label: "Pensione",
        kind: "income",
        color: "text-teal-600 bg-teal-100",
        hexColor: "#0d9488",
        iconName: "user",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.FREELANCE,
        label: "Lavoro Extra / Freelance",
        kind: "income",
        color: "text-blue-600 bg-blue-100",
        hexColor: "#2563eb",
        iconName: "userCheck",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.BONUS_PREMI,
        label: "Bonus & Premi",
        kind: "income",
        color: "text-yellow-600 bg-yellow-100",
        hexColor: "#ca8a04",
        iconName: "badgeDollarSign",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.AFFITTI_PERCEPITI,
        label: "Affitti Percepiti",
        kind: "income",
        color: "text-indigo-600 bg-indigo-100",
        hexColor: "#4f46e5",
        iconName: "building2",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.INVESTIMENTI_PROFITTI,
        label: "Rendite & Cedole",
        kind: "income",
        color: "text-green-600 bg-green-100",
        hexColor: "#16a34a",
        iconName: "trendingUp",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.VENDITE_USATO,
        label: "Vendite & Seconda Mano",
        kind: "income",
        color: "text-lime-600 bg-lime-100",
        hexColor: "#65a30d",
        iconName: "recycle",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.RIMBORSI,
        label: "Rimborsi & Note Spese",
        kind: "income",
        color: "text-cyan-600 bg-cyan-100",
        hexColor: "#0891b2",
        iconName: "creditCard",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.REGALI_RICEVUTI,
        label: "Regali Ricevuti",
        kind: "income",
        color: "text-pink-600 bg-pink-100",
        hexColor: "#db2777",
        iconName: "gift",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.CASHBACK_PUNTI,
        label: "Cashback & Punti",
        kind: "income",
        color: "text-amber-600 bg-amber-100",
        hexColor: "#d97706",
        iconName: "coins",
        spendingNature: "essential",
        archived: false
    },
    {
        id: CategoryIds.ENTRATE_OCCASIONALI,
        label: "Entrate Occasionali",
        kind: "income",
        color: "text-purple-600 bg-purple-100",
        hexColor: "#9333ea",
        iconName: "trophy",
        spendingNature: "essential",
        archived: false
    },
];

// Group labels in Italian (Default UI labels)
export const CATEGORY_GROUP_LABELS: Record<CategoryGroupKey, string> = {
    essential: "Spese essenziali",
    comfort: "Spese per il benessere",
    superfluous: "Spese superflue",
    income: "Entrate"
}

// Order of groups in UI
export const CATEGORY_GROUP_ORDER: CategoryGroupKey[] = [
    "essential",
    "comfort",
    "superfluous",
    "income"
]

// Expense-only group order
export const EXPENSE_GROUP_ORDER: CategoryGroupKey[] = [
    "essential",
    "comfort",
    "superfluous"
]

// =====================
// ENRICHMENT RULES (CSV Patterns)
// =====================

export const CATEGORY_ENRICHMENT_RULES: Array<[string[], string]> = [
    [["netflix", "spotify", "disney", "youtube", "apple music", "prime video", "dazn"], CategoryIds.ABBONAMENTI],
    [["esselunga", "coop", "carrefour", "lidl", "conad", "unes", "aldi", "eurospin", "penny", "md", "supermercato"], CategoryIds.CIBO],
    [["enel", "a2a", "iren", "hera", "sorgenia", "acea", "eni gas"], CategoryIds.UTENZE],
    [["trenitalia", "italo", "flixbus", "uber", "taxi", "atm", "atac", "metro", "bus"], CategoryIds.TRASPORTI],
    [["paypal", "ebay", "zalando", "asos", "zara", "h&m"], CategoryIds.SHOPPING],
    [["farmacia", "medico", "ospedale", "ticket", "sanitario", "clinica"], CategoryIds.SALUTE_FARMACIA],
    [["deliveroo", "just eat", "glovo", "ristorante", "pizzeria", "trattoria", "sushi", "osteria"], CategoryIds.RISTORANTI],
    [["distributore", "q8", "esso", "ip", "eni", "tamoil", "benzina", "diesel", "carburante"], CategoryIds.AUTO_CARBURANTE],
    [["palestra", "fitness", "gym", "sport", "calcetto", "tennis"], CategoryIds.HOBBY_SPORT],
    [["assicurazione", "polizza", "generali", "allianz", "unipol", "unipolsai"], CategoryIds.ASSICURAZIONI],
    [["tim", "vodafone", "iliad", "fastweb", "windtre", "wind tre", "ho. mobile"], CategoryIds.TELEFONIA_INTERNET],
    [["bar", "caffe", "caffetteria", "pasticceria", "starbucks"], CategoryIds.BAR_CAFFE],
    [["amazon", "mediaworld", "apple", "unieuro", "eprice"], CategoryIds.TECNOLOGIA],
    [["mcdonald", "burger king", "kfc", "eats"], CategoryIds.FAST_FOOD],
    [["tabac", "iqos", "vapour", "smoke"], CategoryIds.TABACCO_VAPE],
    [["ikea", "maison du monde", "leroy merlin", "brico"], CategoryIds.CASA_ARREDO],
];
