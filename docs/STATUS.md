# Stato del Progetto & Architettura — LumaBudget

## Panoramica
LumaBudget è un'applicazione web di finanza personale costruita con Next.js (App Router).
I dati principali sono persistiti localmente via `localStorage` e accessibili tramite pattern repository.
React Query è utilizzato per caching, invalidazione e reattività della UI.

## Governance
**Regole di sviluppo**: Documentate in `SKILLS.md` (root del progetto).
- Financial Logic: Usare `lib/financial-math.ts` per tutti i calcoli
- UI Standards: Pattern consistenti (Sheet, Dialog, Tailwind)
- Git Workflow: Branch da `origin/main`, verifica pre-push

## Stato del Progetto (alto livello)
- Core (Dashboard / Transazioni / Budget): **Stabile**
- Insights: **Stable (v1.2.0)** — Analisi Trend & AI Advisor con UI Moderna.
- Settings: **Stable (v1.3.0)** — UI Refinements, Full Width Layout, Accessibilità.
- Simulatore: **Stable (v2.0.0)** — "What-If" Interattivo, Gruppi Espandibili, UI Premium.
- **Core Math**: **Standardized (v1.0)** — Libreria `financial-math.ts` centralizzata.

## Sezioni App
- **Dashboard**: Panoramica (entrate, uscite, saldo, budget residuo) + grafici.
- **Transazioni**: CRUD, filtri, export CSV, import CSV wizard.
- **Categorie**: Gestione completa (CRUD), icone personalizzate.
- **Budget**: Pianificazione mensile + spesa per gruppi.
- **Simulatore**: Analisi interattiva per ridurre le spese.
- **Insights**: Trend 12 mesi, AI Advisor, Analisi Mensile.
- **Impostazioni**: Preferenze, Backup/Restore, Tema.

## Flusso Dati & Persistenza
### Fonte di Verità
- **Repositories** leggono/scrivono su `localStorage`.
- **React Query hooks** forniscono stato UI reattivo e cachato.
- **Cross-tab sync**: Event listener globale resetta cache.

### Chiavi di Persistenza (v1)
Registro in `src/lib/storage-keys.ts`:
- `luma_transactions_v1`
- `luma_budget_plans_v1`
- `luma_categories_v1`
- `luma_settings_v1`

### Gestione Denaro
- Importi gestiti in **centesimi interi** (integer cents).
- `parseFloat` vietato su valori monetari.

## Main Query Keys
- `["transactions"]`
- `["budgets"]`
- `["settings"]`
- `["dashboard-summary"]`

## Note
- **Branching**: Feature branch da `origin/main`.
- **Seed Data**: Seed manuale (nessun auto-seed).
- **Regole**: Vedi `SKILLS.md` per tutte le convenzioni.

## Changelog Recente
| Data | Modulo | Cambiamento |
|------|--------|-------------|
| 2026-01-18 | Transactions | Added Date Selection (Quick Add + Edit) |
| 2026-01-18 | Flash | Refactored to use `financial-math.ts` |
| 2026-01-18 | DOE | Added §5 (Documentation Sync) and §6 (Continuous Improvement) |
| 2026-01-17 | Simulator | v2.0.0 - Expandable groups, real data, premium UI |
| 2026-01-17 | Core Math | v1.0 - Centralized `financial-math.ts` library |

