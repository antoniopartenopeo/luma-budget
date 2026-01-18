# Stato del Progetto & Architettura — LumaBudget

## Panoramica
LumaBudget è un'applicazione web di finanza personale costruita con Next.js (App Router).
I dati principali sono persistiti localmente via `localStorage` e accessibili tramite pattern repository.
React Query è utilizzato per caching, invalidazione e reattività della UI.

## Governance (Sistema DOE)
**Stato**: Attivo (v1.0.0-doe)
Il progetto è governato dal sistema **Directive, Orchestration, Execution (DOE)**.
- **Verifica**: `npm run doe:verify` è il gate obbligatorio per tutti i commit.
- **Regole**: Documentate in `docs/doe/directives/`.
- **Legacy**: Debito tecnico documentato in `docs/doe/legacy-registry.md`.

## Stato del Progetto (alto livello)
- Core (Dashboard / Transazioni / Budget): **Stabile**
- Insights: **Stable (v1.2.0)** — Analisi Trend & AI Advisor con UI Moderna (Glassmorphism/Card) + Analisi Mensile Orizzontale.
- Settings: **Stable (v1.3.0)** — UI Refinements (Mobile Toolbar, Consistent Icons/Titles), Full Width Layout, Accessibilità.
- Simulatore: **Stable (v2.0.0)** — "What-If" Interattivo e Dinamico. Supporto Gruppi Espandibili, Overrides Categoria, UI Premium Glassmorphism, Logica basata su dati reali (Ultimi 3/6/12 mesi).
- **Core Math**: **Standardized (v1.0)** — Libreria centralizzata `financial-math.ts` per calcoli critici (percentuali, growth, utilization), con 100% test coverage.

## Sezioni App
- **Dashboard**: Panoramica alto livello (entrate, uscite, saldo mensile, budget residuo) + grafici distribuzione categorie.
- **Transazioni**: CRUD, filtri (ricerca/tipo/categoria/periodo), export CSV.
- **Categorie**: Gestione completa (CRUD), separazione Entrate/Uscite, icone personalizzate, Virtual Join per renames.
- **Budget**: Pianificazione mensile (YYYY-MM) + spesa per gruppi (Essenziali / Comfort / Superfluo).
- **Simulatore**: Analisi interattiva per ridurre le spese basata su medie storiche (calcolo real-time, zero impatto sui dati).
- **Insights**: Visualizzazione trend su 12 mesi, AI Advisor avanzato, Analisi Mensile dettagliata (UI Card unificata).
- **Impostazioni**: Preferenze (Profilo, Tema, Valuta), Gestione Dati (Backup/Restore JSON), Tema.

## Flusso Dati & Persistenza
### Fonte di Verità (Source of truth)
- **Repositories** leggono/scrivono su `localStorage` ed espongono funzioni CRUD asincrone.
- **React Query hooks** chiamano i repository e forniscono stato UI reattivo e cachato.
- **Cross-tab sync**: Un event listener globale su `storage` resetta le cache in memoria e invalida le chiavi React Query.

### Chiavi di Persistenza (v1)
Registro definito in `src/lib/storage-keys.ts`:
- `luma_transactions_v1`: Record transazioni.
- `luma_budget_plans_v1`: Piani budget (per periodo).
- `luma_categories_v1`: Configurazione categorie personalizzate.
- `luma_settings_v1`: Preferenze app.

### Gestione Denaro
- Il parsing degli importi è centralizzato e robusto (supporto formati EU/US) e calcolato internamente usando **centesimi interi**.
- **Governance**: `parseFloat` è vietato nel nuovo codice (imposto da DOE verify).
- **Legacy**: L'uso esistente di float agisce come debito tecnico whitelistato.

## Main Query Keys
- `["transactions"]`
- `["budgets"]`
- `["settings"]`
- `["dashboard-summary"]`

## Note
- **Branching Policy**: I feature branch DEVONO partire da `origin/main` (vedi Governance). Usa `docs/doe/active-context.md` per tracciare lo scope.
- **Seed Data**: seed manuale (nessun auto-seed).
